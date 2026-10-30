
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

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "adherent_id", nullable = true,
            foreignKey = @ForeignKey(name = "activities_adherent_fk"))
    private com.fitnessfranchise.backend.auth.Adherent adherent;

    protected Activity() {
        // Constructeur requis par JPA
    }

    public Activity(ActivityRequest request) {
        this.equipmentType = request.equipmentType();
        this.durationMinutes = request.durationMinutes();
        this.distanceKm = request.distanceKm();
        this.date = request.date();
    }

    public Activity(ActivityRequest request, com.fitnessfranchise.backend.auth.Adherent owner) {
        this(request);
        this.adherent = java.util.Objects.requireNonNull(owner, "Authenticated owner required");
    }

    @com.fasterxml.jackson.annotation.JsonIgnore
    public com.fitnessfranchise.backend.auth.Adherent getAdherent() { return adherent; }

    public Long getId() {
        return id;
    }

    public String getEquipmentType() {
        return equipmentType;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public Double getDistanceKm() {
        return distanceKm;
    }

    public LocalDateTime getDate() {
        return date;
    }
}
