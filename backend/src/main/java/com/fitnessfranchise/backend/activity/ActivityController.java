package com.fitnessfranchise.backend.activity;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/activities")
public class ActivityController {
    private final ActivityService activityService;

    public ActivityController(ActivityService activityService) {
        this.activityService = activityService;
    }

    @GetMapping
    public List<Activity> getActivities(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) String equipmentType) {
        return activityService.findMyActivities(from, to, equipmentType);
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> createActivity(@Valid @RequestBody ActivityRequest activity) {
        activityService.save(activity);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(Map.of(
                "status", "ACCEPTED", "message", "Activite recue et validee"));
    }

    // Compatibility alias for the first dashboard implementation.
    @GetMapping("/dashboard")
    public DashboardResponse getDashboard(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) String equipmentType) {
        return activityService.getDashboard(from, to, equipmentType);
    }
}
