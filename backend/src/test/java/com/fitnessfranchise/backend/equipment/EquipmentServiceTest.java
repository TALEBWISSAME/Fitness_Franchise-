package com.fitnessfranchise.backend.equipment;

import java.util.List;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class EquipmentServiceTest {
    @Test
    void mapsTheSortedRepositoryResultsToResponseDtos() {
        EquipmentRepository repository = mock(EquipmentRepository.class);
        when(repository.findAllByOrderByCategoryAscNameAsc()).thenReturn(List.of(
                new Equipment(4L, "Développé poitrine", "CHEST_PRESS", "upper-body"),
                new Equipment(2L, "Tapis de course", "TREADMILL", "cardio")));

        List<EquipmentResponse> result = new EquipmentService(repository).findAll();

        assertThat(result).containsExactly(
                new EquipmentResponse(4L, "Développé poitrine", "CHEST_PRESS", "upper-body"),
                new EquipmentResponse(2L, "Tapis de course", "TREADMILL", "cardio"));
        verify(repository).findAllByOrderByCategoryAscNameAsc();
    }
}
