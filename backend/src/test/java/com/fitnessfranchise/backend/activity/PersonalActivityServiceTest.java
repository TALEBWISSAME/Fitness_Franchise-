package com.fitnessfranchise.backend.activity;

import com.fitnessfranchise.backend.auth.AccountStore;
import java.time.*;
import java.util.*;
import org.junit.jupiter.api.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class PersonalActivityServiceTest {
    ActivityRepository repository = mock(ActivityRepository.class);
    AccountStore accounts = mock(AccountStore.class);
    ActivityService service = new ActivityService(repository, Optional.of(accounts), Optional.empty(),
            Clock.fixed(Instant.parse("2026-10-25T23:30:00Z"), ZoneOffset.UTC));

    @BeforeEach void login() {
        SecurityContextHolder.getContext().setAuthentication(
                UsernamePasswordAuthenticationToken.authenticated("a@example.test", null, List.of()));
        when(accounts.findByEmail("a@example.test")).thenReturn(Optional.of(
                new AccountStore.Account(7L, "a@example.test", "A", "hash")));
    }
    @AfterEach void cleanup() { SecurityContextHolder.clearContext(); }

    @Test void filtersUseOwnerAndInclusiveDays() {
        var from = LocalDate.parse("2026-10-01");
        var to = LocalDate.parse("2026-10-25");
        service.findMyActivities(from, to, "BIKE");
        verify(repository).findMyActivitiesFiltered(7L, from.atStartOfDay(), to.plusDays(1).atStartOfDay(), "BIKE");
        verify(repository, never()).findAllByOrderByDateDescIdDesc();
    }
    @Test void changingAccountChangesQueryOwner() {
        service.findMyActivities(null, null, null);
        SecurityContextHolder.getContext().setAuthentication(
                UsernamePasswordAuthenticationToken.authenticated("b@example.test", null, List.of()));
        when(accounts.findByEmail("b@example.test")).thenReturn(Optional.of(
                new AccountStore.Account(8L, "b@example.test", "B", "hash")));
        service.findMyActivities(null, null, null);
        verify(repository).findMyActivitiesFiltered(7L, null, null, null);
        verify(repository).findMyActivitiesFiltered(8L, null, null, null);
    }
    @Test void invalidFiltersAreRejectedBeforeQuery() {
        assertBadRequest(() -> service.findMyActivities(LocalDate.parse("2026-10-02"), LocalDate.parse("2026-10-01"), null));
        for (String type : List.of("", " ", "UNKNOWN")) {
            assertBadRequest(() -> service.findMyActivities(null, null, type));
        }
        assertBadRequest(() -> service.findMyActivities(null, LocalDate.MAX, null));
        verifyNoInteractions(repository);
    }
    @Test void anonymousCannotReadOrCalculateStatistics() {
        SecurityContextHolder.clearContext();
        for (Runnable action : List.<Runnable>of(() -> service.findMyActivities(null, null, null),
                () -> service.getDashboard(), () -> service.getTrend(null, null, null))) {
            assertThatThrownBy(action::run).isInstanceOfSatisfying(ResponseStatusException.class,
                    ex -> assertThat(ex.getStatusCode().value()).isEqualTo(401));
        }
        verifyNoInteractions(repository);
    }
    @Test void summaryUsesSameFiltersAndReturnsZerosForEmptyAccount() {
        when(repository.findMyActivitiesFiltered(7L, null, null, "BIKE"))
                .thenReturn(List.of(activity("2026-10-05T10:00:00", 20, 2.5), activity("2026-10-06T10:00:00", 30, 4.0)));
        assertThat(service.getDashboard(null, null, "BIKE")).isEqualTo(new DashboardResponse(2, 50, 6.5));
        assertThat(service.getDashboard(null, null, "TREADMILL")).isEqualTo(new DashboardResponse(0, 0, 0));
    }
    @Test void defaultWeeksFollowParisMondayEvenWhenUtcIsSundayAndIncludeZeros() {
        when(repository.findMyActivitiesFiltered(7L, LocalDateTime.parse("2026-10-05T00:00:00"),
                LocalDateTime.parse("2026-11-02T00:00:00"), null))
                .thenReturn(List.of(activity("2026-10-11T23:59:59", 20, 2), activity("2026-10-12T00:00:00", 20, 2)));
        var result = service.getTrend(null, null, null);
        assertThat(result.timezone()).isEqualTo("Europe/Paris");
        assertThat(result.weeks()).extracting(ActivityTrendResponse.Week::totalSessions).containsExactly(1L, 1L, 0L, 0L);
        assertThat(result.weeks()).allMatch(week -> !week.partial());
    }
    @Test void explicitRangeMarksPartialWeeksAndKeepsEmptyWeek() {
        var result = service.getTrend(LocalDate.parse("2026-10-07"), LocalDate.parse("2026-10-20"), "BIKE");
        assertThat(result.weeks()).extracting(ActivityTrendResponse.Week::partial).containsExactly(true, false, true);
        assertThat(result.weeks()).extracting(ActivityTrendResponse.Week::totalSessions).containsExactly(0L, 0L, 0L);
        verify(repository).findMyActivitiesFiltered(7L, LocalDateTime.parse("2026-10-07T00:00:00"),
                LocalDateTime.parse("2026-10-21T00:00:00"), "BIKE");
    }
    private static Activity activity(String date, int duration, double distance) {
        return new Activity(new ActivityRequest("BIKE", duration, distance, LocalDateTime.parse(date)));
    }
    private static void assertBadRequest(Runnable action) {
        assertThatThrownBy(action::run).isInstanceOfSatisfying(ResponseStatusException.class,
                ex -> assertThat(ex.getStatusCode().value()).isEqualTo(400));
    }
}
