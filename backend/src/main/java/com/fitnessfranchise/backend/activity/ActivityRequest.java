
package com.fitnessfranchise.backend.activity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDateTime;

public record ActivityRequest(
    @Positive Long equipmentId,
    String equipmentType,
    @NotNull @Positive Integer durationMinutes,
    @DecimalMin("0.0") Double distanceKm,
    @NotNull LocalDateTime date
) {
    public ActivityRequest(String equipmentType, Integer durationMinutes, Double distanceKm, LocalDateTime date) {
        this(null, equipmentType, durationMinutes, distanceKm, date);
    }

    @AssertTrue(message = "Un identifiant ou un type d'équipement est obligatoire")
    @JsonIgnore
    public boolean isEquipmentReferencePresent() {
        return equipmentId != null || (equipmentType != null && !equipmentType.isBlank());
    }
}
