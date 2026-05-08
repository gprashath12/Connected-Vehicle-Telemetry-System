package com.telemetry.repository;

import com.telemetry.entity.VehicleReading;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleReadingRepository extends JpaRepository<VehicleReading, Long> {

    List<VehicleReading> findByVehicleidAndTsBetweenOrderByTsAsc(
            Long vehicleid, Instant from, Instant to);

    Optional<VehicleReading> findFirstByVehicleidOrderByTsDesc(Long vehicleid);

    @Query("SELECT COUNT(r) FROM VehicleReading r WHERE r.vehicleid = :vid")
    long countByVehicle(@Param("vid") Long vid);

    @Query("SELECT r.vehicleid, MAX(r.speed) as peakSpeed FROM VehicleReading r WHERE r.ts >= :startOfDay GROUP BY r.vehicleid ORDER BY peakSpeed DESC LIMIT 5")
    List<Object[]> findTop5ByPeakSpeedToday(@Param("startOfDay") Instant startOfDay);
}
