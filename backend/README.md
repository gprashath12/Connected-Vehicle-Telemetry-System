# Vehicle Telemetry — Backend

Spring Boot 3 + Spring Data JPA + MySQL. Serves the REST API consumed by the React frontend.

## Prerequisites

- JDK 17+
- Maven 3.9+
- MySQL 8.x running locally on `3306`

## Configure DB

Edit [src/main/resources/application.properties](src/main/resources/application.properties):

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/vehicle_telemetry?createDatabaseIfNotExist=true&serverTimezone=UTC&useSSL=false&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=root
```

The schema is created automatically by Hibernate (`ddl-auto=update`). The database `vehicle_telemetry` is auto-created on first run.

## Run

```bash
cd backend
mvn spring-boot:run
```

API is served at **http://localhost:8082**.

On first start, `DataSeeder` populates 10 vehicles × 30 days × 15-minute interval readings (~28,800 rows). It only seeds when `vehicle` is empty — wipe the DB to re-seed. Disable with `telemetry.seed.enabled=false`.

## REST endpoints

All under `/api/vehicles`:

| Method | Path | Query | Returns |
|---|---|---|---|
| GET | `/` | — | `[VehicleDto]` |
| GET | `/{id}` | — | `VehicleDto` |
| GET | `/{id}/latest` | — | `ReadingDto` |
| GET | `/{id}/kpis` | `from`, `to` (epoch ms) | `KpiDto` |
| GET | `/{id}/speed-chart` | `period=day\|week\|month` | `SpeedChartDto` |
| GET | `/{id}/temperature-history` | `from`, `to` | `[TempPointDto]` |
| GET | `/compare` | `ids=1,2,3`, `metric=speed\|temp`, `from`, `to` | `CompareDto` |

## Schema

```
vehicle (vehicleid PK, manufacturer, model, name, registeredon, vehicle_code UNIQUE)
vehicle_readings (readingid PK, vehicleid FK, speed, engineTemp, lat, lon, ts, INDEX(vehicleid,ts))
```

## Frontend wiring

The frontend's [src/api/client.js](../frontend/src/api/client.js) is set to `USE_MOCK = false`. Vite proxies `/api/*` → `http://localhost:8082`. Just run `npm run dev` in `frontend/` and it'll talk to this backend.

## Layout

```
src/main/java/com/telemetry/
├── TelemetryApplication.java
├── config/WebConfig.java          # CORS for localhost:5173
├── entity/                        # Vehicle, VehicleReading
├── repository/                    # Spring Data JPA repos
├── dto/                           # API response shapes
├── util/DistanceUtil.java         # Haversine
├── service/TelemetryService.java  # KPI calc, bucketing, compare
├── controller/VehicleController.java
└── seed/DataSeeder.java           # CommandLineRunner
```
