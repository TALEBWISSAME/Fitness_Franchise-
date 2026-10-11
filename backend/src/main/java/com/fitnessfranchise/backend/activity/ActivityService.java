
package com.fitnessfranchise.backend.activity;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ActivityService {

    private final ActivityRepository repository;

    public ActivityService(ActivityRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public Long save(ActivityRequest request) {
        Activity activity = new Activity(request);
        Activity savedActivity = repository.save(activity);
        return savedActivity.getId();
    }
}
