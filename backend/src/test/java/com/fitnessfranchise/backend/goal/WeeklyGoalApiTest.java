package com.fitnessfranchise.backend.goal;

import com.fitnessfranchise.backend.config.WebConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(WeeklyGoalController.class)
@Import(WebConfig.class)
class WeeklyGoalApiTest {
    @Autowired MockMvc mvc;
    @MockitoBean WeeklyGoalService service;
    @Test void anonymousReadAndWriteAreRejected() throws Exception {
        mvc.perform(get("/api/me/weekly-goal")).andExpect(status().isUnauthorized());
        mvc.perform(put("/api/me/weekly-goal").with(csrf()).contentType("application/json")
                .content("{\"targetSessions\":3}")).andExpect(status().isUnauthorized());
        verifyNoInteractions(service);
    }
    @Test void writesRequireValidCsrf() throws Exception {
        mvc.perform(put("/api/me/weekly-goal").with(user("a")).contentType("application/json")
                .content("{\"targetSessions\":3}")).andExpect(status().isForbidden());
        mvc.perform(put("/api/me/weekly-goal").with(user("a")).with(csrf().useInvalidToken())
                .contentType("application/json").content("{\"targetSessions\":3}"))
                .andExpect(status().isForbidden());
        verifyNoInteractions(service);
    }
    @Test void validWriteUsesAuthenticatedIdentity() throws Exception {
        mvc.perform(put("/api/me/weekly-goal").with(user("a")).with(csrf()).contentType("application/json")
                .content("{\"targetSessions\":3,\"memberId\":999}"))
                .andExpect(status().isOk());
        verify(service).set("a", 3);
        mvc.perform(get("/api/me/weekly-goal").with(user("a"))).andExpect(status().isOk());
        verify(service).get("a");
    }
    @Test void invalidTargetsAreRejected() throws Exception {
        for (String body : new String[] {"{}", "{\"targetSessions\":null}", "{\"targetSessions\":0}",
                "{\"targetSessions\":15}", "{\"targetSessions\":3.5}", "{\"targetSessions\":\"3\"}", "{\"targetSessions\":\"bad\"}"}) {
            mvc.perform(put("/api/me/weekly-goal").with(user("a")).with(csrf())
                    .contentType("application/json").content(body)).andExpect(status().isBadRequest());
        }
        verifyNoInteractions(service);
    }
    @Test void reactCanPreflightPutWithCsrfHeader() throws Exception {
        mvc.perform(options("/api/me/weekly-goal").header("Origin", "http://localhost:5173")
                .header("Access-Control-Request-Method", "PUT")
                .header("Access-Control-Request-Headers", "content-type,x-csrf-token"))
                .andExpect(status().isOk()).andExpect(header().string("Access-Control-Allow-Credentials", "true"));
    }
}
