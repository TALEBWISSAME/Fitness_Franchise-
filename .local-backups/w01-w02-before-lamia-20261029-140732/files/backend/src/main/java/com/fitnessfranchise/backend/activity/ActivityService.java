
package com.fitnessfranchise.backend.activity;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;
import com.fitnessfranchise.backend.auth.AccountStore;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Service
public class ActivityService {

    private final ActivityRepository repository;

    private final Optional<AccountStore> accounts;
    private final Optional<OwnedActivityStore> ownedActivities;

    public ActivityService(ActivityRepository repository, Optional<AccountStore> accounts,
                           Optional<OwnedActivityStore> ownedActivities) {
        this.repository = repository;
        this.accounts = accounts;
        this.ownedActivities = ownedActivities;
    }

    @Transactional(readOnly = true)
    public List<Activity> findAll() {
        return repository.findAllByOrderByDateDescIdDesc();
    }

    @Transactional
    public Long save(ActivityRequest request) {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        var accountStore = accounts.orElseThrow(() ->
                new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE));
        var owner = accountStore.findByEmail(authentication.getName()).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        if (owner.id() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        var store = ownedActivities.orElseThrow(() ->
                new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE));
        return store.save(request, owner.id());
    }
}
