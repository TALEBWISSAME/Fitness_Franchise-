package com.fitnessfranchise.backend.activity;

import com.fitnessfranchise.backend.auth.AdherentRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Repository
public class PostgresOwnedActivityStore implements OwnedActivityStore {
    private final ActivityRepository activities;
    private final AdherentRepository accounts;
    public PostgresOwnedActivityStore(ActivityRepository activities, AdherentRepository accounts) {
        this.activities = activities;
        this.accounts = accounts;
    }
    @Override @Transactional
    public Long save(ActivityRequest request, Long authenticatedAccountId) {
        if (authenticatedAccountId == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        var owner = accounts.findById(authenticatedAccountId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        return activities.saveAndFlush(new Activity(request, owner)).getId();
    }
}
