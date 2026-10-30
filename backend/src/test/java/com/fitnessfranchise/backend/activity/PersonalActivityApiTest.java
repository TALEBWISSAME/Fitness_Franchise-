package com.fitnessfranchise.backend.activity;

import com.fitnessfranchise.backend.auth.AccountStore;
import com.fitnessfranchise.backend.config.WebConfig;
import java.time.LocalDate;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest({ActivityController.class, ActivityStatisticsController.class})
@Import({WebConfig.class, ActivityService.class})
class PersonalActivityApiTest {
    @Autowired MockMvc mvc;
    @MockitoBean ActivityRepository repository;
    @MockitoBean AccountStore accounts;
    @MockitoBean OwnedActivityStore ownedActivities;

    @Test void allPersonalReadsRequireSession() throws Exception {
        for (String path : new String[] {"/api/activities", "/api/activities/dashboard",
                "/api/me/activity-summary", "/api/me/activity-trend"}) {
            mvc.perform(get(path)).andExpect(status().isUnauthorized());
        }
        verifyNoInteractions(repository, accounts);
    }
    @Test void summaryAndLegacyAliasApplyFilters() throws Exception {
        loginAccount();
        for (String path : new String[] {"/api/me/activity-summary", "/api/activities/dashboard"}) {
            mvc.perform(get(path).with(user("a@example.test"))
                    .param("from", "2026-10-07").param("to", "2026-10-20").param("equipmentType", "BIKE"))
                    .andExpect(status().isOk()).andExpect(jsonPath("$.totalSessions").value(0))
                    .andExpect(jsonPath("$.totalDurationMinutes").value(0))
                    .andExpect(jsonPath("$.totalDistanceKm").value(0));
        }
        verify(repository, times(2)).findMyActivitiesFiltered(7L, LocalDate.parse("2026-10-07").atStartOfDay(),
                LocalDate.parse("2026-10-21").atStartOfDay(), "BIKE");
    }
    @Test void trendSerializesWeekDatesCountsAndPartialFlags() throws Exception {
        loginAccount();
        mvc.perform(get("/api/me/activity-trend").with(user("a@example.test"))
                .param("from", "2026-10-07").param("to", "2026-10-20"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.timezone").value("Europe/Paris"))
                .andExpect(jsonPath("$.weeks.length()").value(3))
                .andExpect(jsonPath("$.weeks[0].weekStart").value("2026-10-05"))
                .andExpect(jsonPath("$.weeks[0].partial").value(true))
                .andExpect(jsonPath("$.weeks[1].totalSessions").value(0));
    }
    @Test void badFiltersReturn400OnEveryRoute() throws Exception {
        loginAccount();
        for (String path : new String[] {"/api/activities", "/api/me/activity-summary", "/api/me/activity-trend"}) {
            mvc.perform(get(path).with(user("a@example.test")).param("equipmentType", "UNKNOWN"))
                    .andExpect(status().isBadRequest());
            mvc.perform(get(path).with(user("a@example.test")).param("from", "2026-10-20").param("to", "2026-10-01"))
                    .andExpect(status().isBadRequest());
            mvc.perform(get(path).with(user("a@example.test")).param("from", "not-a-date"))
                    .andExpect(status().isBadRequest());
        }
        verifyNoInteractions(repository);
    }
    private void loginAccount() {
        when(accounts.findByEmail("a@example.test")).thenReturn(Optional.of(
                new AccountStore.Account(7L, "a@example.test", "A", "hash")));
    }
}
