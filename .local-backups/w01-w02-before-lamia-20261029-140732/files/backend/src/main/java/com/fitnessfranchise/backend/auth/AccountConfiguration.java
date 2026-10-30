package com.fitnessfranchise.backend.auth;

import org.springframework.context.annotation.*;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@ConditionalOnProperty(name = "fitness.auth.enabled", havingValue = "true")
public class AccountConfiguration {
    @Bean AccountService accountService(AccountStore store, PasswordEncoder encoder) {
        return new AccountService(store, encoder);
    }
}
