package com.fitnessfranchise.backend.equipment;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EquipmentRepository extends JpaRepository<Equipment, Long> {
    List<Equipment> findAllByOrderByCategoryAscNameAsc();

    boolean existsByType(String type);
}
