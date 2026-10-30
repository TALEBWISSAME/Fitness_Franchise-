package com.fitnessfranchise.backend.goal;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/me/weekly-goal")
public class WeeklyGoalController {
    private final WeeklyGoalService service;
    public WeeklyGoalController(WeeklyGoalService service) { this.service = service; }

    @GetMapping public WeeklyGoalResponse get(Authentication authentication) {
        return service.get(authentication.getName());
    }
    @PutMapping public WeeklyGoalResponse set(Authentication authentication, @Valid @RequestBody TargetRequest request) {
        return service.set(authentication.getName(), request.targetSessions());
    }
    public record TargetRequest(@NotNull @Min(1) @Max(14)
            @com.fasterxml.jackson.databind.annotation.JsonDeserialize(using = IntegerTargetDeserializer.class)
            Integer targetSessions) {}

    public static class IntegerTargetDeserializer extends com.fasterxml.jackson.databind.JsonDeserializer<Integer> {
        @Override public Integer deserialize(com.fasterxml.jackson.core.JsonParser parser,
                com.fasterxml.jackson.databind.DeserializationContext context) throws java.io.IOException {
            if (!parser.isExpectedNumberIntToken()) {
                return (Integer) context.handleUnexpectedToken(Integer.class, parser);
            }
            return parser.getIntValue();
        }
    }
}
