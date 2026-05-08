package com.telemetry.service;

import com.telemetry.dto.*;
import com.telemetry.entity.Role;
import com.telemetry.entity.User;
import com.telemetry.entity.Vehicle;
import com.telemetry.entity.VehicleReading;
import com.telemetry.repository.VehicleReadingRepository;
import com.telemetry.repository.VehicleRepository;
import com.telemetry.util.DistanceUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TelemetryService {

    private static final ZoneId ZONE = ZoneId.systemDefault();
    private static final DateTimeFormatter DAY_LABEL_FMT = DateTimeFormatter.ofPattern("MMM d");

    private final VehicleRepository vehicleRepo;
    private final VehicleReadingRepository readingRepo;

    /* ---------- Role-aware listing ---------- */

    public List<VehicleDto> listVehicles(User currentUser) {
        List<Vehicle> vehicles = currentUser.getRole() == Role.ADMIN
                ? vehicleRepo.findAllByOrderByVehicleidAsc()
                : vehicleRepo.findByOwnerOrdered(currentUser.getUserId());
        return vehicles.stream().map(VehicleDto::from).collect(Collectors.toList());
    }

    public VehicleDto getVehicle(Long id, User currentUser) {
        Vehicle v = loadAuthorizedVehicle(id, currentUser);
        return VehicleDto.from(v);
    }

    /* ---------- Per-vehicle data — all gated by ownership check ---------- */

    public ReadingDto getLatestReading(Long id, User currentUser) {
        loadAuthorizedVehicle(id, currentUser);
        return readingRepo.findFirstByVehicleidOrderByTsDesc(id)
                .map(ReadingDto::from)
                .orElse(null);
    }

    public KpiDto computeKpis(Long id, long fromMs, long toMs, User currentUser) {
        loadAuthorizedVehicle(id, currentUser);
        List<VehicleReading> readings = readingRepo
                .findByVehicleidAndTsBetweenOrderByTsAsc(id, Instant.ofEpochMilli(fromMs), Instant.ofEpochMilli(toMs));
        if (readings.isEmpty()) {
            return new KpiDto(0, 0, 0, 0, 0);
        }

        double maxSpeed = 0;
        double sumMoving = 0;
        int countMoving = 0;
        int idleSamples = 0;
        for (VehicleReading r : readings) {
            double s = r.getSpeed() == null ? 0 : r.getSpeed();
            if (s > maxSpeed) maxSpeed = s;
            if (s > 1) {
                sumMoving += s;
                countMoving++;
            } else {
                idleSamples++;
            }
        }
        double avgSpeed = countMoving > 0 ? sumMoving / countMoving : 0;
        double totalKm = DistanceUtil.totalDistanceKm(readings);

        long spanMs = readings.get(readings.size() - 1).getTs().toEpochMilli()
                    - readings.get(0).getTs().toEpochMilli();
        double engineHours = spanMs / 3_600_000.0;

        long stepMinutes = inferStepMinutes(readings);
        double idleHours = (idleSamples * stepMinutes) / 60.0;

        return new KpiDto(
                round1(maxSpeed),
                round1(avgSpeed),
                round1(totalKm),
                round1(engineHours),
                round1(idleHours)
        );
    }

    public SpeedChartDto computeSpeedChart(Long id, String period, User currentUser) {
        loadAuthorizedVehicle(id, currentUser);
        long now = System.currentTimeMillis();
        long from;
        switch (period == null ? "week" : period.toLowerCase()) {
            case "day"   -> from = now - 24L * 60 * 60 * 1000;
            case "month" -> from = now - 30L * 24 * 60 * 60 * 1000;
            default      -> from = now - 7L * 24 * 60 * 60 * 1000;
        }
        boolean groupByHour = "day".equalsIgnoreCase(period);

        List<VehicleReading> readings = readingRepo
                .findByVehicleidAndTsBetweenOrderByTsAsc(id, Instant.ofEpochMilli(from), Instant.ofEpochMilli(now));

        Map<String, BucketAcc> groups = new LinkedHashMap<>();
        for (VehicleReading r : readings) {
            ZonedDateTime z = r.getTs().atZone(ZONE);
            String key;
            String label;
            if (groupByHour) {
                key = String.valueOf(z.getHour());
                label = String.format("%02d:00", z.getHour());
            } else {
                key = z.getYear() + "-" + z.getMonthValue() + "-" + z.getDayOfMonth();
                label = z.toLocalDate().format(DAY_LABEL_FMT);
            }
            BucketAcc acc = groups.computeIfAbsent(key, k -> new BucketAcc(label, k, r.getTs().toEpochMilli()));
            double s = r.getSpeed() == null ? 0 : r.getSpeed();
            acc.sum += s;
            acc.count += 1;
            if (s > acc.max) acc.max = s;
        }

        List<SpeedBucketDto> buckets = groups.values().stream()
                .sorted(Comparator.comparingLong(b -> b.firstTs))
                .map(b -> new SpeedBucketDto(
                        b.label,
                        b.key,
                        b.count == 0 ? 0 : round1(b.sum / b.count),
                        round1(b.max)
                ))
                .collect(Collectors.toList());

        String maxKey = null;
        double maxVal = -1;
        for (SpeedBucketDto b : buckets) {
            if (b.getMaxSpeed() > maxVal) {
                maxVal = b.getMaxSpeed();
                maxKey = b.getKey();
            }
        }
        return new SpeedChartDto(buckets, maxKey);
    }

    public List<TempPointDto> temperatureHistory(Long id, long fromMs, long toMs, User currentUser) {
        loadAuthorizedVehicle(id, currentUser);
        return readingRepo.findByVehicleidAndTsBetweenOrderByTsAsc(
                        id, Instant.ofEpochMilli(fromMs), Instant.ofEpochMilli(toMs))
                .stream()
                .map(r -> new TempPointDto(
                        r.getTs().toEpochMilli(),
                        r.getEngineTemp() == null ? 0 : r.getEngineTemp()))
                .collect(Collectors.toList());
    }

    public CompareDto compare(List<Long> ids, String metric, long fromMs, long toMs, User currentUser) {
        boolean isTemp = "temp".equalsIgnoreCase(metric);
        Instant from = Instant.ofEpochMilli(fromMs);
        Instant to = Instant.ofEpochMilli(toMs);

        List<CompareSeriesDto> series = new ArrayList<>();
        for (Long id : ids) {
            Vehicle v;
            try {
                v = loadAuthorizedVehicle(id, currentUser);
            } catch (ResponseStatusException e) {
                // Skip vehicles the user can't access rather than failing the whole compare.
                continue;
            }
            List<VehicleReading> readings = readingRepo
                    .findByVehicleidAndTsBetweenOrderByTsAsc(id, from, to);
            int sampleEvery = Math.max(1, readings.size() / 200);
            List<ComparePointDto> points = new ArrayList<>();
            for (int i = 0; i < readings.size(); i += sampleEvery) {
                VehicleReading r = readings.get(i);
                double value = isTemp
                        ? (r.getEngineTemp() == null ? 0 : r.getEngineTemp())
                        : (r.getSpeed() == null ? 0 : r.getSpeed());
                points.add(new ComparePointDto(r.getTs().toEpochMilli(), round1(value)));
            }
            series.add(new CompareSeriesDto(v.getVehicleid(), v.getName(), points));
        }
        return new CompareDto(isTemp ? "temp" : "speed", series);
    }

    /* ---------- Helpers ---------- */

    private Vehicle loadAuthorizedVehicle(Long id, User currentUser) {
        Vehicle v = vehicleRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vehicle not found"));
        if (currentUser.getRole() != Role.ADMIN) {
            Long ownerId = v.getOwnerId();
            if (ownerId == null || !ownerId.equals(currentUser.getUserId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your vehicle");
            }
        }
        return v;
    }

    private long inferStepMinutes(List<VehicleReading> readings) {
        if (readings.size() < 2) return 15;
        long diffMs = readings.get(1).getTs().toEpochMilli() - readings.get(0).getTs().toEpochMilli();
        long mins = Math.max(1, diffMs / 60_000);
        return Math.min(mins, 60);
    }

    private static double round1(double d) {
        return Math.round(d * 10.0) / 10.0;
    }

    private static class BucketAcc {
        final String label;
        final String key;
        final long firstTs;
        double sum = 0;
        double max = 0;
        int count = 0;
        BucketAcc(String label, String key, long firstTs) {
            this.label = label;
            this.key = key;
            this.firstTs = firstTs;
        }
    }
}
