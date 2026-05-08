package com.telemetry.controller;

import com.telemetry.dto.*;
import com.telemetry.entity.User;
import com.telemetry.service.TelemetryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final TelemetryService service;

    @GetMapping
    public List<VehicleDto> listVehicles(@AuthenticationPrincipal User currentUser) {
        return service.listVehicles(currentUser);
    }

    @GetMapping("/{id}")
    public ResponseEntity<VehicleDto> getVehicle(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(service.getVehicle(id, currentUser));
    }

    @GetMapping("/{id}/latest")
    public ResponseEntity<ReadingDto> latestReading(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        ReadingDto r = service.getLatestReading(id, currentUser);
        return r == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(r);
    }

    @GetMapping("/{id}/kpis")
    public KpiDto kpis(
            @PathVariable Long id,
            @RequestParam(name = "from") long from,
            @RequestParam(name = "to") long to,
            @AuthenticationPrincipal User currentUser) {
        return service.computeKpis(id, from, to, currentUser);
    }

    @GetMapping("/{id}/speed-chart")
    public SpeedChartDto speedChart(
            @PathVariable Long id,
            @RequestParam(name = "period", defaultValue = "week") String period,
            @AuthenticationPrincipal User currentUser) {
        return service.computeSpeedChart(id, period, currentUser);
    }

    @GetMapping("/{id}/temperature-history")
    public List<TempPointDto> temperatureHistory(
            @PathVariable Long id,
            @RequestParam(name = "from") long from,
            @RequestParam(name = "to") long to,
            @AuthenticationPrincipal User currentUser) {
        return service.temperatureHistory(id, from, to, currentUser);
    }

    @GetMapping("/compare")
    public CompareDto compare(
            @RequestParam(name = "ids") String ids,
            @RequestParam(name = "metric", defaultValue = "speed") String metric,
            @RequestParam(name = "from") long from,
            @RequestParam(name = "to") long to,
            @AuthenticationPrincipal User currentUser) {
        List<Long> idList = Arrays.stream(ids.split(","))
                .filter(s -> !s.isBlank())
                .map(String::trim)
                .map(Long::parseLong)
                .toList();
        return service.compare(idList, metric, from, to, currentUser);
    }
}
