package com.fitnessfranchise.backend.goal;

import com.fitnessfranchise.backend.auth.AccountStore;
import java.time.*;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import static org.mockito.Mockito.*;
import static org.assertj.core.api.Assertions.*;

class WeeklyGoalServiceTest {
    AccountStore accounts = mock(AccountStore.class);
    WeeklyGoalStore goals = mock(WeeklyGoalStore.class);
    LocalDate monday = LocalDate.parse("2026-10-26");
    Clock clock = Clock.fixed(Instant.parse("2026-10-25T23:30:00Z"), ZoneOffset.UTC);
    WeeklyGoalService service = new WeeklyGoalService(accounts, goals, clock);
    void account(String email, long id) {
        when(accounts.findByEmail(email)).thenReturn(Optional.of(new AccountStore.Account(id, email, "Test", "hash")));
    }
    @Test void noGoalReturnsExplicitEmptyStateAndParisWeek() {
        account("a", 1);
        var result = service.get("a");
        assertThat(result.weekStart()).isEqualTo(monday);
        assertThat(result.weekEnd()).isEqualTo(monday.plusDays(6));
        assertThat(result.targetSessions()).isNull();
        assertThat(result.completedSessions()).isZero();
        assertThat(result.progressPercent()).isZero();
        assertThat(result.achieved()).isFalse();
    }
    @Test void completionCanExceedTargetWhilePercentIsCapped() {
        account("a", 1);
        when(goals.countSessions(1L, monday)).thenReturn(5L);
        var result = service.set("a", 3);
        assertThat(result.completedSessions()).isEqualTo(5);
        assertThat(result.progressPercent()).isEqualTo(100);
        assertThat(result.achieved()).isTrue();
        verify(goals).setTarget(1L, monday, 3);
    }
    @Test void partialProgressAndTargetBoundaries() {
        account("a", 1);
        when(goals.findTarget(1L, monday)).thenReturn(Optional.of(4));
        when(goals.countSessions(1L, monday)).thenReturn(1L);
        assertThat(service.get("a").progressPercent()).isEqualTo(25);
        assertThat(service.get("a").achieved()).isFalse();
        service.set("a", 1);
        service.set("a", 14);
    }
    @Test void invalidTargetNeverWritesAndUnknownAccountIsRejected() {
        account("a", 1);
        for (int target : new int[] {0, -1, 15}) {
            assertThatThrownBy(() -> service.set("a", target))
                    .isInstanceOf(org.springframework.web.server.ResponseStatusException.class);
        }
        assertThatThrownBy(() -> service.get("unknown"))
                .isInstanceOf(org.springframework.web.server.ResponseStatusException.class);
        verifyNoInteractions(goals);
    }
    @Test void accountsAreIsolatedAndNewWeekDoesNotInheritTarget() {
        account("a", 1); account("b", 2);
        service.set("a", 3);
        assertThat(service.get("b").targetSessions()).isNull();
        var next = new WeeklyGoalService(accounts, goals, Clock.fixed(Instant.parse("2026-11-02T10:00:00Z"), ZoneOffset.UTC));
        assertThat(next.get("a").targetSessions()).isNull();
        verify(goals).findTarget(2L, monday);
        verify(goals).findTarget(1L, monday.plusWeeks(1));
        verify(goals, never()).setTarget(eq(1L), eq(monday.plusWeeks(1)), anyInt());
    }
}
