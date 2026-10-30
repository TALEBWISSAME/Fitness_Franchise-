package com.fitnessfranchise.backend.activity;

/** Persist a new activity atomically with its server-resolved owner.
 * Implemented by PostgresOwnedActivityStore; never updates legacy ownerless rows.
 */
public interface OwnedActivityStore {
    Long save(ActivityRequest request, Long authenticatedAccountId);
}
