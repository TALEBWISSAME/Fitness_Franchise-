package com.fitnessfranchise.backend.activity;

/** Pending Lamia's validated mapping. Implementation must atomically persist the
 * activity with this server-resolved owner, without modifying legacy activities.
 * No implementation or fallback to an ownerless insert is provided.
 */
public interface OwnedActivityStore {
    Long save(ActivityRequest request, Long authenticatedAccountId);
}
