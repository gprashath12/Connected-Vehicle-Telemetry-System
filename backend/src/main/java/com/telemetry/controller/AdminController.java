package com.telemetry.controller;

import com.telemetry.dto.VehicleDto;
import com.telemetry.dto.admin.*;
import com.telemetry.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    public AdminStatsDto stats() {
        return adminService.stats();
    }

    @GetMapping("/fleet")
    public List<AdminVehicleDto> fleet() {
        return adminService.globalFleet();
    }

    @GetMapping("/top-speed-today")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> topSpeedToday() {
        return ResponseEntity.ok(adminService.getTop5PeakSpeedToday());
    }

    @GetMapping("/clients")
    public List<ClientDto> listClients() {
        return adminService.listClients();
    }

    @PostMapping("/clients")
    public ResponseEntity<CreateClientResponse> createClient(@Valid @RequestBody CreateClientRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createClient(req));
    }

    @GetMapping("/clients/{clientId}/vehicles")
    public List<VehicleDto> listVehiclesForClient(@PathVariable Long clientId) {
        return adminService.listVehiclesForClient(clientId);
    }

    @PostMapping("/clients/{clientId}/vehicles")
    public ResponseEntity<VehicleDto> createVehicle(
            @PathVariable Long clientId,
            @Valid @RequestBody CreateVehicleRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createVehicleForClient(clientId, req));
    }

    @DeleteMapping("/clients/{clientId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteClient(@PathVariable Long clientId) {
        adminService.deleteClient(clientId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/clients/{clientId}/vehicles/{vehicleId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteVehicle(@PathVariable Long clientId, @PathVariable Long vehicleId) {
        adminService.deleteVehicle(vehicleId);
        return ResponseEntity.noContent().build();
    }
}
