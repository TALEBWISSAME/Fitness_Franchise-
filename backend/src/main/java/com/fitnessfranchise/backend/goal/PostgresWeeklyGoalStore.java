package com.fitnessfranchise.backend.goal;

import java.time.LocalDate;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class PostgresWeeklyGoalStore implements WeeklyGoalStore {
    private final JdbcTemplate jdbc;
    public PostgresWeeklyGoalStore(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    @Override public Optional<Integer> findTarget(Long ownerId, LocalDate weekStart) {
        return jdbc.query("SELECT target_sessions FROM public.weekly_goals WHERE adherent_id = ? AND week_start = ?",
                (rs, row) -> rs.getInt(1), ownerId, weekStart).stream().findFirst();
    }
    @Override public void setTarget(Long ownerId, LocalDate weekStart, int target) {
        // Atomic upsert uses Lamia's unique constraint; concurrent first writes cannot create duplicates.
        jdbc.update("""
                INSERT INTO public.weekly_goals (adherent_id, week_start, target_sessions)
                VALUES (?, ?, ?)
                ON CONFLICT (adherent_id, week_start)
                DO UPDATE SET target_sessions = EXCLUDED.target_sessions
                """, ownerId, weekStart, target);
    }
    @Override public long countSessions(Long ownerId, LocalDate weekStart) {
        return jdbc.queryForObject("""
                SELECT COUNT(*) FROM public.activities
                WHERE adherent_id = ? AND date >= ? AND date < ?
                """, Long.class, ownerId, weekStart.atStartOfDay(), weekStart.plusWeeks(1).atStartOfDay());
    }
}
