package com.telemetry.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Table(
    name = "vehicle_readings",
    indexes = {
        @Index(name = "idx_vehicle_ts", columnList = "vehicleid,ts"),
        @Index(name = "idx_ts", columnList = "ts")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleReading {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "readingid")
    private Long readingid;

    @Column(name = "vehicleid", nullable = false)
    private Long vehicleid;

    @Column(name = "speed")
    private Double speed;

    @Column(name = "engineTemp")
    private Double engineTemp;

    @Column(name = "lat")
    private Double lat;

    @Column(name = "lon")
    private Double lon;

    @Column(name = "ts", nullable = false)
    private Instant ts;
}
