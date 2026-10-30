
package com.fitnessfranchise.backend.activity;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ActivityRepository extends JpaRepository<Activity, Long> {

    List<Activity> findAllByOrderByDateDescIdDesc();

    List<Activity> findByAdherent_IdOrderByDateDescIdDesc(Long adherentId);

    @Query("""
        SELECT a FROM Activity a
        WHERE a.adherent.id = :adherentId
          AND (CAST(:fromDate AS timestamp) IS NULL OR a.date >= :fromDate)
          AND (CAST(:toExclusive AS timestamp) IS NULL OR a.date < :toExclusive)
          AND (CAST(:equipmentType AS string) IS NULL OR a.equipmentType = :equipmentType)
        ORDER BY a.date DESC, a.id DESC
        """)
    List<Activity> findMyActivitiesFiltered(
            @Param("adherentId") Long adherentId,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toExclusive") LocalDateTime toExclusive,
            @Param("equipmentType") String equipmentType
    );
}
