package com.fitnessfranchise.backend.auth;

import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.hibernate.exception.ConstraintViolationException;
import java.sql.SQLException;
import static org.mockito.Mockito.*;
import static org.assertj.core.api.Assertions.*;

class PostgresAccountStoreTest {
    @Test void displayNameMappingIsReversibleAndRoleIsOrdinary() {
        for (String name : new String[] {"Compte A", "Wissame", "Ali Ali", "Jean  Dupont", "a".repeat(100)}) {
            var account = new Adherent(" A@EXAMPLE.TEST ", name, "private-hash");
            assertThat(account.displayName()).isEqualTo(name);
            assertThat(account.getDisplayName()).isEqualTo(name).hasSizeLessThanOrEqualTo(100);
            assertThat(account.getRole()).isEqualTo("MEMBER");
            assertThat(account.getEmail()).isEqualTo("a@example.test");
            assertThat(account.toString()).doesNotContain("private-hash");
        }
    }
    @Test void translatesOnlyActualEmailUniqueViolation() {
        var repository = mock(AdherentRepository.class);
        var store = new PostgresAccountStore(repository);
        var emailConflict = new DataIntegrityViolationException("conflict",
            new ConstraintViolationException("conflict", new SQLException("conflict", "23505"), "adherents_email_lower_unique"));
        when(repository.saveAndFlush(any())).thenThrow(emailConflict);
        assertThatThrownBy(() -> store.create("a@example.test", "A", "hash"))
            .isInstanceOf(AccountStore.DuplicateEmailException.class);
        var otherConflict = new DataIntegrityViolationException("conflict",
            new ConstraintViolationException("conflict", new SQLException("conflict", "23505"), "another_constraint"));
        doThrow(otherConflict).when(repository).saveAndFlush(any());
        assertThatThrownBy(() -> store.create("a@example.test", "A", "hash")).isSameAs(otherConflict);
    }
}

