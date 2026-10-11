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
        assertThat(new ActivityService(repository).findAll()).containsExactly(recent, older);
        verify(repository).findAllByOrderByDateDescIdDesc();
    }

    @Test
    void savesRequestFieldsAndReturnsGeneratedId() {
        ActivityRequest request = new ActivityRequest("TREADMILL", 20, 2.5,
                LocalDateTime.parse("2026-10-11T14:30:00"));
        Activity savedActivity = mock(Activity.class);
        when(savedActivity.getId()).thenReturn(42L);
        when(repository.save(any(Activity.class))).thenReturn(savedActivity);

        Long id = new ActivityService(repository).save(request);

        ArgumentCaptor<Activity> entity = ArgumentCaptor.forClass(Activity.class);
        verify(repository).save(entity.capture());
        assertThat(id).isEqualTo(42L);
        assertThat(entity.getValue()).hasFieldOrPropertyWithValue("equipmentType", request.equipmentType())
                .hasFieldOrPropertyWithValue("durationMinutes", request.durationMinutes())
                .hasFieldOrPropertyWithValue("distanceKm", request.distanceKm())
                .hasFieldOrPropertyWithValue("date", request.date())
                .hasFieldOrPropertyWithValue("id", null);
    }
}
