package com.telemetry.seed;

import com.telemetry.entity.Role;
import com.telemetry.entity.User;
import com.telemetry.entity.Vehicle;
import com.telemetry.entity.VehicleReading;
import com.telemetry.repository.UserRepository;
import com.telemetry.repository.VehicleReadingRepository;
import com.telemetry.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private record VehicleSpec(
            String manufacturer, String model, String name, String code,
            LocalDate registeredon, double baseLat, double baseLon, int ownerIndex
    ) {}

    // Phase 2 distribution: client0=4 vehicles, client1=3, client2=3
    private static final List<VehicleSpec> SPECS = List.of(
            new VehicleSpec("Tata", "Ace Gold", "Delivery-01", "TN-01-AB-1234", LocalDate.of(2022, 4, 12), 12.9716, 77.5946, 0),
            new VehicleSpec("Mahindra", "Bolero Pickup", "Delivery-02", "TN-03-CD-5678", LocalDate.of(2021, 11, 3), 12.9352, 77.6245, 0),
            new VehicleSpec("Ashok Leyland", "Dost+", "Cargo-11", "TN-05-EF-9012", LocalDate.of(2023, 1, 21), 13.0359, 77.5970, 0),
            new VehicleSpec("Eicher", "Pro 2049", "Cargo-12", "TN-09-GH-3456", LocalDate.of(2020, 8, 9), 12.9082, 77.6476, 0),
            new VehicleSpec("Tata", "Intra V30", "Service-21", "TN-02-IJ-7890", LocalDate.of(2022, 6, 15), 12.9784, 77.6408, 1),
            new VehicleSpec("Mahindra", "Jeeto", "Service-22", "TS-04-KL-2345", LocalDate.of(2023, 3, 30), 12.9606, 77.5775, 1),
            new VehicleSpec("Force", "Traveller", "Crew-31", "AP-06-MN-6789", LocalDate.of(2021, 2, 18), 12.9897, 77.5712, 1),
            new VehicleSpec("Tata", "Winger", "Crew-32", "TS-07-OP-0123", LocalDate.of(2022, 12, 5), 12.9251, 77.5938, 2),
            new VehicleSpec("Bharat Benz", "1015R", "Heavy-41", "KA-10-QR-4567", LocalDate.of(2020, 5, 22), 13.0207, 77.6479, 2),
            new VehicleSpec("Volvo", "FM 380", "Heavy-42", "KL-11-ST-8901", LocalDate.of(2019, 9, 14), 12.9569, 77.7011, 2)
    );

    private static final List<UserSpec> USERS = List.of(
            new UserSpec("admin@gmail.com",  "Admin@123",  "System Admin",  Role.ADMIN),
            new UserSpec("client1@gmail.com", "Client@123", "Client One",   Role.CLIENT),
            new UserSpec("client2@gmail.com", "Client@123", "Client Two",   Role.CLIENT),
            new UserSpec("client3@gmail.com", "Client@123", "Client Three", Role.CLIENT)
    );

    private record UserSpec(String email, String password, String fullName, Role role) {}

    private final UserRepository userRepo;
    private final VehicleRepository vehicleRepo;
    private final VehicleReadingRepository readingRepo;
    private final PasswordEncoder passwordEncoder;

    @Value("${telemetry.seed.enabled:true}")
    private boolean seedEnabled;

    @Value("${telemetry.seed.days:30}")
    private int days;

    @Value("${telemetry.seed.interval-minutes:15}")
    private int intervalMinutes;

    @Override
    @Transactional
    public void run(String... args) {
        if (!seedEnabled) {
            log.info("Seeding disabled (telemetry.seed.enabled=false).");
            return;
        }

        // Seed users (idempotent — only inserts missing ones).
        List<User> seededUsers = new ArrayList<>();
        for (UserSpec us : USERS) {
            User u = userRepo.findByEmail(us.email()).orElseGet(() -> userRepo.save(
                    User.builder()
                            .email(us.email())
                            .passwordHash(passwordEncoder.encode(us.password()))
                            .fullName(us.fullName())
                            .role(us.role())
                            .createdAt(Instant.now())
                            .build()
            ));
            seededUsers.add(u);
            log.info("  User: {} ({})", u.getEmail(), u.getRole());
        }

        // The non-admin users in seed order — index 0..2 are the 3 clients.
        List<User> clients = seededUsers.stream().filter(u -> u.getRole() == Role.CLIENT).toList();

        if (vehicleRepo.count() > 0) {
            log.info("Vehicle table not empty — skipping vehicle/reading seed.");
            return;
        }

        log.info("Seeding {} vehicles with {} days of readings each...", SPECS.size(), days);
        for (VehicleSpec spec : SPECS) {
            User owner = clients.get(spec.ownerIndex());
            Vehicle v = new Vehicle();
            v.setManufacturer(spec.manufacturer());
            v.setModel(spec.model());
            v.setName(spec.name());
            v.setVehicle_code(spec.code());
            v.setRegisteredon(spec.registeredon());
            v.setOwner(owner);
            v = vehicleRepo.save(v);
            seedReadings(v, spec);
            log.info("  Vehicle {} → owner {}", v.getName(), owner.getEmail());
        }
        log.info("Seeding complete.");
    }

    private void seedReadings(Vehicle v, VehicleSpec spec) {
        Random rng = new Random(v.getVehicleid() * 1000L + 7);
        long now = System.currentTimeMillis();
        long start = now - days * 24L * 60 * 60 * 1000;
        long stepMs = intervalMinutes * 60L * 1000;

        double lat = spec.baseLat();
        double lon = spec.baseLon();
        double prevSpeed = 0;
        double prevTemp = 80;

        List<VehicleReading> batch = new ArrayList<>();
        for (long t = start; t <= now; t += stepMs) {
            ZonedDateTime z = Instant.ofEpochMilli(t).atZone(ZoneId.systemDefault());
            int hour = z.getHour();
            int dow = z.getDayOfWeek().getValue();
            boolean isWorkHour = hour >= 7 && hour <= 20;
            boolean isWeekend = dow == 6 || dow == 7;

            // Decide simulated state: MOVING / IDLING / OFF.
            // OFF means we DON'T write a row (gap in the time series).
            double stateRoll = rng.nextDouble();
            String state;
            if (!isWorkHour) {
                if (stateRoll < 0.7) state = "OFF";
                else if (stateRoll < 0.85) state = "IDLING";
                else state = "MOVING";
            } else if (isWeekend) {
                if (stateRoll < 0.55) state = "OFF";
                else if (stateRoll < 0.75) state = "IDLING";
                else state = "MOVING";
            } else {
                if (stateRoll < 0.15) state = "OFF";
                else if (stateRoll < 0.40) state = "IDLING";
                else state = "MOVING";
            }

            if ("OFF".equals(state)) {
                prevSpeed = 0;
                continue; // critical — no row written
            }

            double speed;
            if ("IDLING".equals(state)) {
                speed = 0;
            } else {
                double r = rng.nextDouble();
                double target;
                if (r < 0.4) target = 30 + rng.nextDouble() * 25;
                else if (r < 0.85) target = 50 + rng.nextDouble() * 30;
                else target = 80 + rng.nextDouble() * 25;
                speed = Math.max(0, prevSpeed * 0.4 + target * 0.6 + (rng.nextDouble() - 0.5) * 8);
            }
            prevSpeed = speed;

            double targetTemp;
            if (speed < 5) targetTemp = 75 + rng.nextDouble() * 10;
            else if (speed < 60) targetTemp = 85 + rng.nextDouble() * 8;
            else targetTemp = 92 + rng.nextDouble() * 12;
            if (rng.nextDouble() < 0.015) targetTemp += 10 + rng.nextDouble() * 8;
            double temp = prevTemp * 0.7 + targetTemp * 0.3;
            prevTemp = temp;

            if (speed > 1) {
                lat += (rng.nextDouble() - 0.5) * 0.005;
                lon += (rng.nextDouble() - 0.5) * 0.005;
            }

            VehicleReading r = new VehicleReading();
            r.setVehicleid(v.getVehicleid());
            r.setSpeed(round1(speed));
            r.setEngineTemp(round1(temp));
            r.setLat(round5(lat));
            r.setLon(round5(lon));
            r.setTs(Instant.ofEpochMilli(t));
            batch.add(r);

            if (batch.size() >= 500) {
                readingRepo.saveAll(batch);
                batch.clear();
            }
        }
        if (!batch.isEmpty()) readingRepo.saveAll(batch);
    }

    private static double round1(double d) { return Math.round(d * 10.0) / 10.0; }
    private static double round5(double d) { return Math.round(d * 100000.0) / 100000.0; }
}
