
package com.fitnessfranchise.backend.activity;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDateTime;

public record ActivityRequest(
    @NotBlank String equipmentType,
    @NotNull @Positive Integer durationMinutes,
    @NotNull @DecimalMin("0.0") Double distanceKm,
    @NotNull LocalDateTime date
) {}
