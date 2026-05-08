package com.telemetry.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SpeedBucketDto {
    private String label;
    private String key;
    private double avgSpeed;
    private double maxSpeed;
}
