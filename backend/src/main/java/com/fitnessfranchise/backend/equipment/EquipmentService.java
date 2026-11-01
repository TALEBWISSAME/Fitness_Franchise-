package com.fitnessfranchise.backend.equipment;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class EquipmentService {
    private final EquipmentRepository repository;

    public EquipmentService(EquipmentRepository repository) {
        this.repository = repository;
    }

    public List<EquipmentResponse> findAll() {
        return repository.findAllByOrderByCategoryAscNameAsc()
                .stream()
                .map(EquipmentResponse::from)
                .toList();
    }
}
