package com.fitnessfranchise.backend.activity;

import java.time.LocalDateTime;

import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;

// Explicit opt-in: this test uses the configured PostgreSQL database.
// The row is rolled back, but PostgreSQL sequence values can be consumed.
@SpringBootTest
@Transactional
@EnabledIfEnvironmentVariable(named = "RUN_POSTGRES_TESTS", matches = "true")
@EnabledIfEnvironmentVariable(named = "DB_PASSWORD", matches = ".+")
class ActivityPostgresIntegrationTest {
    @Autowired
    private ActivityService service;
    @Autowired
    private ActivityRepository repository;
    @Autowired
    private EntityManager entityManager;

    @Test
    void insertsWithGeneratedIdAndReadsStoredFields() {
        ActivityRequest request = new ActivityRequest("TREADMILL", 20, 2.5,
                LocalDateTime.parse("2026-10-11T14:30:00"));

        Long id = service.save(request);
        entityManager.flush();
        entityManager.clear();

        assertThat(id).isNotNull();
        Activity stored = repository.findById(id).orElseThrow();
        assertThat(stored).hasFieldOrPropertyWithValue("equipmentType", request.equipmentType())
                .hasFieldOrPropertyWithValue("durationMinutes", request.durationMinutes())
                .hasFieldOrPropertyWithValue("distanceKm", request.distanceKm())
                .hasFieldOrPropertyWithValue("date", request.date());
    }
}
