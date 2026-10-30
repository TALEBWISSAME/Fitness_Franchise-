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
    public String displayName() { return displayName; }
    @Override public String toString() { return "Adherent[id=" + id + "]"; }
}
