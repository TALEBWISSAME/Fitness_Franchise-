package com.fitnessfranchise.backend.auth;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import java.util.stream.Stream;
import static org.assertj.core.api.Assertions.*;

class RegistrationRequestTest {
    static ValidatorFactory factory;
    static Validator validator;
    @BeforeAll static void setup() {
        factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }
    @AfterAll static void close() { factory.close(); }
    static Stream<RegistrationRequest> invalidRequests() {
        return Stream.of(
            new RegistrationRequest(null, "example-password", "A"),
            new RegistrationRequest("   ", "example-password", "A"),
            new RegistrationRequest("invalid", "example-password", "A"),
            new RegistrationRequest("a".repeat(245) + "@example.test", "example-password", "A"),
            new RegistrationRequest("a@example.test", null, "A"),
            new RegistrationRequest("a@example.test", " ".repeat(12), "A"),
            new RegistrationRequest("a@example.test", "a".repeat(11), "A"),
            new RegistrationRequest("a@example.test", "a".repeat(65), "A"),
            new RegistrationRequest("a@example.test", "\u00e9".repeat(37), "A"),
            new RegistrationRequest("a@example.test", "example-password", null),
            new RegistrationRequest("a@example.test", "example-password", " "),
            new RegistrationRequest("a@example.test", "example-password", "a".repeat(101)));
    }
    @ParameterizedTest @MethodSource("invalidRequests")
    void rejectsInvalidFields(RegistrationRequest request) {
        assertThat(validator.validate(request)).isNotEmpty();
    }
    static Stream<RegistrationRequest> validRequests() {
        return Stream.of(
            new RegistrationRequest("A@EXAMPLE.TEST", "a".repeat(12), "A"),
            new RegistrationRequest(" A@example.test ", "a".repeat(64), "a".repeat(100)),
            new RegistrationRequest("a@example.test", "\u00e9".repeat(36), "A"),
            new RegistrationRequest("a@example.test", " example-password ", " A "));
    }
    @ParameterizedTest @MethodSource("validRequests")
    void acceptsContractBoundaries(RegistrationRequest request) {
        assertThat(validator.validate(request)).isEmpty();
    }
    @Test void preservesPasswordAndRedactsDiagnosticOutput() {
        var request = new RegistrationRequest(" A@EXAMPLE.TEST ", " example-password ", " A ");
        assertThat(request.email()).isEqualTo("a@example.test");
        assertThat(request.displayName()).isEqualTo("A");
        assertThat(request.password()).isEqualTo(" example-password ");
        assertThat(request.toString()).doesNotContain(request.password());
        var account = new AccountStore.Account(1L, request.email(), "A", "private-hash");
        assertThat(account.toString()).doesNotContain("private-hash");
    }
}
