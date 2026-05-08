package com.telemetry.dto.admin;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CreateVehicleRequest {

    @NotBlank
    @Size(max = 32)
    private String registrationPlate;

    @NotBlank
    @Size(max = 64)
    private String manufacturer;

    @NotBlank
    @Size(max = 64)
    private String model;

    @NotNull
    @Min(1900)
    @Max(2100)
    private Integer year;

    @NotBlank
    @Size(max = 32)
    private String fuelType; // PETROL | DIESEL | CNG | ELECTRIC | HYBRID

    private String status = "ACTIVE"; // ACTIVE | INACTIVE | MAINTENANCE

    @Size(max = 64)
    private String name; // optional display name
}
