package com.fitnessfranchise.backend.activity;

import com.fitnessfranchise.backend.auth.AccountStore;
import java.time.*;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional(readOnly = true)
public class ActivityService {
    private final ActivityRepository repository;
    private final Optional<AccountStore> accounts;
    private final Optional<OwnedActivityStore> ownedActivities;
    private final Clock clock;
    // LocalDateTime database values follow the Europe/Paris demo convention.
    private static final ZoneId DEMO_ZONE = ZoneId.of("Europe/Paris");
    private static final Set<String> EQUIPMENT_TYPES = Set.of("TREADMILL", "BIKE", "ELLIPTICAL");

    @org.springframework.beans.factory.annotation.Autowired
    public ActivityService(ActivityRepository repository, Optional<AccountStore> accounts,
                           Optional<OwnedActivityStore> ownedActivities) {
        this(repository, accounts, ownedActivities, Clock.system(DEMO_ZONE));
    }

    ActivityService(ActivityRepository repository, Optional<AccountStore> accounts,
                    Optional<OwnedActivityStore> ownedActivities, Clock clock) {
        this.repository = repository;
        this.accounts = accounts;
        this.ownedActivities = ownedActivities;
        this.clock = clock;
    }

    // Legacy internal reader; never exposed by the personal API.
    public List<Activity> findAll() {
        return repository.findAllByOrderByDateDescIdDesc();
    }

    private Long currentOwnerId() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        var store = accounts.orElseThrow(() -> new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE));
        var owner = store.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        if (owner.id() == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        return owner.id();
    }

    private void validateFilters(LocalDate from, LocalDate to, String equipmentType) {
        if (from != null && to != null && from.isAfter(to)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La date de debut doit preceder la date de fin");
        }
        if (to != null && to.equals(LocalDate.MAX)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Date de fin hors limites");
        }
        if (equipmentType != null && !EQUIPMENT_TYPES.contains(equipmentType)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Type inconnu : TREADMILL, BIKE ou ELLIPTICAL attendu");
        }
    }

    public List<Activity> findMyActivities(LocalDate from, LocalDate to, String equipmentType) {
        Long ownerId = currentOwnerId();
        validateFilters(from, to, equipmentType);
        return repository.findMyActivitiesFiltered(ownerId,
                from == null ? null : from.atStartOfDay(),
                to == null ? null : to.plusDays(1).atStartOfDay(), equipmentType);
    }

    @Transactional
    public Long save(ActivityRequest request) {
        Long ownerId = currentOwnerId();
        var store = ownedActivities.orElseThrow(() -> new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE));
        return store.save(request, ownerId);
    }

    public DashboardResponse getDashboard() {
        return getDashboard(null, null, null);
    }

    public DashboardResponse getDashboard(LocalDate from, LocalDate to, String equipmentType) {
        var activities = findMyActivities(from, to, equipmentType);
        return new DashboardResponse(activities.size(),
                activities.stream().mapToLong(Activity::getDurationMinutes).sum(),
                activities.stream().mapToDouble(Activity::getDistanceKm).sum());
    }

    public ActivityTrendResponse getTrend(LocalDate from, LocalDate to, String equipmentType) {
        var monday = LocalDate.now(clock.withZone(DEMO_ZONE))
                .with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate start = from == null ? monday.minusWeeks(3) : from;
        LocalDate end = to == null ? monday.plusDays(6) : to;
        // Bound output size, including explicitly requested long histories.
        if (start.isBefore(LocalDate.of(1, 1, 1)) || end.isAfter(LocalDate.of(9999, 12, 31))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Periode hors limites");
        }
        LocalDate firstMonday = start.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        if (java.time.temporal.ChronoUnit.WEEKS.between(firstMonday, end) > 520) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Periode limitee a dix ans");
        }
        var activities = findMyActivities(start, end, equipmentType);
        Map<LocalDate, Long> counts = new HashMap<>();
        for (var activity : activities) {
            var week = activity.getDate().toLocalDate()
                    .with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            counts.merge(week, 1L, Long::sum);
        }
        List<ActivityTrendResponse.Week> weeks = new ArrayList<>();
        for (LocalDate week = firstMonday; !week.isAfter(end); week = week.plusWeeks(1)) {
            LocalDate weekEnd = week.plusDays(6);
            weeks.add(new ActivityTrendResponse.Week(week, weekEnd, counts.getOrDefault(week, 0L),
                    week.isBefore(start) || weekEnd.isAfter(end)));
        }
        return new ActivityTrendResponse(start, end, DEMO_ZONE.getId(), List.copyOf(weeks));
    }
}
