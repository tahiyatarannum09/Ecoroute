/**
 * EcoRoute AI: Virtual OBD-II Telemetry Simulator & Live Driving Physics
 * Simulates CAN bus sensor signals, engine RPM, throttle, exhaust PPM, and leak alerts
 * Department of Electronics & Communication Engineering, BITM Ballari
 */

class TelemetrySimulator {
  constructor() {
    this.isRunning = false;
    this.isPaused = false;
    this.timer = null;
    this.speedMultiplier = 1; // 1x, 2x, 5x, 10x
    this.currentSegmentIndex = 0;
    this.progressInSegment = 0; // 0.0 to 1.0
    this.routeWaypoints = [];
    this.routeLeaks = [];
    this.vehicle = null;
    this.cargoLoad = 50;
    
    // Dynamic physical state
    this.currentSpeed = 0; // km/h
    this.currentAccel = 0; // m/s2
    this.currentGradient = 0; // %
    this.currentCo2Gps = 0;
    this.currentExhaustPpm = 410; // ambient CO2 base
    this.totalTripCo2Grams = 0;
    this.totalDistanceCoveredKm = 0;
    this.activeLeakEvent = null;
    this.audioAlertEnabled = true;

    // Flight Data Recorder for research analysis & CSV export
    this.telemetryLog = [];

    // Web Audio Synthesizer for alerts & engine sound
    this.audioCtx = null;
  }

  initAudio() {
    if (!this.audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContextClass();
      } catch (e) {
        console.warn("AudioContext initialization skipped", e);
      }
    }
  }

  playLeakWarningSound() {
    if (!this.audioAlertEnabled || !this.audioCtx) return;
    try {
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, this.audioCtx.currentTime); // D5 note
      osc.frequency.exponentialRampToValueAtTime(880, this.audioCtx.currentTime + 0.15); // A5 note

      gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.35);
    } catch (e) {
      // Audio autoplay restrictions
    }
  }

  loadRoute(waypoints, leaks, vehicle, cargoLoad = 50) {
    this.stop();
    this.routeWaypoints = waypoints || [];
    this.routeLeaks = leaks || [];
    this.vehicle = vehicle;
    this.cargoLoad = cargoLoad;
    this.currentSegmentIndex = 0;
    this.progressInSegment = 0;
    this.totalTripCo2Grams = 0;
    this.totalDistanceCoveredKm = 0;
    this.currentSpeed = 0;
    this.activeLeakEvent = null;
    this.telemetryLog = [];

    if (window.appUI && this.routeWaypoints.length > 0) {
      window.appUI.updateVehiclePosition(this.routeWaypoints[0], 0);
    }
  }

  start() {
    if (this.routeWaypoints.length < 2) return;
    this.initAudio();
    this.isRunning = true;
    this.isPaused = false;
    
    if (this.timer) clearInterval(this.timer);
    
    const tickIntervalMs = 150; // 6.6 Hz telemetry tick
    this.timer = setInterval(() => {
      this.tick(tickIntervalMs / 1000);
    }, tickIntervalMs);

    if (window.appUI) {
      window.appUI.onTelemetryStart();
    }
  }

  pause() {
    this.isPaused = true;
    if (this.timer) clearInterval(this.timer);
    if (window.appUI) {
      window.appUI.onTelemetryPause();
    }
  }

  resume() {
    if (!this.isRunning) {
      this.start();
    } else {
      this.isPaused = false;
      const tickIntervalMs = 150;
      this.timer = setInterval(() => {
        this.tick(tickIntervalMs / 1000);
      }, tickIntervalMs);
      if (window.appUI) {
        window.appUI.onTelemetryResume();
      }
    }
  }

  stop() {
    this.isRunning = false;
    this.isPaused = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.currentSpeed = 0;
    this.currentAccel = 0;
    this.activeLeakEvent = null;
    if (window.appUI) {
      window.appUI.onTelemetryStop();
    }
  }

  setSpeedMultiplier(multiplier) {
    this.speedMultiplier = multiplier;
  }

  tick(deltaSec) {
    if (!this.isRunning || this.isPaused) return;

    const numSegments = this.routeWaypoints.length - 1;
    if (this.currentSegmentIndex >= numSegments) {
      // Journey finished
      this.stop();
      if (window.appUI) {
        window.appUI.onTripCompleted(this.totalTripCo2Grams, this.totalDistanceCoveredKm);
      }
      return;
    }

    const p1 = this.routeWaypoints[this.currentSegmentIndex];
    const p2 = this.routeWaypoints[this.currentSegmentIndex + 1];

    // Compute segment distance in meters (haversine)
    const segDistM = this.haversineMeters(p1[0], p1[1], p2[0], p2[1]);
    
    // Check if this segment contains or is near a carbon leak
    const nearbyLeak = this.checkNearbyLeak(p1, p2);

    // Determine target speed for this segment
    let targetSpeed = 48; // default cruising
    let segmentGradient = (Math.sin(this.currentSegmentIndex * 1.5) * 3.5); // synthetic slope %

    if (nearbyLeak) {
      if (nearbyLeak.type === "IDLE_BOTTLENECK") {
        targetSpeed = 4; // crawl / jam
      } else if (nearbyLeak.type === "ACCEL_SHOCK_WAVE") {
        targetSpeed = (Math.sin(Date.now() / 600) > 0) ? 35 : 8; // surging
      } else if (nearbyLeak.type === "GRADIENT_PENALTY") {
        targetSpeed = 32;
        segmentGradient = 6.8; // steep uphill
      }
    } else {
      // Normal variation
      targetSpeed = 50 + (Math.sin(this.currentSegmentIndex) * 12);
    }

    // Physics acceleration toward target speed
    const effectiveTargetSpeed = Math.max(0, targetSpeed);
    const speedDiff = effectiveTargetSpeed - this.currentSpeed;
    const accelRate = speedDiff > 0 ? 1.8 : -2.6; // m/s^2
    this.currentAccel = Math.abs(speedDiff) < 1.0 ? 0 : accelRate;

    // Apply speed change with multiplier
    this.currentSpeed += (this.currentAccel * 3.6 * deltaSec * this.speedMultiplier);
    this.currentSpeed = Math.max(0, Math.min(110, this.currentSpeed));
    this.currentGradient = segmentGradient;

    // Calculate emission for this moment
    const congestionFactor = nearbyLeak ? 0.85 : 0.25;
    const telemetry = window.ecoAIEngine.calculateInstantaneousEmission(
      this.vehicle,
      this.currentSpeed,
      this.currentAccel,
      this.currentGradient,
      this.cargoLoad,
      congestionFactor
    );

    // Integrate total trip CO2 and distance
    const distTraveledM = ((this.currentSpeed / 3.6) * deltaSec * this.speedMultiplier);
    const distTraveledKm = distTraveledM / 1000;
    this.totalDistanceCoveredKm += distTraveledKm;

    const co2EmittedTick = telemetry.co2Gps * deltaSec * this.speedMultiplier;
    this.totalTripCo2Grams += co2EmittedTick;

    // Smoothly advance across one or multiple dense OSRM segment vertices
    let remainingM = distTraveledM;
    while (remainingM > 0 && this.currentSegmentIndex < numSegments) {
      const curP1 = this.routeWaypoints[this.currentSegmentIndex];
      const curP2 = this.routeWaypoints[this.currentSegmentIndex + 1];
      const curSegDistM = Math.max(0.5, this.haversineMeters(curP1[0], curP1[1], curP2[0], curP2[1]));
      const distLeftInCurSeg = (1.0 - this.progressInSegment) * curSegDistM;

      if (remainingM >= distLeftInCurSeg) {
        remainingM -= distLeftInCurSeg;
        this.currentSegmentIndex++;
        this.progressInSegment = 0;
      } else {
        this.progressInSegment += (remainingM / curSegDistM);
        remainingM = 0;
      }
    }

    if (this.currentSegmentIndex >= numSegments) {
      this.stop();
      if (window.appUI) {
        window.appUI.onTripCompleted(this.totalTripCo2Grams, this.totalDistanceCoveredKm);
      }
      return;
    }

    // Interpolate current GPS position
    const safeIdx = Math.min(this.currentSegmentIndex, numSegments - 1);
    const curP1 = this.routeWaypoints[safeIdx];
    const curP2 = this.routeWaypoints[Math.min(safeIdx + 1, this.routeWaypoints.length - 1)];
    const currentLat = curP1[0] + (curP2[0] - curP1[0]) * this.progressInSegment;
    const currentLng = curP1[1] + (curP2[1] - curP1[1]) * this.progressInSegment;
    const currentBearing = this.calculateBearing(curP1[0], curP1[1], curP2[0], curP2[1]);

    // Synthetic exhaust sensor PPM (parts per million)
    this.currentExhaustPpm = Math.round(410 + (telemetry.co2Gps * 280) + (Math.random() * 20 - 10));

    // Record telemetry log entry for CSV/JSON export
    this.telemetryLog.push({
      timestamp: new Date().toISOString(),
      distanceKm: parseFloat(this.totalDistanceCoveredKm.toFixed(3)),
      lat: parseFloat(currentLat.toFixed(6)),
      lng: parseFloat(currentLng.toFixed(6)),
      speedKmh: Math.round(this.currentSpeed),
      accelMps2: parseFloat(this.currentAccel.toFixed(2)),
      gradientPct: parseFloat(this.currentGradient.toFixed(1)),
      rpm: telemetry.engineRpm,
      throttlePct: telemetry.throttlePct,
      fuelRateLph: parseFloat(telemetry.fuelRateLPerHr.toFixed(2)),
      co2RateGpk: parseFloat(telemetry.co2PerKm.toFixed(1)),
      co2Gps: parseFloat(telemetry.co2Gps.toFixed(3)),
      exhaustPpm: this.currentExhaustPpm,
      cumulativeCo2Grams: Math.round(this.totalTripCo2Grams),
      isLeak: telemetry.isLeak ? 1 : 0,
      leakType: telemetry.leakType || "OPTIMAL"
    });

    // Check for leak state change to trigger chime and alert
    if (telemetry.isLeak && !this.activeLeakEvent) {
      this.activeLeakEvent = {
        leak: nearbyLeak || {
          title: "Sudden Kinetic Carbon Leak Detected",
          type: telemetry.leakType,
          cause: telemetry.leakCause,
          severity: telemetry.leakSeverity
        },
        detectedAt: new Date().toLocaleTimeString()
      };
      this.playLeakWarningSound();
      if (window.appUI) {
        window.appUI.onLeakDetected(this.activeLeakEvent);
      }
    } else if (!telemetry.isLeak && this.activeLeakEvent) {
      this.activeLeakEvent = null;
      if (window.appUI) {
        window.appUI.onLeakCleared();
      }
    }

    // Broadcast update to UI
    if (window.appUI) {
      window.appUI.updateTelemetryHUD({
        speedKmh: Math.round(this.currentSpeed),
        accelMps2: parseFloat(this.currentAccel.toFixed(1)),
        gradientPct: parseFloat(this.currentGradient.toFixed(1)),
        co2PerKm: telemetry.co2PerKm,
        co2Gps: telemetry.co2Gps,
        exhaustPpm: this.currentExhaustPpm,
        fuelRateLPerHr: telemetry.fuelRateLPerHr,
        engineRpm: telemetry.engineRpm,
        throttlePct: telemetry.throttlePct,
        totalCo2Grams: Math.round(this.totalTripCo2Grams),
        distanceKm: parseFloat(this.totalDistanceCoveredKm.toFixed(2)),
        isLeak: telemetry.isLeak,
        leakSeverity: telemetry.leakSeverity,
        leakType: telemetry.leakType,
        leakCause: telemetry.leakCause,
        latLng: [currentLat, currentLng],
        bearing: currentBearing,
        progressPct: Math.min(100, Math.round(((this.currentSegmentIndex + this.progressInSegment) / numSegments) * 100))
      });
    }
  }

  checkNearbyLeak(p1, p2) {
    if (!this.routeLeaks || this.routeLeaks.length === 0) return null;
    const midLat = (p1[0] + p2[0]) / 2;
    const midLng = (p1[1] + p2[1]) / 2;

    for (const leak of this.routeLeaks) {
      const dist = this.haversineMeters(midLat, midLng, leak.coords[0], leak.coords[1]);
      if (dist < 450) { // within 450 meters
        return leak;
      }
    }
    return null;
  }

  haversineMeters(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  calculateBearing(lat1, lon1, lat2, lon2) {
    const y = Math.sin((lon2 - lon1) * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180);
    const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
              Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos((lon2 - lon1) * Math.PI / 180);
    const θ = Math.atan2(y, x);
    return (θ * 180 / Math.PI + 360) % 360; // in degrees
  }

  /**
   * Export telemetry log as CSV dataset for research & analysis
   */
  exportCSV() {
    if (!this.telemetryLog || this.telemetryLog.length === 0) {
      if (window.appUI) window.appUI.showToast("⚠️ No telemetry records yet. Start a virtual drive first!");
      return;
    }
    const headers = Object.keys(this.telemetryLog[0]);
    const csvRows = [headers.join(",")];
    for (const row of this.telemetryLog) {
      csvRows.push(headers.map(h => row[h]).join(","));
    }
    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(csvRows.join("\n"));
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", `ecoroute_obd2_telemetry_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (window.appUI) window.appUI.showToast(`📊 Exported ${this.telemetryLog.length} OBD-II telemetry records as CSV.`);
  }

  /**
   * Export telemetry flight data as JSON
   */
  exportJSON() {
    if (!this.telemetryLog || this.telemetryLog.length === 0) {
      if (window.appUI) window.appUI.showToast("⚠️ No telemetry records yet. Start a virtual drive first!");
      return;
    }
    const jsonStr = JSON.stringify({
      system: "EcoRoute AI: Carbon Leak Detector",
      institution: "BITM Ballari · Department of ECE",
      vehicle: this.vehicle?.name,
      cargoPayload: this.cargoLoad,
      totalDistanceKm: parseFloat(this.totalDistanceCoveredKm.toFixed(2)),
      totalCo2Grams: Math.round(this.totalTripCo2Grams),
      dataPointsCount: this.telemetryLog.length,
      records: this.telemetryLog
    }, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(jsonStr);
    const link = document.createElement("a");
    link.setAttribute("href", dataUri);
    link.setAttribute("download", `ecoroute_flight_data_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (window.appUI) window.appUI.showToast(`📄 Exported ${this.telemetryLog.length} JSON data points.`);
  }
}

// Global instance
window.ecoTelemetry = new TelemetrySimulator();
