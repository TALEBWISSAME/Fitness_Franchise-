package com.fitnessfranchise.backend.auth;

import java.util.Optional;

/** Account persistence port. Implemented by PostgresAccountStore. */
public interface AccountStore {
    Optional<Account> findByEmail(String normalizedEmail);
    Account create(String email, String displayName, String passwordHash);
    // create must atomically enforce email uniqueness, persist role MEMBER, and throw DuplicateEmailException on email conflict.
    class DuplicateEmailException extends RuntimeException {}
    record Account(Long id, String email, String displayName, @com.fasterxml.jackson.annotation.JsonIgnore String passwordHash) {
        @Override public String toString() { return "Account[id=" + id + "]"; }
    }
}
