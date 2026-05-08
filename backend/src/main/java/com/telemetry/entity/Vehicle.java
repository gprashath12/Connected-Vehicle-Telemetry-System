package com.telemetry.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "vehicle", indexes = {
        @Index(name = "idx_vehicle_owner", columnList = "owner_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "vehicleid")
    private Long vehicleid;

    @Column(name = "manufacturer", length = 64)
    private String manufacturer;

    @Column(name = "model", length = 64)
    private String model;

    @Column(name = "name", length = 64)
    private String name;

    @Column(name = "registeredon")
    private LocalDate registeredon;

    @Column(name = "vehicle_code", length = 32, unique = true)
    private String vehicle_code;

    @Column(name = "year")
    private Integer year;

    @Column(name = "fuel_type", length = 32)
    private String fuelType;

    @Column(name = "vehicle_status", length = 20)
    private String vehicleStatus = "ACTIVE";

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "owner_id")
    @JsonIgnore
    private User owner;

    @Transient
    public Long getOwnerId() {
        return owner != null ? owner.getUserId() : null;
    }
}
