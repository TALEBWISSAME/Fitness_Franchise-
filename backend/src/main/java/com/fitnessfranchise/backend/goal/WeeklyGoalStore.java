package com.fitnessfranchise.backend.goal;

import java.time.LocalDate;
import java.util.Optional;

public interface WeeklyGoalStore {
    Optional<Integer> findTarget(Long ownerId, LocalDate weekStart);
    void setTarget(Long ownerId, LocalDate weekStart, int target);
    long countSessions(Long ownerId, LocalDate weekStart);
}
