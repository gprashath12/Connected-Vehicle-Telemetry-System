package com.telemetry.simulator;

import com.telemetry.entity.Vehicle;
import com.telemetry.entity.VehicleReading;
import com.telemetry.repository.VehicleReadingRepository;
import com.telemetry.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Generates one round of synthetic readings for every vehicle on a fixed cadence.
 *
 * State machine per vehicle:
 *   MOVING  → row written, speed > 0, lat/lon drifting
 *   IDLING  → row written, speed = 0, lat/lon static
 *   OFF     → NO ROW WRITTEN. Gaps in the time series mark engine-off periods.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class VehicleSimulator {

    private final VehicleRepository vehicleRepo;
    private final VehicleReadingRepository readingRepo;

    @Value("${telemetry.simulator.enabled:true}")
    private boolean enabled;

    /** Per-vehicle simulation context (lat/lon/temp drift between ticks). */
    private static class Ctx {
        SimState state = SimState.IDLING;
        double lat;
        double lon;
        double lastTemp = 80.0;
        double prevSpeed = 0.0;
    }

    private final Map<Long, Ctx> ctxs = new ConcurrentHashMap<>();
    private final Map<Long, Random> rngs = new ConcurrentHashMap<>();

    @Scheduled(fixedRateString = "${telemetry.simulator.tick-ms:60000}", initialDelay = 5000)
    @Transactional
    public void tick() {
        if (!enabled) return;

        List<Vehicle> vehicles = vehicleRepo.findAll();
        if (vehicles.isEmpty()) return;

        Instant now = Instant.now();
        ZonedDateTime z = now.atZone(ZoneId.systemDefault());
        boolean workHour = z.getHour() >= 7 && z.getHour() <= 20;
        boolean weekend = z.getDayOfWeek().getValue() >= 6;

        List<VehicleReading> toWrite = new ArrayList<>();

        for (Vehicle v : vehicles) {
            Ctx ctx = ctxs.computeIfAbsent(v.getVehicleid(), id -> bootstrap(v));
            Random rng = rngs.computeIfAbsent(v.getVehicleid(), id -> new Random(id * 9301L + 49297L));

            ctx.state = nextState(ctx.state, rng, workHour, weekend);

            if (ctx.state == SimState.OFF) {
                ctx.prevSpeed = 0;
                continue; // critical: NO row written for OFF
            }

            double speed;
            if (ctx.state == SimState.MOVING) {
                double target;
                double r = rng.nextDouble();
                if (r < 0.4) target = 30 + rng.nextDouble() * 25;
                else if (r < 0.85) target = 50 + rng.nextDouble() * 30;
                else target = 80 + rng.nextDouble() * 25;
                speed = Math.max(0, ctx.prevSpeed * 0.4 + target * 0.6 + (rng.nextDouble() - 0.5) * 6);
                ctx.lat += (rng.nextDouble() - 0.5) * 0.005;
                ctx.lon += (rng.nextDouble() - 0.5) * 0.005;
            } else {
                speed = 0;
            }
            ctx.prevSpeed = speed;

            double targetTemp;
            if (speed < 5) targetTemp = 78 + rng.nextDouble() * 10;
            else if (speed < 60) targetTemp = 86 + rng.nextDouble() * 8;
            else targetTemp = 92 + rng.nextDouble() * 12;
            if (rng.nextDouble() < 0.01) targetTemp += 8 + rng.nextDouble() * 8;
            double temp = ctx.lastTemp * 0.7 + targetTemp * 0.3;
            ctx.lastTemp = temp;

            VehicleReading r = new VehicleReading();
            r.setVehicleid(v.getVehicleid());
            r.setSpeed(round1(speed));
            r.setEngineTemp(round1(temp));
            r.setLat(round5(ctx.lat));
            r.setLon(round5(ctx.lon));
            r.setTs(now);
            toWrite.add(r);
        }

        if (!toWrite.isEmpty()) {
            readingRepo.saveAll(toWrite);
            if (log.isDebugEnabled()) {
                log.debug("Simulator tick wrote {} readings @ {}", toWrite.size(), now);
            }
        }
    }

    /**
     * State transition logic. Each tick a vehicle has a small chance to transition.
     * Probability of each target state depends on time of day / day of week.
     */
    private SimState nextState(SimState current, Random rng, boolean workHour, boolean weekend) {
        // 85% chance to keep current state — gives realistic, persistent runs.
        if (rng.nextDouble() < 0.85) return current;

        double r = rng.nextDouble();
        if (workHour && !weekend) {
            if (r < 0.55) return SimState.MOVING;
            if (r < 0.85) return SimState.IDLING;
            return SimState.OFF;
        } else if (workHour && weekend) {
            if (r < 0.20) return SimState.MOVING;
            if (r < 0.45) return SimState.IDLING;
            return SimState.OFF;
        } else {
            // Off-hours
            if (r < 0.05) return SimState.MOVING;
            if (r < 0.15) return SimState.IDLING;
            return SimState.OFF;
        }
    }

    private Ctx bootstrap(Vehicle v) {
        Ctx ctx = new Ctx();
        Optional<VehicleReading> last = readingRepo.findFirstByVehicleidOrderByTsDesc(v.getVehicleid());
        if (last.isPresent()) {
            VehicleReading r = last.get();
            ctx.lat = r.getLat() != null ? r.getLat() : 12.97;
            ctx.lon = r.getLon() != null ? r.getLon() : 77.59;
            ctx.lastTemp = r.getEngineTemp() != null ? r.getEngineTemp() : 80.0;
            ctx.prevSpeed = r.getSpeed() != null ? r.getSpeed() : 0;
            ctx.state = (r.getSpeed() != null && r.getSpeed() > 1) ? SimState.MOVING : SimState.IDLING;
        } else {
            ctx.lat = 12.97 + (v.getVehicleid() % 10) * 0.01;
            ctx.lon = 77.59 + (v.getVehicleid() % 10) * 0.01;
            ctx.state = SimState.OFF;
        }
        return ctx;
    }

    private static double round1(double d) { return Math.round(d * 10.0) / 10.0; }
    private static double round5(double d) { return Math.round(d * 100000.0) / 100000.0; }
}
