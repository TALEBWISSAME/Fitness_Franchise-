package com.fitnessfranchise.backend.auth;

import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

@org.springframework.boot.autoconfigure.condition.ConditionalOnProperty(name = "fitness.auth.enabled", havingValue = "true")
@RestControllerAdvice(assignableTypes = AuthController.class)
public class AuthErrors {
    @ExceptionHandler(AccountStore.DuplicateEmailException.class)
    public ResponseEntity<Error> duplicate() {
        return ResponseEntity.status(409).body(new Error("EMAIL_ALREADY_USED"));
    }
    @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
    public ResponseEntity<Error> persistenceFailure() {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new Error("PERSISTENCE_ERROR"));
    }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Error> invalid(HttpServletRequest request) {
        return ResponseEntity.badRequest().body(new Error(invalidRequestCode(request)));
    }
    @ExceptionHandler(org.springframework.http.converter.HttpMessageNotReadableException.class)
    public ResponseEntity<Error> unreadable(HttpServletRequest request) {
        // Do not return or log parser messages which can contain submitted values.
        return ResponseEntity.badRequest().body(new Error(invalidRequestCode(request)));
    }
    @ExceptionHandler(org.springframework.security.core.userdetails.UsernameNotFoundException.class)
    public ResponseEntity<Error> unavailable() {
        return ResponseEntity.status(401).body(new Error("UNAUTHENTICATED"));
    }
    private static String invalidRequestCode(HttpServletRequest request) {
        return request.getRequestURI().endsWith("/api/auth/register")
                ? "INVALID_REGISTRATION" : "INVALID_REQUEST";
    }
    public record Error(String error) {}
}
