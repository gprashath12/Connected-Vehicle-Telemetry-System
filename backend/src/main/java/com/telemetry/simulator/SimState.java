package com.telemetry.simulator;

public enum SimState {
    /** Vehicle in motion: speed > 0, location changing. Generates a row each tick. */
    MOVING,
    /** Engine on but parked: speed = 0, location constant. Generates a row each tick. */
    IDLING,
    /** Engine off. NO row written — the absence of data IS the OFF signal. */
    OFF
}
