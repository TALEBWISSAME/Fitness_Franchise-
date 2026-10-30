package com.fitnessfranchise.backend.activity;

import com.fitnessfranchise.backend.auth.*;
import com.fitnessfranchise.backend.config.WebConfig;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;
import java.util.Optional;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = ActivityController.class, properties = "fitness.auth.enabled=true")
@Import({WebConfig.class, ActivityService.class, AccountConfiguration.class})
class ActivityOwnershipTest {
    @Autowired MockMvc mvc;
    @Autowired org.springframework.security.crypto.password.PasswordEncoder encoder;
    @MockitoBean ActivityRepository legacyRepository;
    @MockitoBean AccountStore accounts;
    @MockitoBean OwnedActivityStore ownedActivities;
    static final String BODY = "{\"equipmentType\":\"TREADMILL\",\"durationMinutes\":20,\"distanceKm\":2.5,\"date\":\"2026-10-11T14:30:00\",\"memberId\":999}";
    @BeforeEach void setup() {
        when(accounts.findByEmail("a@example.test")).thenReturn(Optional.of(
            new AccountStore.Account(1L, "a@example.test", "A", encoder.encode("example-password"))));
        when(accounts.findByEmail("b@example.test")).thenReturn(Optional.of(
            new AccountStore.Account(2L, "b@example.test", "B", encoder.encode("example-password"))));
        when(ownedActivities.save(any(), anyLong())).thenReturn(42L);
    }
    @Test void serverAssignsOwnerFromIdentityAndIgnoresMemberId() throws Exception {
        for (String email : new String[] {"a@example.test", "b@example.test"}) {
            mvc.perform(post("/api/activities").with(user(email)).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content(BODY))
                .andExpect(status().isAccepted())
                .andExpect(content().json("{\"status\":\"ACCEPTED\",\"message\":\"Activite recue et validee\"}"));
        }
        verify(ownedActivities).save(any(), eq(1L));
        verify(ownedActivities).save(any(), eq(2L));
        verify(ownedActivities, never()).save(any(), eq(999L));
        verifyNoInteractions(legacyRepository);
    }
    @Test void anonymousWithCsrfIsRejected() throws Exception {
        mvc.perform(post("/api/activities").with(csrf()).contentType(MediaType.APPLICATION_JSON).content(BODY))
            .andExpect(status().isUnauthorized());
        verifyNoInteractions(ownedActivities, legacyRepository);
    }
    @Test void missingOrInvalidCsrfIsRejectedEvenWhenAuthenticated() throws Exception {
        mvc.perform(post("/api/activities").with(user("a@example.test"))
            .contentType(MediaType.APPLICATION_JSON).content(BODY)).andExpect(status().isForbidden());
        mvc.perform(post("/api/activities").with(user("a@example.test")).with(csrf().useInvalidToken())
            .contentType(MediaType.APPLICATION_JSON).content(BODY)).andExpect(status().isForbidden());
        verifyNoInteractions(ownedActivities, legacyRepository);
    }
    @Test void unknownAccountCannotCreateActivity() throws Exception {
        mvc.perform(post("/api/activities").with(user("unknown@example.test")).with(csrf())
            .contentType(MediaType.APPLICATION_JSON).content(BODY)).andExpect(status().isUnauthorized());
        verifyNoInteractions(ownedActivities, legacyRepository);
    }
    @Test void invalidPayloadNeverReachesPersistence() throws Exception {
        mvc.perform(post("/api/activities").with(user("a@example.test")).with(csrf())
            .contentType(MediaType.APPLICATION_JSON).content(BODY.replace(":20", ":0")))
            .andExpect(status().isBadRequest());
        verifyNoInteractions(ownedActivities, legacyRepository);
    }
    @Test void actualLoginSessionDeterminesOwner() throws Exception {
        var result = mvc.perform(post("/api/auth/login").with(csrf())
            .contentType(MediaType.APPLICATION_FORM_URLENCODED)
            .param("email", "a@example.test").param("password", "example-password"))
            .andExpect(status().isOk()).andReturn();
        var session = (org.springframework.mock.web.MockHttpSession) result.getRequest().getSession(false);
        mvc.perform(post("/api/activities").session(session).with(csrf())
            .contentType(MediaType.APPLICATION_JSON).content(BODY)).andExpect(status().isAccepted());
        verify(ownedActivities).save(any(), eq(1L));
        verifyNoInteractions(legacyRepository);
    }

}
