package com.telemetry.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompareSeriesDto {
    private Long vehicleid;
    private String name;
    private List<ComparePointDto> points;
}
