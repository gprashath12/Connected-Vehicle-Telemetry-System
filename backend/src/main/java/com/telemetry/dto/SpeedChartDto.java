package com.telemetry.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SpeedChartDto {
    private List<SpeedBucketDto> buckets;
    private String maxBucketKey;
}
