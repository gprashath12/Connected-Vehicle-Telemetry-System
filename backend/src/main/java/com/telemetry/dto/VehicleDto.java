package com.telemetry.dto;

import com.telemetry.entity.Vehicle;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleDto {
    private Long vehicleid;
    private String manufacturer;
    private String model;
    private String name;
    private LocalDate registeredon;
    private String vehicle_code;
    private Long ownerId;
    private Integer year;
    private String fuelType;
    private String vehicleStatus;

    public static VehicleDto from(Vehicle v) {
        VehicleDto d = new VehicleDto();
        d.vehicleid = v.getVehicleid();
        d.manufacturer = v.getManufacturer();
        d.model = v.getModel();
        d.name = v.getName();
        d.registeredon = v.getRegisteredon();
        d.vehicle_code = v.getVehicle_code();
        d.ownerId = v.getOwnerId();
        d.year = v.getYear();
        d.fuelType = v.getFuelType();
        d.vehicleStatus = v.getVehicleStatus() != null ? v.getVehicleStatus() : "ACTIVE";
        return d;
    }
}
