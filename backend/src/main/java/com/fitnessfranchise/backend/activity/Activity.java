
package com.fitnessfranchise.backend.activity;

import com.fitnessfranchise.backend.equipment.Equipment;
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

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "equipment_id", nullable = true,
            foreignKey = @ForeignKey(name = "activities_equipment_fk"))
    private Equipment equipment;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Column(name = "distance_km")
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
        this(request, owner, null, request.equipmentType(), request.distanceKm());
    }

    public Activity(ActivityRequest request, com.fitnessfranchise.backend.auth.Adherent owner,
                    Equipment equipment, String equipmentType, Double distanceKm) {
        this.equipment = equipment;
        this.equipmentType = equipmentType;
        this.durationMinutes = request.durationMinutes();
        this.distanceKm = distanceKm;
        this.date = request.date();
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

    @com.fasterxml.jackson.annotation.JsonIgnore
    public Equipment getEquipment() {
        return equipment;
    }

    public Long getEquipmentId() {
        return equipment == null ? null : equipment.getId();
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
