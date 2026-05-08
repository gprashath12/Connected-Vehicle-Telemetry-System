package com.telemetry.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsDto {
    private long totalClients;
    private long totalVehicles;
    private long activeVehicles24h;
}
