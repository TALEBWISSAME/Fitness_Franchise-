package com.fitnessfranchise.backend.auth;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "adherents", schema = "public")
public class Adherent {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "display_name", nullable = false, length = 100)
    private String displayName;
    @Column(name = "email", nullable = false, length = 255)
    private String email;
    @JsonIgnore @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;
    @Column(name = "role", nullable = false, length = 20)
    private String role;
    @Column(name = "city", length = 100)
    private String city;
    @Column(name = "gender", length = 32)
    private String gender;
    @Column(name = "sport_objective", length = 64)
    private String sportObjective;

    protected Adherent() {}
    public Adherent(String email, String displayName, String passwordHash) {
        this.email = RegistrationRequest.normalizeEmail(email);
        this.displayName = displayName;
        this.passwordHash = passwordHash;
        this.role = "MEMBER";
    }
    public Long getId() { return id; }
    public String getDisplayName() { return displayName; }
    public String getEmail() { return email; }
    @JsonIgnore public String getPasswordHash() { return passwordHash; }
    public String getRole() { return role; }
    public String getCity() { return city; }
    public String getGender() { return gender; }
    public String getSportObjective() { return sportObjective; }
    public String displayName() { return displayName; }
    public void updateProfile(String city, String gender, String sportObjective) {
        this.city = optionalText(city);
        this.gender = optionalText(gender);
        this.sportObjective = optionalText(sportObjective);
    }
    private static String optionalText(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
    @Override public String toString() { return "Adherent[id=" + id + "]"; }
}
