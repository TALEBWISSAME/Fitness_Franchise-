package com.fitnessfranchise.backend.auth;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Optional profile preferences. The authenticated session determines the account. */
public record ProfileUpdateRequest(
    @Size(max = 100) String city,
    @Pattern(regexp = "^(Femme|Homme|Autre|Préfère ne pas répondre)?$") String gender,
    @Pattern(regexp = "^(Remise en forme|Endurance|Renforcement musculaire|Mobilité|Bien-être)?$") String sportObjective
) {}
