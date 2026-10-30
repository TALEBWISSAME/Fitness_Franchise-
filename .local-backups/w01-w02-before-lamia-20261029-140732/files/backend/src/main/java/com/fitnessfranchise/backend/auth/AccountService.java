package com.fitnessfranchise.backend.auth;

import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.password.PasswordEncoder;

public class AccountService {
    private final AccountStore store;
    private final PasswordEncoder encoder;
    public AccountService(AccountStore store, PasswordEncoder encoder) {
        this.store = store;
        this.encoder = encoder;
    }
    public AccountProfile register(RegistrationRequest request) {
        if (store.findByEmail(request.email()).isPresent()) {
            throw new AccountStore.DuplicateEmailException();
        }
        return AccountProfile.from(store.create(request.email(), request.displayName(), encoder.encode(request.password())));
    }
    public AccountProfile profile(String email) {
        return AccountProfile.from(store.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Account unavailable")));
    }
    public UserDetails loadUserByUsername(String email) {
        var account = store.findByEmail(RegistrationRequest.normalizeEmail(email))
                .orElseThrow(() -> new UsernameNotFoundException("Invalid credentials"));
        return User.withUsername(account.email()).password(account.passwordHash()).roles("ADHERENT").build();
    }
}
