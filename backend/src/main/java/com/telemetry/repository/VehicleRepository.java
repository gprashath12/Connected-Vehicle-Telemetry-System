package com.telemetry.repository;

import com.telemetry.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    List<Vehicle> findAllByOrderByVehicleidAsc();

    @Query("SELECT v FROM Vehicle v WHERE v.owner.userId = :ownerId ORDER BY v.vehicleid ASC")
    List<Vehicle> findByOwnerOrdered(@Param("ownerId") Long ownerId);

    @Query("SELECT CASE WHEN COUNT(v) > 0 THEN true ELSE false END FROM Vehicle v WHERE v.vehicle_code = :code")
    boolean existsByVehicleCode(@Param("code") String code);

    @Query("SELECT v FROM Vehicle v LEFT JOIN FETCH v.owner ORDER BY v.vehicleid ASC")
    List<Vehicle> findAllWithOwner();
}
