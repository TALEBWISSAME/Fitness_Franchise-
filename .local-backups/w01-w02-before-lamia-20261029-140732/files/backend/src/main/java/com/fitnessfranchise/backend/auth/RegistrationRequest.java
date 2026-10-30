package com.fitnessfranchise.backend.auth;

import jakarta.validation.constraints.*;
import java.nio.charset.StandardCharsets;
import java.util.Locale;

public record RegistrationRequest(
        @NotBlank @Email @Size(max = 254) String email,
        @com.fasterxml.jackson.annotation.JsonProperty(access = com.fasterxml.jackson.annotation.JsonProperty.Access.WRITE_ONLY)
        @NotBlank @Size(min = 12, max = 64) String password,
        @NotBlank @Size(max = 100) String displayName) {
    public RegistrationRequest {
        email = normalizeEmail(email);
        displayName = displayName == null ? null : displayName.strip();
    }
    public static String normalizeEmail(String email) {
        return email == null ? null : email.strip().toLowerCase(Locale.ROOT);
    }
    @AssertTrue(message = "Password exceeds the supported UTF-8 length")
    public boolean isPasswordLengthSupported() {
        return password == null || password.getBytes(StandardCharsets.UTF_8).length <= 72;
    }
    @Override public String toString() { return "RegistrationRequest[redacted]"; }
}
