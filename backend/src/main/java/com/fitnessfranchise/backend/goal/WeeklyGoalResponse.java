package com.fitnessfranchise.backend.goal;

import java.time.LocalDate;

public record WeeklyGoalResponse(LocalDate weekStart, LocalDate weekEnd, String timezone,
        Integer targetSessions, long completedSessions, double progressPercent, boolean achieved) {}
