package com.fitnessfranchise.backend.activity;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ActivityServiceTest {
    @Mock
    private ActivityRepository repository;

    @Test
    void readsActivitiesUsingDescendingDateAndIdOrder() {
        Activity recent = new Activity(new ActivityRequest("TREADMILL", 20, 2.5,
                LocalDateTime.parse("2026-10-11T14:30:00")));
        Activity older = new Activity(new ActivityRequest("TREADMILL", 15, 1.0,
                LocalDateTime.parse("2026-10-10T14:30:00")));
        when(repository.findAllByOrderByDateDescIdDesc()).thenReturn(List.of(recent, older));
        assertThat(new ActivityService(repository, java.util.Optional.empty(), java.util.Optional.empty()).findAll()).containsExactly(recent, older);
        verify(repository).findAllByOrderByDateDescIdDesc();
    }

    @Test
    void cannotSaveWithoutAuthenticatedOwner() {
        org.springframework.security.core.context.SecurityContextHolder.clearContext();
        ActivityRequest request = new ActivityRequest("TREADMILL", 20, 2.5,
                LocalDateTime.parse("2026-10-11T14:30:00"));
        org.assertj.core.api.Assertions.assertThatThrownBy(() ->
                new ActivityService(repository, java.util.Optional.empty(), java.util.Optional.empty()).save(request))
            .isInstanceOf(org.springframework.web.server.ResponseStatusException.class)
            .satisfies(ex -> assertThat(((org.springframework.web.server.ResponseStatusException) ex)
                .getStatusCode().value()).isEqualTo(401));
        org.mockito.Mockito.verifyNoInteractions(repository);
    }
    @Test
    void missingPersistenceNeverFallsBackToOwnerlessInsert() {
        var context = org.springframework.security.core.context.SecurityContextHolder.createEmptyContext();
        context.setAuthentication(org.springframework.security.authentication.UsernamePasswordAuthenticationToken
                .authenticated("a@example.test", null, java.util.List.of()));
        org.springframework.security.core.context.SecurityContextHolder.setContext(context);
        try {
            var accounts = mock(com.fitnessfranchise.backend.auth.AccountStore.class);
            when(accounts.findByEmail("a@example.test")).thenReturn(java.util.Optional.of(
                new com.fitnessfranchise.backend.auth.AccountStore.Account(1L, "a@example.test", "A", "hash")));
            var request = new ActivityRequest("TREADMILL", 20, 2.5, LocalDateTime.parse("2026-10-11T14:30:00"));
            for (var availableAccounts : java.util.List.of(java.util.Optional.<com.fitnessfranchise.backend.auth.AccountStore>empty(), java.util.Optional.of(accounts))) {
                org.assertj.core.api.Assertions.assertThatThrownBy(() ->
                        new ActivityService(repository, availableAccounts, java.util.Optional.empty()).save(request))
                    .isInstanceOf(org.springframework.web.server.ResponseStatusException.class)
                    .satisfies(ex -> assertThat(((org.springframework.web.server.ResponseStatusException) ex)
                        .getStatusCode().value()).isEqualTo(503));
            }
            org.mockito.Mockito.verifyNoInteractions(repository);
        } finally {
            org.springframework.security.core.context.SecurityContextHolder.clearContext();
        }
    }

}
