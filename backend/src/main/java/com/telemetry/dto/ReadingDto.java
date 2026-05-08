package com.telemetry.dto;

import com.telemetry.entity.VehicleReading;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReadingDto {
    private Long readingid;
    private Long vehicleid;
    private Double speed;
    private Double engineTemp;
    private Double lat;
    private Double lon;
    private long ts;

    public static ReadingDto from(VehicleReading r) {
        return new ReadingDto(
                r.getReadingid(),
                r.getVehicleid(),
                r.getSpeed(),
                r.getEngineTemp(),
                r.getLat(),
                r.getLon(),
                r.getTs().toEpochMilli()
        );
    }
}
