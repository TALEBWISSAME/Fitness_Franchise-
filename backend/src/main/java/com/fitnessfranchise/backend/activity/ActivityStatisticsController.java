package com.fitnessfranchise.backend.activity;

import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/me")
public class ActivityStatisticsController {
    private final ActivityService service;

    public ActivityStatisticsController(ActivityService service) { this.service = service; }

    @GetMapping("/activity-summary")
    public DashboardResponse summary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) String equipmentType) {
        return service.getDashboard(from, to, equipmentType);
    }

    @GetMapping("/activity-trend")
    public ActivityTrendResponse trend(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) String equipmentType) {
        return service.getTrend(from, to, equipmentType);
    }
}
