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

/** Prepared against the persistence port; requires Lamia's schema and a real adapter.
 * No SQL, schema generation, test account mock or automatic migrations here.
 * Transactions roll back rows; PostgreSQL identity sequences may advance.
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
    @Autowired MockMvc mvc;
    @Autowired AccountStore store;
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
}
