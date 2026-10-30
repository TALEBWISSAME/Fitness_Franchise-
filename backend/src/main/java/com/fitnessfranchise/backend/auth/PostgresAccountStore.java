package com.fitnessfranchise.backend.auth;

import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.dao.DataIntegrityViolationException;
import org.hibernate.exception.ConstraintViolationException;
import java.util.Optional;

@Repository
public class PostgresAccountStore implements AccountStore {
    private final AdherentRepository repository;
    public PostgresAccountStore(AdherentRepository repository) { this.repository = repository; }
    @Override @Transactional(readOnly = true)
    public Optional<Account> findByEmail(String normalizedEmail) {
        return repository.findByNormalizedEmail(RegistrationRequest.normalizeEmail(normalizedEmail))
            .map(PostgresAccountStore::account);
    }
    @Override @Transactional
    public Account create(String email, String displayName, String passwordHash) {
        try {
            return account(repository.saveAndFlush(new Adherent(email, displayName, passwordHash)));
        } catch (DataIntegrityViolationException ex) {
            for (Throwable cause = ex; cause != null; cause = cause.getCause()) {
                if (cause instanceof ConstraintViolationException constraint
                        && "23505".equals(constraint.getSQLState())
                        && "adherents_email_lower_unique".equals(constraint.getConstraintName())) {
                    throw new DuplicateEmailException();
                }
            }
            throw ex;
        }
    }
    private static Account account(Adherent adherent) {
        return new Account(adherent.getId(), adherent.getEmail(), adherent.displayName(), adherent.getPasswordHash());
    }
}
