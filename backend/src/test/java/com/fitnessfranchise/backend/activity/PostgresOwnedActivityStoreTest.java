package com.fitnessfranchise.backend.activity;

import com.fitnessfranchise.backend.auth.Adherent;
import com.fitnessfranchise.backend.auth.AdherentRepository;
import com.fitnessfranchise.backend.equipment.Equipment;
import com.fitnessfranchise.backend.equipment.EquipmentRepository;
import java.time.LocalDateTime;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class PostgresOwnedActivityStoreTest {
    private final ActivityRepository activities = mock(ActivityRepository.class);
    private final AdherentRepository accounts = mock(AdherentRepository.class);
    private final EquipmentRepository equipmentRepository = mock(EquipmentRepository.class);
    private final PostgresOwnedActivityStore store =
            new PostgresOwnedActivityStore(activities, accounts, equipmentRepository);
    private final Adherent owner = new Adherent("member@example.test", "Member", "hash");
    private final LocalDateTime date = LocalDateTime.parse("2026-10-11T14:30:00");

    @BeforeEach
    void setup() {
        when(accounts.findById(7L)).thenReturn(Optional.of(owner));
        when(activities.saveAndFlush(any(Activity.class))).thenAnswer(invocation -> {
            Activity activity = invocation.getArgument(0);
            ReflectionTestUtils.setField(activity, "id", 42L);
            return activity;
        });
    }

    @Test
    void resolvesAndPersistsCatalogEquipmentAndItsType() {
        Equipment treadmill = new Equipment(3L, "Tapis", "TREADMILL", "cardio");
        when(equipmentRepository.findById(3L)).thenReturn(Optional.of(treadmill));

        Long id = store.save(new ActivityRequest(3L, null, 30, 4.2, date), 7L);

        assertThat(id).isEqualTo(42L);
        Activity saved = savedActivity();
        assertThat(saved.getEquipmentId()).isEqualTo(3L);
        assertThat(saved.getEquipmentType()).isEqualTo("TREADMILL");
        assertThat(saved.getDistanceKm()).isEqualTo(4.2);
        assertThat(saved.getAdherent()).isSameAs(owner);
    }

    @Test
    void requiresDistanceForAllDistanceBasedEquipment() {
        for (String type : new String[] {"TREADMILL", "BIKE", "ELLIPTICAL", "ROWING"}) {
            when(equipmentRepository.findById(3L))
                    .thenReturn(Optional.of(new Equipment(3L, "Machine", type, "cardio")));
            assertBadRequest(() -> store.save(new ActivityRequest(3L, null, 30, null, date), 7L));
        }
        verify(activities, never()).saveAndFlush(any());
    }

    @Test
    void storesNullDistanceForNonDistanceEquipmentEvenIfClientSendsOne() {
        when(equipmentRepository.findById(16L))
                .thenReturn(Optional.of(new Equipment(16L, "Presse", "LEG_PRESS", "lower-body")));

        store.save(new ActivityRequest(16L, null, 30, 2.5, date), 7L);

        assertThat(savedActivity().getEquipmentId()).isEqualTo(16L);
        assertThat(savedActivity().getEquipmentType()).isEqualTo("LEG_PRESS");
        assertThat(savedActivity().getDistanceKm()).isNull();
    }

    @Test
    void rejectsUnknownOrMismatchedEquipment() {
        when(equipmentRepository.findById(404L)).thenReturn(Optional.empty());
        when(equipmentRepository.findById(3L))
                .thenReturn(Optional.of(new Equipment(3L, "Tapis", "TREADMILL", "cardio")));

        assertBadRequest(() -> store.save(new ActivityRequest(404L, null, 20, 1.0, date), 7L));
        assertBadRequest(() -> store.save(new ActivityRequest(3L, "BIKE", 20, 1.0, date), 7L));
        verify(activities, never()).saveAndFlush(any());
    }

    @Test
    void legacyTypePayloadRemainsSupportedWithoutCatalogAssociation() {
        store.save(new ActivityRequest("TREADMILL", 20, 2.5, date), 7L);

        Activity saved = savedActivity();
        assertThat(saved.getEquipmentId()).isNull();
        assertThat(saved.getEquipmentType()).isEqualTo("TREADMILL");
        assertThat(saved.getDistanceKm()).isEqualTo(2.5);
        verifyNoInteractions(equipmentRepository);
    }

    @Test
    void legacyPayloadStillRequiresItsHistoricalDistance() {
        assertBadRequest(() -> store.save(new ActivityRequest("TREADMILL", 20, null, date), 7L));
        verify(activities, never()).saveAndFlush(any());
    }

    @Test
    void legacyTypePayloadDropsDistanceForNonDistanceEquipment() {
        store.save(new ActivityRequest("LEG_PRESS", 20, 2.5, date), 7L);

        assertThat(savedActivity().getEquipmentType()).isEqualTo("LEG_PRESS");
        assertThat(savedActivity().getDistanceKm()).isNull();
        verifyNoInteractions(equipmentRepository);
    }

    @Test
    void rejectsMissingAuthenticatedOwner() {
        assertThatThrownBy(() -> store.save(new ActivityRequest("TREADMILL", 20, 2.5, date), null))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        exception -> assertThat(exception.getStatusCode().value()).isEqualTo(401));
        verifyNoInteractions(accounts, equipmentRepository, activities);
    }

    private Activity savedActivity() {
        var captor = org.mockito.ArgumentCaptor.forClass(Activity.class);
        verify(activities).saveAndFlush(captor.capture());
        return captor.getValue();
    }

    private static void assertBadRequest(Runnable action) {
        assertThatThrownBy(action::run).isInstanceOfSatisfying(ResponseStatusException.class,
                exception -> assertThat(exception.getStatusCode().value()).isEqualTo(400));
    }
}
