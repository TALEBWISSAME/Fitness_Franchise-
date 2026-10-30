package com.fitnessfranchise.backend.auth;

import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

@org.springframework.boot.autoconfigure.condition.ConditionalOnProperty(name = "fitness.auth.enabled", havingValue = "true")
@RestControllerAdvice(assignableTypes = AuthController.class)
public class AuthErrors {
    @ExceptionHandler(AccountStore.DuplicateEmailException.class)
    public ResponseEntity<Error> duplicate() {
        return ResponseEntity.status(409).body(new Error("EMAIL_ALREADY_USED"));
    }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Error> invalid() {
        return ResponseEntity.badRequest().body(new Error("INVALID_REGISTRATION"));
    }
    @ExceptionHandler(org.springframework.http.converter.HttpMessageNotReadableException.class)
    public ResponseEntity<Error> unreadable() {
        // Do not return or log parser messages which can contain submitted values.
        return ResponseEntity.badRequest().body(new Error("INVALID_REGISTRATION"));
    }
    @ExceptionHandler(org.springframework.security.core.userdetails.UsernameNotFoundException.class)
    public ResponseEntity<Error> unavailable() {
        return ResponseEntity.status(401).body(new Error("UNAUTHENTICATED"));
    }
    public record Error(String error) {}
}
