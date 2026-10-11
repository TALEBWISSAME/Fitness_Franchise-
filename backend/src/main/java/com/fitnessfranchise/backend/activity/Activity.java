
package com.fitnessfranchise.backend.activity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "activities", schema = "public")
public class Activity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "equipment_type", nullable = false, length = 50)
    private String equipmentType;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Column(name = "distance_km", nullable = false)
    private Double distanceKm;

    @Column(name = "date", nullable = false)
    private LocalDateTime date;

    protected Activity() {
        // Constructeur requis par JPA
    }

    public Activity(ActivityRequest request) {
        this.equipmentType = request.equipmentType();
        this.durationMinutes = request.durationMinutes();
        this.distanceKm = request.distanceKm();
        this.date = request.date();
    }

    public Long getId() {
        return id;
    }
}
