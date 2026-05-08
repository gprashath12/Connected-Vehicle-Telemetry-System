package com.telemetry.util;

import com.telemetry.entity.VehicleReading;

import java.util.List;

public final class DistanceUtil {
    private static final double EARTH_RADIUS_KM = 6371.0;

    private DistanceUtil() {}

    public static double haversineKm(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                 + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                 * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
    }

    public static double totalDistanceKm(List<VehicleReading> readings) {
        if (readings == null || readings.size() < 2) return 0.0;
        double total = 0.0;
        for (int i = 1; i < readings.size(); i++) {
            VehicleReading a = readings.get(i - 1);
            VehicleReading b = readings.get(i);
            if (a.getLat() == null || b.getLat() == null) continue;
            total += haversineKm(a.getLat(), a.getLon(), b.getLat(), b.getLon());
        }
        return total;
    }
}
