package com.fitnessfranchise.backend.activity;

import java.time.LocalDate;
import java.util.List;

public record ActivityTrendResponse(LocalDate from, LocalDate to, String timezone, List<Week> weeks) {
    public record Week(LocalDate weekStart, LocalDate weekEnd, long totalSessions, boolean partial) {}
}
