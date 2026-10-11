package com.fitnessfranchise.backend.activity;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.json.JsonCompareMode;
import org.springframework.test.web.servlet.MockMvc;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.test.util.ReflectionTestUtils;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ActivityController.class)
class ActivityControllerTest {
    @MockitoBean
    private ActivityService activityService;
    @Autowired
    private MockMvc mockMvc;

    @Test
    void returnsActivitiesWithAllFieldsInServiceOrder() throws Exception {
        Activity recent = new Activity(new ActivityRequest("TREADMILL", 20, 2.5,
                LocalDateTime.parse("2026-10-11T14:30:00")));
        Activity older = new Activity(new ActivityRequest("TREADMILL", 15, 1.0,
                LocalDateTime.parse("2026-10-10T14:30:00")));
        ReflectionTestUtils.setField(recent, "id", 2L);
        ReflectionTestUtils.setField(older, "id", 1L);
        when(activityService.findAll()).thenReturn(List.of(recent, older));
        mockMvc.perform(get("/api/activities").header("Origin", "http://localhost:5173"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"))
                .andExpect(content().json("""
                        [{"id":2,"equipmentType":"TREADMILL","durationMinutes":20,
                          "distanceKm":2.5,"date":"2026-10-11T14:30:00"},
                         {"id":1,"equipmentType":"TREADMILL","durationMinutes":15,
                          "distanceKm":1.0,"date":"2026-10-10T14:30:00"}]
                        """, JsonCompareMode.STRICT));
    }

    @Test
    void returnsEmptyArrayWhenNoActivitiesExist() throws Exception {
        when(activityService.findAll()).thenReturn(List.of());
        mockMvc.perform(get("/api/activities"))
                .andExpect(status().isOk())
                .andExpect(content().json("[]", JsonCompareMode.STRICT));
    }

    @ParameterizedTest
    @ValueSource(doubles = {2.5, 0.0})
    void acceptsValidActivity(double distance) throws Exception {
        mockMvc.perform(post("/api/activities")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"equipmentType":"TREADMILL","durationMinutes":20,
                                 "distanceKm":%s,"date":"2026-10-11T14:30:00"}
                                """.formatted(Double.toString(distance))))
                .andExpect(status().isAccepted())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(content().json("""
                        {"status":"ACCEPTED","message":"Activite recue et validee"}
                        """, JsonCompareMode.STRICT));
        verify(activityService).save(new ActivityRequest("TREADMILL", 20, distance,
                LocalDateTime.parse("2026-10-11T14:30:00")));
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "\"equipmentType\":\"\"", "\"equipmentType\":\"   \"", "\"equipmentType\":null",
            "\"durationMinutes\":0", "\"durationMinutes\":-1", "\"durationMinutes\":null",
            "\"distanceKm\":-0.1", "\"distanceKm\":null", "\"date\":null",
            "\"date\":\"invalid-date\""
    })
    void rejectsInvalidActivity(String invalidField) throws Exception {
        String validJson = """
                {"equipmentType":"TREADMILL","durationMinutes":20,
                 "distanceKm":2.5,"date":"2026-10-11T14:30:00"}
                """;
        String fieldName = invalidField.substring(0, invalidField.indexOf(':'));
        String invalidJson = validJson.replaceFirst(fieldName + ":(?:\"[^\"]*\"|[0-9.]+)", invalidField);
        mockMvc.perform(post("/api/activities")
                        .contentType(MediaType.APPLICATION_JSON).content(invalidJson))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(activityService);
    }

    @Test
    void rejectsMissingFields() throws Exception {
        mockMvc.perform(post("/api/activities")
                        .contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(activityService);
    }

    @Test
    void allowsReactPostPreflight() throws Exception {
        mockMvc.perform(options("/api/activities")
                        .header("Origin", "http://localhost:5173")
                        .header("Access-Control-Request-Method", "POST")
                        .header("Access-Control-Request-Headers", "content-type"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"))
                .andExpect(header().string("Access-Control-Allow-Methods", "GET,POST"));
    }

    @Test
    void rejectsOtherOrigins() throws Exception {
        mockMvc.perform(options("/api/activities")
                        .header("Origin", "http://localhost:3000")
                        .header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isForbidden())
                .andExpect(header().doesNotExist("Access-Control-Allow-Origin"));
    }
}
