package com.telemetry.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class KpiDto {
    private double maxSpeed;
    private double avgSpeed;
    private double totalDistanceKm;
    private double engineHours;
    private double idleHours;
}
