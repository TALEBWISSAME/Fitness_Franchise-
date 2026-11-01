package com.fitnessfranchise.backend.auth;

import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;

@org.springframework.boot.autoconfigure.condition.ConditionalOnProperty(name = "fitness.auth.enabled", havingValue = "true")
@RestController
public class AuthController {
    private final AccountService accounts;
    public AuthController(AccountService accounts) { this.accounts = accounts; }
    @GetMapping("/api/auth/csrf")
    public CsrfResponse csrf(CsrfToken token) {
        return new CsrfResponse(token.getHeaderName(), token.getToken());
    }
    @PostMapping("/api/auth/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AccountProfile register(@Valid @RequestBody RegistrationRequest request) {
        return accounts.register(request);
    }
    @GetMapping("/api/me")
    public AccountProfile me(Authentication authentication) {
        return accounts.profile(authentication.getName());
    }
    @PutMapping("/api/me")
    public AccountProfile updateMe(Authentication authentication, @Valid @RequestBody ProfileUpdateRequest request) {
        return accounts.updateProfile(authentication.getName(), request);
    }
    public record CsrfResponse(String headerName, String token) {}
}
