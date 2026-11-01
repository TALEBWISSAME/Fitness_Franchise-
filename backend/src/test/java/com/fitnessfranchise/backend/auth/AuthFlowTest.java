package com.fitnessfranchise.backend.auth;

import com.fitnessfranchise.backend.config.WebConfig;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.MediaType;
import java.util.Optional;
import static org.mockito.Mockito.*;
import static org.assertj.core.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = AuthController.class, properties = "fitness.auth.enabled=true")
@Import({WebConfig.class, AccountConfiguration.class, AuthErrors.class})
class AuthFlowTest {
    @Autowired MockMvc mvc;
    @Autowired PasswordEncoder encoder;
    @MockitoBean AccountStore store;
    private static final String BODY = "{\"email\":\"  A@EXAMPLE.TEST  \",\"password\":\"example-password\",\"displayName\":\" Compte A \"}";
    @BeforeEach void account() {
        when(store.findByEmail("a@example.test")).thenReturn(Optional.of(
            new AccountStore.Account(1L, "a@example.test", "Compte A", encoder.encode("example-password"))));
    }
    @Test void registersNormalizedAccountAndHashesPassword() throws Exception {
        when(store.findByEmail("a@example.test")).thenReturn(Optional.empty());
        when(store.create(eq("a@example.test"), eq("Compte A"), anyString())).thenAnswer(i -> {
            assertThat(encoder.matches("example-password", i.getArgument(2))).isTrue();
            return new AccountStore.Account(1L, i.getArgument(0), i.getArgument(1), i.getArgument(2));
        });
        mvc.perform(post("/api/auth/register").with(csrf()).contentType(MediaType.APPLICATION_JSON).content(BODY))
            .andExpect(status().isCreated()).andExpect(content().json("{\"id\":1,\"email\":\"a@example.test\",\"displayName\":\"Compte A\"}"))
            .andExpect(jsonPath("$.password").doesNotExist()).andExpect(jsonPath("$.passwordHash").doesNotExist());
    }
    @Test void duplicateEmailReturns409() throws Exception {
        mvc.perform(post("/api/auth/register").with(csrf()).contentType(MediaType.APPLICATION_JSON).content(BODY))
            .andExpect(status().isConflict());
        verify(store, never()).create(any(), any(), any());
    }
    @Test void concurrentDuplicateReturns409() throws Exception {
        when(store.findByEmail("a@example.test")).thenReturn(Optional.empty());
        when(store.create(any(), any(), any())).thenThrow(new AccountStore.DuplicateEmailException());
        mvc.perform(post("/api/auth/register").with(csrf()).contentType(MediaType.APPLICATION_JSON).content(BODY))
            .andExpect(status().isConflict());
    }
    @Test void persistenceConstraintFailureIsNotReportedAsAuthenticationFailure() throws Exception {
        when(store.findByEmail("a@example.test")).thenReturn(Optional.empty());
        when(store.create(any(), any(), any()))
            .thenThrow(new org.springframework.dao.DataIntegrityViolationException("database details"));
        mvc.perform(post("/api/auth/register").with(csrf()).contentType(MediaType.APPLICATION_JSON).content(BODY))
            .andExpect(status().isInternalServerError())
            .andExpect(content().json("{\"error\":\"PERSISTENCE_ERROR\"}"));
    }
    @Test void invalidRegistrationReturns400() throws Exception {
        for (String body : new String[] {"{}", BODY.replace("example-password", "short"), BODY.replace("A@EXAMPLE.TEST", "bad"), BODY.replace(" Compte A ", "   "), BODY.replace("example-password", "\u00e9".repeat(40))}) {
            mvc.perform(post("/api/auth/register").with(csrf()).contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest());
        }
        verify(store, never()).create(any(), any(), any());
    }
    @Test void loginProfileAndLogoutUseSession() throws Exception {
        var result = mvc.perform(post("/api/auth/login").with(csrf()).contentType(MediaType.APPLICATION_FORM_URLENCODED)
            .param("email", " A@EXAMPLE.TEST ").param("password", "example-password"))
            .andExpect(status().isOk()).andReturn();
        var session = (MockHttpSession) result.getRequest().getSession(false);
        assertThat(session).isNotNull();
        mvc.perform(get("/api/me").session(session).param("id", "999"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.passwordHash").doesNotExist());
        mvc.perform(post("/api/auth/logout").session(session).with(csrf())).andExpect(status().isNoContent());
        assertThat(session.isInvalid()).isTrue();
        mvc.perform(get("/api/me")).andExpect(status().isUnauthorized());
    }
    @Test void invalidLoginReturnsGeneric401() throws Exception {
        mvc.perform(post("/api/auth/login").with(csrf()).param("email", "a@example.test").param("password", "wrong"))
            .andExpect(status().isUnauthorized()).andExpect(content().json("{\"error\":\"INVALID_CREDENTIALS\"}"));
    }
    @Test void profileRequiresSession() throws Exception {
        mvc.perform(get("/api/me")).andExpect(status().isUnauthorized());
    }
    @Test void profileUpdateRequiresSessionAndCsrfAndUsesAuthenticatedAccount() throws Exception {
        mvc.perform(put("/api/me").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"city\":\"Paris\",\"gender\":\"Femme\",\"sportObjective\":\"Endurance\"}"))
            .andExpect(status().isUnauthorized());

        var login = mvc.perform(post("/api/auth/login").with(csrf())
            .param("email", "a@example.test").param("password", "example-password"))
            .andExpect(status().isOk()).andReturn();
        var session = (MockHttpSession) login.getRequest().getSession(false);
        var body = "{\"city\":\"Paris\",\"gender\":\"Femme\",\"sportObjective\":\"Endurance\",\"id\":999}";
        mvc.perform(put("/api/me").session(session).contentType(MediaType.APPLICATION_JSON).content(body))
            .andExpect(status().isForbidden());

        when(store.updateProfile("a@example.test", "Paris", "Femme", "Endurance")).thenReturn(
            new AccountStore.Account(1L, "a@example.test", "Compte A", "hash", "Paris", "Femme", "Endurance"));
        mvc.perform(put("/api/me").session(session).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(body))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.city").value("Paris"))
            .andExpect(jsonPath("$.gender").value("Femme"))
            .andExpect(jsonPath("$.sportObjective").value("Endurance"))
            .andExpect(jsonPath("$.passwordHash").doesNotExist());
        verify(store).updateProfile("a@example.test", "Paris", "Femme", "Endurance");

        clearInvocations(store);
        mvc.perform(put("/api/me").session(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"gender\":\"Unknown\"}"))
            .andExpect(status().isBadRequest())
            .andExpect(content().json("{\"error\":\"INVALID_REQUEST\"}"));
        verifyNoInteractions(store);
    }
    @Test void csrfIsExposedAndRequiredForWrites() throws Exception {
        mvc.perform(get("/api/auth/csrf")).andExpect(status().isOk())
            .andExpect(jsonPath("$.headerName").value("X-CSRF-TOKEN")).andExpect(jsonPath("$.token").isNotEmpty());
        for (String path : new String[] {"/api/auth/register", "/api/auth/login", "/api/auth/logout"}) {
            mvc.perform(post(path)).andExpect(status().isForbidden());
            mvc.perform(post(path).with(csrf().useInvalidToken())).andExpect(status().isForbidden());
        }
    }
    @Test void authenticatedProfileNeverUsesClientIdOrExposesHash() throws Exception {
        var result = mvc.perform(post("/api/auth/login").with(csrf())
            .param("email", "a@example.test").param("password", "example-password"))
            .andExpect(status().isOk()).andReturn();
        var session = (MockHttpSession) result.getRequest().getSession(false);
        var context = (org.springframework.security.core.context.SecurityContext)
            session.getAttribute("SPRING_SECURITY_CONTEXT");
        assertThat(context.getAuthentication().getAuthorities()).extracting("authority")
            .containsExactly("ROLE_MEMBER");
        when(store.findByEmail("a@example.test")).thenReturn(Optional.empty());
        mvc.perform(get("/api/me").session(session)).andExpect(status().isUnauthorized());
    }
    @Test void browserCsrfRoundTripAndRenewal() throws Exception {
        var mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        var initial = mvc.perform(get("/api/auth/csrf")).andExpect(status().isOk()).andReturn();
        var session = (MockHttpSession) initial.getRequest().getSession(false);
        var token = mapper.readTree(initial.getResponse().getContentAsString()).get("token").asText();
        mvc.perform(post("/api/auth/login").session(session).header("X-CSRF-TOKEN", token)
            .contentType(MediaType.APPLICATION_FORM_URLENCODED).param("email", "a@example.test")
            .param("password", "example-password")).andExpect(status().isOk());
        mvc.perform(post("/api/auth/logout").session(session).header("X-CSRF-TOKEN", token))
            .andExpect(status().isForbidden());
        var renewed = mvc.perform(get("/api/auth/csrf").session(session)).andReturn();
        var nextToken = mapper.readTree(renewed.getResponse().getContentAsString()).get("token").asText();
        mvc.perform(post("/api/auth/logout").session(session).header("X-CSRF-TOKEN", nextToken))
            .andExpect(status().isNoContent());
    }
    @Test void corsAllowsOnlyReactWithCredentials() throws Exception {
        mvc.perform(options("/api/auth/login").header("Origin", "http://localhost:5173")
            .header("Access-Control-Request-Method", "POST").header("Access-Control-Request-Headers", "content-type,x-csrf-token"))
            .andExpect(status().isOk()).andExpect(header().string("Access-Control-Allow-Credentials", "true"));
        mvc.perform(options("/api/auth/login").header("Origin", "https://other.test")
            .header("Access-Control-Request-Method", "POST")).andExpect(status().isForbidden());
    }
    @Test void unknownAccountAndOversizedPasswordReturnGeneric401() throws Exception {
        for (String[] credentials : new String[][] {
                {"unknown@example.test", "example-password"},
                {"a@example.test", "x".repeat(100)},
                {"a@example.test", ""}}) {
            mvc.perform(post("/api/auth/login").with(csrf())
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .param("email", credentials[0]).param("password", credentials[1]))
                .andExpect(status().isUnauthorized())
                .andExpect(content().json("{\"error\":\"INVALID_CREDENTIALS\"}"));
        }
    }
    @Test void loginChangesSessionIdAndErasesStoredCredentials() throws Exception {
        var session = new MockHttpSession();
        var oldId = session.getId();
        mvc.perform(post("/api/auth/login").session(session).with(csrf())
                .param("email", "a@example.test").param("password", "example-password"))
            .andExpect(status().isOk());
        assertThat(session.getId()).isNotEqualTo(oldId);
        var context = (org.springframework.security.core.context.SecurityContext)
                session.getAttribute("SPRING_SECURITY_CONTEXT");
        assertThat(context.getAuthentication().getCredentials()).isNull();
        assertThat(((org.springframework.security.core.userdetails.UserDetails)
                context.getAuthentication().getPrincipal()).getPassword()).isNull();
    }
    @Test void profileCannotBeCachedAndActualCorsRequestsAreChecked() throws Exception {
        mvc.perform(get("/api/auth/csrf").header("Origin", "http://localhost:5173"))
            .andExpect(status().isOk())
            .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"))
            .andExpect(header().string("Access-Control-Allow-Credentials", "true"))
            .andExpect(header().string("Cache-Control", org.hamcrest.Matchers.containsString("no-store")));
        mvc.perform(get("/api/me").header("Origin", "https://other.test"))
            .andExpect(status().isForbidden())
            .andExpect(header().doesNotExist("Access-Control-Allow-Origin"));
        mvc.perform(options("/api/auth/register").header("Origin", "http://localhost:5173")
                .header("Access-Control-Request-Method", "POST")
                .header("Access-Control-Request-Headers", "X-UNEXPECTED"))
            .andExpect(status().isForbidden());
    }
    @Test void clientCannotChooseRoleAndRegistrationDoesNotLogin() throws Exception {
        when(store.findByEmail("a@example.test")).thenReturn(Optional.empty());
        when(store.create(any(), any(), any())).thenAnswer(i ->
                new AccountStore.Account(1L, i.getArgument(0), i.getArgument(1), i.getArgument(2)));
        var session = new MockHttpSession();
        mvc.perform(post("/api/auth/register").session(session).with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(BODY.replace("}", ",\"role\":\"ADMIN\"}")))
            .andExpect(status().isCreated()).andExpect(jsonPath("$.role").doesNotExist());
        mvc.perform(get("/api/me").session(session)).andExpect(status().isUnauthorized());
    }

    @Test void malformedRegistrationReturnsSanitized400() throws Exception {
        mvc.perform(post("/api/auth/register").with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content("{\"password\":\"private-value\","))
            .andExpect(status().isBadRequest())
            .andExpect(content().json("{\"error\":\"INVALID_REGISTRATION\"}"));
        verify(store, never()).create(any(), any(), any());
    }
    @Test void secretFieldsAreNeverSerialized() throws Exception {
        var mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        var requestJson = mapper.writeValueAsString(new RegistrationRequest("a@example.test", "private-password", "A"));
        assertThat(mapper.readTree(requestJson).has("password")).isFalse();
        var accountJson = mapper.writeValueAsString(new AccountStore.Account(1L, "a@example.test", "A", "private-hash"));
        assertThat(accountJson).doesNotContain("private-hash", "passwordHash");
    }

}
