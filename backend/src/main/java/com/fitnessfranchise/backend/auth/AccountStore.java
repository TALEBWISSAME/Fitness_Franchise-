package com.fitnessfranchise.backend.auth;

import java.util.Optional;

/** Account persistence port. Implemented by PostgresAccountStore. */
public interface AccountStore {
    Optional<Account> findByEmail(String normalizedEmail);
    Account create(String email, String displayName, String passwordHash);
    Account updateProfile(String normalizedEmail, String city, String gender, String sportObjective);
    // create must atomically enforce email uniqueness, persist role MEMBER, and throw DuplicateEmailException on email conflict.
    class DuplicateEmailException extends RuntimeException {}
    record Account(Long id, String email, String displayName, @com.fasterxml.jackson.annotation.JsonIgnore String passwordHash,
                   String city, String gender, String sportObjective) {
        public Account(Long id, String email, String displayName, String passwordHash) {
            this(id, email, displayName, passwordHash, null, null, null);
        }
        @Override public String toString() { return "Account[id=" + id + "]"; }
    }
}
