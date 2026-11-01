package com.fitnessfranchise.backend.equipment;

public record EquipmentResponse(Long id, String name, String type, String category) {
    public static EquipmentResponse from(Equipment equipment) {
        return new EquipmentResponse(
                equipment.getId(),
                equipment.getName(),
                equipment.getType(),
                equipment.getCategory());
    }
}
