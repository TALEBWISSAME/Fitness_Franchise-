package com.fitnessfranchise.backend.auth;

import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;
import static org.assertj.core.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** Real PostgreSQL tests using Lamia's schema and the JPA adapters.
 * No SQL, schema generation, test account mock or automatic migrations here.
 * Transactions roll back rows except the explicit commit test, which cleans up its own email.
 * PostgreSQL identity sequences may advance.
 */
@SpringBootTest(properties = {
    "fitness.auth.enabled=true",
    "spring.jpa.hibernate.ddl-auto=validate",
    "spring.datasource.url=${W01_TEST_DB_URL}",
    "spring.datasource.username=${W01_TEST_DB_USERNAME}",
    "spring.datasource.password=${W01_TEST_DB_PASSWORD}"})
@AutoConfigureMockMvc
@Transactional
@EnabledIfEnvironmentVariable(named = "RUN_W01_POSTGRES_TESTS", matches = "true")
@EnabledIfEnvironmentVariable(named = "W01_TEST_DB_URL",
    matches = "jdbc:postgresql://[^/]+/fitness_franchise_w01_test(?:\\?.*)?")
@EnabledIfEnvironmentVariable(named = "W01_TEST_DB_USERNAME", matches = ".+")
@EnabledIfEnvironmentVariable(named = "W01_TEST_DB_PASSWORD", matches = ".+")
class AccountPostgresIntegrationTest {
    @Test void personalQueryExcludesOtherOwnerAndLegacyAndHonorsInclusiveDates() {
        var owner = adherents.saveAndFlush(new Adherent("read-a-" + UUID.randomUUID() + "@example.test", "A", "hash"));
        var other = adherents.saveAndFlush(new Adherent("read-b-" + UUID.randomUUID() + "@example.test", "B", "hash"));
        var request = new com.fitnessfranchise.backend.activity.ActivityRequest("BIKE", 20, 2.5,
                java.time.LocalDateTime.parse("2026-10-11T23:59:59"));
        var own = activities.saveAndFlush(new com.fitnessfranchise.backend.activity.Activity(request, owner));
        activities.saveAndFlush(new com.fitnessfranchise.backend.activity.Activity(request, other));
        activities.saveAndFlush(new com.fitnessfranchise.backend.activity.Activity(request));
        activities.saveAndFlush(new com.fitnessfranchise.backend.activity.Activity(
                new com.fitnessfranchise.backend.activity.ActivityRequest("BIKE", 20, 2.5,
                        java.time.LocalDateTime.parse("2026-10-12T00:00:00")), owner));
        assertThat(activities.findMyActivitiesFiltered(owner.getId(),
                java.time.LocalDateTime.parse("2026-10-11T00:00:00"),
                java.time.LocalDateTime.parse("2026-10-12T00:00:00"), "BIKE"))
                .extracting(com.fitnessfranchise.backend.activity.Activity::getId).containsExactly(own.getId());
        assertThat(activities.findMyActivitiesFiltered(owner.getId(), null, null, "TREADMILL")).isEmpty();
    }
    @Test void weeklyGoalsPersistUpdateAndStayIsolated() throws Exception {
        String email = "goal-" + UUID.randomUUID() + "@example.test";
        var owner = store.create(email, "Goal", encoder.encode("example-password"));
        var monday = java.time.LocalDate.now(java.time.ZoneId.of("Europe/Paris"))
                .with(java.time.temporal.TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));
        jdbc.update("INSERT INTO public.weekly_goals (adherent_id, week_start, target_sessions) VALUES (?, ?, ?)",
                owner.id(), monday.minusWeeks(1), 7);
        var request = new com.fitnessfranchise.backend.activity.ActivityRequest("TREADMILL", 20, 2.5, monday.atStartOfDay());
        var ownerEntity = adherents.findById(owner.id()).orElseThrow();
        activities.saveAndFlush(new com.fitnessfranchise.backend.activity.Activity(request, ownerEntity));
        activities.saveAndFlush(new com.fitnessfranchise.backend.activity.Activity(request));
        activities.saveAndFlush(new com.fitnessfranchise.backend.activity.Activity(
                new com.fitnessfranchise.backend.activity.ActivityRequest("TREADMILL", 20, 2.5, monday.plusWeeks(1).atStartOfDay()), ownerEntity));
        var user = org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user(email);
        mvc.perform(get("/api/me/weekly-goal").with(user))
                .andExpect(status().isOk()).andExpect(jsonPath("$.targetSessions").isEmpty())
                .andExpect(jsonPath("$.completedSessions").value(1));
        for (int target : new int[] {3, 1}) {
            mvc.perform(put("/api/me/weekly-goal").with(user).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                    .content("{\"targetSessions\":" + target + "}"))
                    .andExpect(status().isOk()).andExpect(jsonPath("$.targetSessions").value(target));
        }
        mvc.perform(get("/api/me/weekly-goal").with(user)).andExpect(status().isOk())
                .andExpect(jsonPath("$.achieved").value(true)).andExpect(jsonPath("$.progressPercent").value(100));
        assertThat(jdbc.queryForObject("SELECT count(*) FROM public.weekly_goals WHERE adherent_id = ?", Long.class, owner.id())).isEqualTo(2);
        assertThat(jdbc.queryForObject("SELECT target_sessions FROM public.weekly_goals WHERE adherent_id = ? AND week_start = ?",
                Integer.class, owner.id(), monday.minusWeeks(1))).isEqualTo(7);
        var other = store.create("goal-b-" + UUID.randomUUID() + "@example.test", "Other", encoder.encode("example-password"));
        mvc.perform(get("/api/me/weekly-goal").with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user(other.email())))
                .andExpect(status().isOk()).andExpect(jsonPath("$.targetSessions").isEmpty())
                .andExpect(jsonPath("$.completedSessions").value(0));
    }
    @Autowired MockMvc mvc;
    @Autowired AccountStore store;
    @Autowired AdherentRepository adherents;
    @Autowired com.fitnessfranchise.backend.activity.ActivityRepository activities;
    @Autowired EntityManager entityManager;
    @Autowired JdbcTemplate jdbc;
    @Autowired org.springframework.security.crypto.password.PasswordEncoder encoder;
    @Test void registrationIsPersistedAndCanAuthenticate() throws Exception {
        assertThat(jdbc.execute((java.sql.Connection connection) ->
                connection.getMetaData().getDatabaseProductName())).isEqualTo("PostgreSQL");
        var email = "w01-" + UUID.randomUUID() + "@example.test";
        mvc.perform(post("/api/auth/register").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"" + email + "\",\"password\":\"example-password\",\"displayName\":\"Compte test\"}"))
            .andExpect(status().isCreated()).andExpect(jsonPath("$.passwordHash").doesNotExist());
        entityManager.flush();
        entityManager.clear();
        var saved = store.findByEmail(email).orElseThrow();
        assertThat(saved.id()).isNotNull();
        assertThat(saved.displayName()).isEqualTo("Compte test");
        var row = adherents.findById(saved.id()).orElseThrow();
        assertThat(row.getDisplayName()).isEqualTo("Compte test");
        assertThat(row.getRole()).isEqualTo("MEMBER");
        assertThat(encoder.matches("example-password", saved.passwordHash())).isTrue();
        var result = mvc.perform(post("/api/auth/login").with(csrf())
                .param("email", email).param("password", "example-password"))
            .andExpect(status().isOk()).andReturn();
        mvc.perform(get("/api/me").session((org.springframework.mock.web.MockHttpSession)
                result.getRequest().getSession(false)))
            .andExpect(status().isOk()).andExpect(jsonPath("$.email").value(email));
    }
    @Test void storeEnforcesUniqueEmailWithoutServicePrecheck() {
        var email = "w01-" + UUID.randomUUID() + "@example.test";
        var hash = encoder.encode("example-password");
        store.create(email, "Compte test", hash);
        entityManager.flush();
        assertThatThrownBy(() -> {
            store.create(email, "Autre compte", hash);
            entityManager.flush();
        }).isInstanceOf(AccountStore.DuplicateEmailException.class);
    }
    @Test void newActivitiesBelongToSessionAccountAndLegacyStaysUnassigned() throws Exception {
        var request = new com.fitnessfranchise.backend.activity.ActivityRequest("TREADMILL", 20, 2.5,
                java.time.LocalDateTime.parse("2026-10-11T14:30:00"));
        var legacy = activities.saveAndFlush(new com.fitnessfranchise.backend.activity.Activity(request));
        Long legacyId = legacy.getId();
        for (String name : new String[] {"A", "B"}) {
            var email = "w02-" + UUID.randomUUID() + "@example.test";
            var account = store.create(email, name, encoder.encode("example-password"));
            var login = mvc.perform(post("/api/auth/login").with(csrf())
                .param("email", email).param("password", "example-password"))
                .andExpect(status().isOk()).andReturn();
            mvc.perform(post("/api/activities").with(csrf())
                .session((org.springframework.mock.web.MockHttpSession) login.getRequest().getSession(false))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"equipmentType\":\"TREADMILL\",\"durationMinutes\":20,\"distanceKm\":2.5,\"date\":\"2026-10-11T14:30:00\",\"memberId\":" + legacyId + "}"))
                .andExpect(status().isAccepted());
            entityManager.flush();
            entityManager.clear();
            Long count = jdbc.queryForObject("select count(*) from public.activities where adherent_id = ?", Long.class, account.id());
            assertThat(count).isEqualTo(1L);
        }
        assertThat(activities.findById(legacyId).orElseThrow().getAdherent()).isNull();
        assertThat(jdbc.queryForObject("select adherent_id from public.activities where id = ?", Long.class, legacyId)).isNull();
    }

    @Test
    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.NOT_SUPPORTED)
    void committedRegistrationIsVisibleToSeparateLoginAndDuplicateIs409() throws Exception {
        var email = "w01-commit-" + UUID.randomUUID() + "@example.test";
        try {
            var body = "{\"email\":\"" + email + "\",\"password\":\"example-password\",\"displayName\":\"Wissame\",\"role\":\"ADMIN\"}";
            mvc.perform(post("/api/auth/register").with(csrf()).contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.displayName").value("Wissame"));
            assertThat(jdbc.queryForObject("select role from public.adherents where email = ?", String.class, email)).isEqualTo("MEMBER");
            assertThat(jdbc.queryForObject("select display_name from public.adherents where email = ?", String.class, email)).isEqualTo("Wissame");
            mvc.perform(post("/api/auth/register").with(csrf()).contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isConflict());
            mvc.perform(post("/api/auth/login").with(csrf()).param("email", email).param("password", "example-password"))
                .andExpect(status().isOk());
        } finally {
            jdbc.update("delete from public.adherents where email = ?", email);
        }
    }

}
