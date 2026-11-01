package com.fitnessfranchise.backend.activity;

import java.util.Locale;
import java.util.Set;

final class ActivityRules {
    private static final Set<String> DISTANCE_EQUIPMENT_TYPES =
            Set.of("TREADMILL", "BIKE", "ELLIPTICAL", "ROWING");

    private ActivityRules() {
    }

    static boolean requiresDistance(String equipmentType) {
        return equipmentType != null
                && DISTANCE_EQUIPMENT_TYPES.contains(equipmentType.trim().toUpperCase(Locale.ROOT));
    }
}
