package com.fitnessfranchise.backend.activity;

public record DashboardResponse(
        long totalSessions,
        long totalDurationMinutes,
        double totalDistanceKm
) {
}