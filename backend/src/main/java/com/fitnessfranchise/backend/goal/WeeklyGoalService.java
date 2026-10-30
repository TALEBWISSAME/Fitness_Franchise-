package com.fitnessfranchise.backend.goal;

import com.fitnessfranchise.backend.auth.AccountStore;
import java.time.*;
import java.time.temporal.TemporalAdjusters;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional(readOnly = true)
public class WeeklyGoalService {
    private static final ZoneId ZONE = ZoneId.of("Europe/Paris");
    private final AccountStore accounts;
    private final WeeklyGoalStore goals;
    private final Clock clock;

    @org.springframework.beans.factory.annotation.Autowired
    public WeeklyGoalService(AccountStore accounts, WeeklyGoalStore goals) {
        this(accounts, goals, Clock.system(ZONE));
    }
    WeeklyGoalService(AccountStore accounts, WeeklyGoalStore goals, Clock clock) {
        this.accounts = accounts;
        this.goals = goals;
        this.clock = clock;
    }
    private Long ownerId(String email) {
        if (email == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        var owner = accounts.findByEmail(email).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        if (owner.id() == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        return owner.id();
    }
    private LocalDate currentWeek() {
        return LocalDate.now(clock.withZone(ZONE)).with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
    }
    public WeeklyGoalResponse get(String email) {
        Long owner = ownerId(email);
        LocalDate week = currentWeek();
        return response(owner, week, goals.findTarget(owner, week).orElse(null));
    }
    @Transactional
    public WeeklyGoalResponse set(String email, int target) {
        Long owner = ownerId(email);
        if (target < 1 || target > 14) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cible attendue entre 1 et 14");
        LocalDate week = currentWeek();
        goals.setTarget(owner, week, target);
        return response(owner, week, target);
    }
    private WeeklyGoalResponse response(Long owner, LocalDate week, Integer target) {
        long completed = goals.countSessions(owner, week);
        return new WeeklyGoalResponse(week, week.plusDays(6), ZONE.getId(), target, completed,
                target == null ? 0 : Math.min(100.0, completed * 100.0 / target),
                target != null && completed >= target);
    }
}
