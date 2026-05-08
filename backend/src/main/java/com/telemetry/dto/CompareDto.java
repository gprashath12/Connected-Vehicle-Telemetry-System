package com.telemetry.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompareDto {
    private String metric;
    private List<CompareSeriesDto> series;
}
