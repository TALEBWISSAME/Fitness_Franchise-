package com.fitnessfranchise.backend.auth;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AdherentRepository extends JpaRepository<Adherent, Long> {
    @Query("select a from Adherent a where lower(a.email) = lower(:email)")
    Optional<Adherent> findByNormalizedEmail(@Param("email") String email);
}
