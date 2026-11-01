package com.fitnessfranchise.backend.auth;

public record AccountProfile(Long id, String email, String displayName, String city, String gender, String sportObjective) {
    static AccountProfile from(AccountStore.Account account) {
        return new AccountProfile(account.id(), account.email(), account.displayName(),
            account.city(), account.gender(), account.sportObjective());
    }
}
