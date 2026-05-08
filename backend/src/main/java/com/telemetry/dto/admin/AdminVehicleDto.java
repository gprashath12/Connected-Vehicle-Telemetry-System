package com.telemetry.dto.admin;

import com.telemetry.entity.Vehicle;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminVehicleDto {
    private Long vehicleid;
    private String name;
    private String manufacturer;
    private String model;
    private String vehicle_code;
    private Long ownerId;
    private String ownerName;
    private String ownerEmail;
    private Double currentSpeed;
    private Double currentEngineTemp;
    private Long lastSeenTs;
    private boolean active24h;

    // ── New fields used by the admin Vehicles filter panel and dashboard map ──
    private String vehicleStatus;   // ACTIVE / INACTIVE / MAINTENANCE
    private String fuelType;        // PETROL / DIESEL / CNG / ELECTRIC / HYBRID
    private Integer year;
    private Double lat;             // latest known latitude
    private Double lon;             // latest known longitude

    public static AdminVehicleDto base(Vehicle v) {
        AdminVehicleDto d = new AdminVehicleDto();
        d.vehicleid = v.getVehicleid();
        d.name = v.getName();
        d.manufacturer = v.getManufacturer();
        d.model = v.getModel();
        d.vehicle_code = v.getVehicle_code();
        d.vehicleStatus = v.getVehicleStatus() != null ? v.getVehicleStatus() : "ACTIVE";
        d.fuelType = v.getFuelType();
        d.year = v.getYear();
        if (v.getOwner() != null) {
            d.ownerId = v.getOwner().getUserId();
            d.ownerName = v.getOwner().getFullName();
            d.ownerEmail = v.getOwner().getEmail();
        }
        return d;
    }
}
