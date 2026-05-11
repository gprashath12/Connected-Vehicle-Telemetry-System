package com.telemetry.service;

import com.telemetry.dto.VehicleDto;
import com.telemetry.dto.admin.*;
import com.telemetry.entity.Role;
import com.telemetry.entity.User;
import com.telemetry.entity.Vehicle;
import com.telemetry.entity.VehicleReading;
import com.telemetry.repository.UserRepository;
import com.telemetry.repository.VehicleReadingRepository;
import com.telemetry.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepo;
    private final VehicleRepository vehicleRepo;
    private final VehicleReadingRepository readingRepo;
    private final PasswordEncoder passwordEncoder;

    public AdminStatsDto stats() {
        long totalClients = userRepo.countByRole(Role.CLIENT);
        long totalVehicles = vehicleRepo.count();
        long activeCutoff = System.currentTimeMillis() - 24L * 60 * 60 * 1000;

        long activeVehicles24h = vehicleRepo.findAll().stream()
                .filter(v -> readingRepo.findFirstByVehicleidOrderByTsDesc(v.getVehicleid())
                        .map(r -> r.getTs().toEpochMilli() >= activeCutoff)
                        .orElse(false))
                .count();

        return new AdminStatsDto(totalClients, totalVehicles, activeVehicles24h);
    }

    public List<Map<String, Object>> getTop5PeakSpeedToday() {
        Instant startOfDay = LocalDate.now(ZoneOffset.UTC)
                .atStartOfDay(ZoneOffset.UTC)
                .toInstant();
        List<Object[]> rows = readingRepo.findTop5ByPeakSpeedToday(startOfDay);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : rows) {
            Long vehicleId = ((Number) row[0]).longValue();
            double peakSpeed = ((Number) row[1]).doubleValue();
            Map<String, Object> map = new HashMap<>();
            map.put("vehicleId", vehicleId);
            map.put("peakSpeed", Math.round(peakSpeed * 10.0) / 10.0);
            vehicleRepo.findById(vehicleId).ifPresent(v -> {
                map.put("vehicleName", v.getName());
                map.put("vehicleCode", v.getVehicle_code());
            });
            result.add(map);
        }
        return result;
    }

    public List<ClientDto> listClients() {
        return userRepo.findAllByRoleOrderByCreatedAtDesc(Role.CLIENT).stream()
                .map(ClientDto::from)
                .toList();
    }

    public CreateClientResponse createClient(CreateClientRequest req) {
        if (userRepo.existsByEmail(req.getEmail().trim().toLowerCase())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }
        String rawPassword = req.getPassword();
        boolean generated = rawPassword == null || rawPassword.isBlank();
        if (generated) {
            rawPassword = generatePassword();
        }
        User u = User.builder()
                .email(req.getEmail().trim().toLowerCase())
                .passwordHash(passwordEncoder.encode(rawPassword))
                .fullName(req.getFullName().trim())
                .role(Role.CLIENT)
                .status(req.getStatus() != null ? req.getStatus() : "ACTIVE")
                .createdAt(Instant.now())
                .build();
        u = userRepo.save(u);
        return new CreateClientResponse(ClientDto.from(u), generated ? rawPassword : null);
    }

    public VehicleDto createVehicleForClient(Long clientId, CreateVehicleRequest req) {
        User client = userRepo.findById(clientId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Client not found"));
        if (client.getRole() != Role.CLIENT) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is not a client");
        }
        if (vehicleRepo.existsByVehicleCode(req.getRegistrationPlate())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Registration plate already exists");
        }
        Vehicle v = new Vehicle();
        v.setVehicle_code(req.getRegistrationPlate());
        v.setManufacturer(req.getManufacturer());
        v.setModel(req.getModel());
        v.setYear(req.getYear());
        v.setFuelType(req.getFuelType());
        v.setVehicleStatus(req.getStatus() != null ? req.getStatus() : "ACTIVE");
        String displayName = (req.getName() != null && !req.getName().isBlank())
                ? req.getName().trim()
                : req.getManufacturer() + " " + req.getModel();
        v.setName(displayName);
        v.setRegisteredon(LocalDate.now());
        v.setOwner(client);
        v = vehicleRepo.save(v);
        return VehicleDto.from(v);
    }

    public List<VehicleDto> listVehiclesForClient(Long clientId) {
        if (!userRepo.existsById(clientId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Client not found");
        }
        return vehicleRepo.findByOwnerOrdered(clientId).stream()
                .map(VehicleDto::from)
                .toList();
    }

    private static String generatePassword() {
        String upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        String lower = "abcdefghijklmnopqrstuvwxyz";
        String digits = "0123456789";
        String all = upper + lower + digits;
        Random rng = new Random();
        char[] pw = new char[10];
        pw[0] = upper.charAt(rng.nextInt(upper.length()));
        pw[1] = lower.charAt(rng.nextInt(lower.length()));
        pw[2] = digits.charAt(rng.nextInt(digits.length()));
        for (int i = 3; i < 10; i++) pw[i] = all.charAt(rng.nextInt(all.length()));
        for (int i = pw.length - 1; i > 0; i--) {
            int j = rng.nextInt(i + 1);
            char tmp = pw[i]; pw[i] = pw[j]; pw[j] = tmp;
        }
        return new String(pw);
    }

    @Transactional
    public void deleteClient(Long clientId) {
        User client = userRepo.findById(clientId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Client not found"));
        if (client.getRole() != Role.CLIENT) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is not a client");
        }
        List<Vehicle> vehicles = vehicleRepo.findByOwnerOrdered(clientId);
        for (Vehicle v : vehicles) {
            readingRepo.deleteByVehicleid(v.getVehicleid());
        }
        vehicleRepo.deleteAll(vehicles);
        userRepo.delete(client);
    }

    @Transactional
    public void deleteVehicle(Long vehicleId) {
        Vehicle vehicle = vehicleRepo.findById(vehicleId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vehicle not found"));
        readingRepo.deleteByVehicleid(vehicleId);
        vehicleRepo.delete(vehicle);
    }

    @Transactional(readOnly = true)
    public List<AdminVehicleDto> globalFleet() {
        long activeCutoff = System.currentTimeMillis() - 24L * 60 * 60 * 1000;
        List<Vehicle> all = vehicleRepo.findAllWithOwner();
        return all.stream().map(v -> {
            AdminVehicleDto dto = AdminVehicleDto.base(v);
            VehicleReading latest = readingRepo
                    .findFirstByVehicleidOrderByTsDesc(v.getVehicleid())
                    .orElse(null);
            if (latest != null) {
                dto.setCurrentSpeed(latest.getSpeed());
                dto.setCurrentEngineTemp(latest.getEngineTemp());
                long ts = latest.getTs().toEpochMilli();
                dto.setLastSeenTs(ts);
                dto.setActive24h(ts >= activeCutoff);
                dto.setLat(latest.getLat());
                dto.setLon(latest.getLon());
            }
            return dto;
        }).toList();
    }
}
