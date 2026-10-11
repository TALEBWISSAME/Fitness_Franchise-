
package com.fitnessfranchise.backend.activity;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/activities")
public class ActivityController {

    private final ActivityService activityService;

    public ActivityController(ActivityService activityService) {
        this.activityService = activityService;
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> createActivity(
            @Valid @RequestBody ActivityRequest activity) {

        activityService.save(activity);

        return ResponseEntity.status(HttpStatus.ACCEPTED).body(
            Map.of(
                "status", "ACCEPTED",
                "message", "Activite recue et validee"
            )
        );
    }
}
