package com.fitnessfranchise.backend.activity;

import com.fitnessfranchise.backend.auth.AdherentRepository;
import com.fitnessfranchise.backend.equipment.Equipment;
import com.fitnessfranchise.backend.equipment.EquipmentRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Repository
public class PostgresOwnedActivityStore implements OwnedActivityStore {
    private final ActivityRepository activities;
    private final AdherentRepository accounts;
    private final EquipmentRepository equipment;

    public PostgresOwnedActivityStore(ActivityRepository activities, AdherentRepository accounts,
                                      EquipmentRepository equipment) {
        this.activities = activities;
        this.accounts = accounts;
        this.equipment = equipment;
    }

    @Override @Transactional
    public Long save(ActivityRequest request, Long authenticatedAccountId) {
        if (authenticatedAccountId == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        var owner = accounts.findById(authenticatedAccountId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));

        Equipment selectedEquipment = null;
        String equipmentType = request.equipmentType();
        Double distanceKm = request.distanceKm();
        if (request.equipmentId() != null) {
            selectedEquipment = equipment.findById(request.equipmentId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Équipement inconnu"));
            if (equipmentType != null && !equipmentType.isBlank()
                    && !selectedEquipment.getType().equalsIgnoreCase(equipmentType.trim())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le type ne correspond pas à l'équipement");
            }
            equipmentType = selectedEquipment.getType();
            if (ActivityRules.requiresDistance(equipmentType)) {
                if (distanceKm == null) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La distance est obligatoire pour cet équipement");
                }
            } else {
                distanceKm = null;
            }
        } else {
            if (equipmentType == null || equipmentType.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Un équipement est obligatoire");
            }
            if (distanceKm == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La distance est obligatoire pour l'ancien format");
            }
            equipmentType = equipmentType.trim();
            if (!ActivityRules.requiresDistance(equipmentType)) {
                distanceKm = null;
            }
        }

        Activity activity = new Activity(request, owner, selectedEquipment, equipmentType, distanceKm);
        return activities.saveAndFlush(activity).getId();
    }
}
