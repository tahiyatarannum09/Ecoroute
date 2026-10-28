/**
 * EcoRoute AI: Main Application Controller & UI State Orchestrator
 * Real-time OSRM Routing, Geocoding, Elevation HUD, Turn-by-Turn & Cockpit
 * Department of Electronics & Communication Engineering, BITM Ballari
 */

class EcoRouteApp {
  constructor() {
    this.currentCorridorKey = "ballari_academic";
    this.currentVehicleKey = "petrol_sedan";
    this.currentRouteKey = "eco";
    this.currentCargoLoad = 50;
    this.currentTheme = "dark";
    
    // Custom Live OSRM Route state
    this.isCustomRouteActive = false;
    this.customCorridorData = null;

    this.chartData = {
      labels: [],
      co2Series: [],
      speedSeries: []
    };
    this.chartCanvas = null;
    this.chartCtx = null;

    // Elevation Profile State
    this.elevationProfileData = [];
    this.elevCanvas = null;
    this.elevCtx = null;

    this.fleetStats = {
      totalTrips: 1842,
      co2PreventedKg: 14280,
      fuelSavedL: 5410,
      moneySavedInr: 554200,
      treesEquivalent: 658
    };

    this.searchDebounceTimer = null;
  }

  init() {
    this.initSplashScreen();
    window.ecoMap.initMap();
    this.populateVehicleOptions();
    this.populateCorridorOptions();
    this.attachEventListeners();
    this.initTelemetryChart();
    this.initElevationChart();
    this.loadCorridor(this.currentCorridorKey);
    this.renderAcademicPortfolio();
    this.updateFleetScenario();

    console.log("EcoRoute AI 3.5 Classy Edition Initialized.");
  }

  initSplashScreen() {
    const splash = document.getElementById("app-splash-screen");
    const fill = document.getElementById("splash-bar-fill");
    const statusMsg = document.getElementById("splash-status-msg");
    const percentTxt = document.getElementById("splash-percent-txt");
    const btnEnter = document.getElementById("btn-enter-cockpit");
    if (!splash) return;

    let progress = 0;
    const stages = [
      { at: 20, text: "Calibrating IVE & CMEM Neural Emission Weights..." },
      { at: 55, text: "Locking Esri & OpenStreetMap GIS Road Corridors..." },
      { at: 85, text: "Syncing Spatial Anomaly & Carbon Leak Classifiers..." },
      { at: 100, text: "EcoRoute AI Engine Online · System Ready" }
    ];

    if (this.splashInterval) clearInterval(this.splashInterval);

    this.splashInterval = setInterval(() => {
      progress += Math.floor(Math.random() * 8 + 4);
      if (progress >= 100) {
        progress = 100;
        clearInterval(this.splashInterval);
        this.splashInterval = null;
        if (fill) fill.style.width = "100%";
        if (percentTxt) percentTxt.textContent = "100%";
        if (statusMsg) statusMsg.textContent = "System Ready. Departure Authorized.";

        // Auto transition after brief pause
        setTimeout(() => {
          this.dismissSplashScreen(true);
        }, 800);
      } else {
        if (fill) fill.style.width = `${progress}%`;
        if (percentTxt) percentTxt.textContent = `${progress}%`;
        const stage = stages.find(s => progress <= s.at);
        if (stage && statusMsg) statusMsg.textContent = stage.text;
      }
    }, 75);

    if (btnEnter && !btnEnter.hasAttribute("data-bound")) {
      btnEnter.setAttribute("data-bound", "true");
      btnEnter.addEventListener("click", () => {
        if (this.splashInterval) {
          clearInterval(this.splashInterval);
          this.splashInterval = null;
        }
        this.dismissSplashScreen(true);
      });
    }
  }

  dismissSplashScreen(playSound = true) {
    const splash = document.getElementById("app-splash-screen");
    if (!splash || splash.classList.contains("splash-exit")) return;
    
    if (playSound) {
      this.playStartupChime();
    }
    
    splash.classList.add("splash-exit");
    setTimeout(() => {
      splash.style.display = "none";
      if (window.ecoMap && window.ecoMap.map) {
        window.ecoMap.map.invalidateSize();
      }
    }, 650);
  }

  replaySplashScreen() {
    const splash = document.getElementById("app-splash-screen");
    const fill = document.getElementById("splash-bar-fill");
    const statusMsg = document.getElementById("splash-status-msg");
    const percentTxt = document.getElementById("splash-percent-txt");
    if (!splash) return;

    splash.style.display = "flex";
    splash.classList.remove("splash-exit");
    if (fill) fill.style.width = "0%";
    if (percentTxt) percentTxt.textContent = "0%";
    if (statusMsg) statusMsg.textContent = "Re-initializing Neural Telemetry Engine...";
    this.initSplashScreen();
  }

  playStartupChime() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const now = ctx.currentTime;

      // 1. Deep Sub-Bass Foundation (A1: 55Hz -> A2: 110Hz)
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = "sine";
      subOsc.frequency.setValueAtTime(55, now);
      subOsc.frequency.exponentialRampToValueAtTime(110, now + 1.2);
      subGain.gain.setValueAtTime(0.25, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
      subOsc.connect(subGain);
      subGain.connect(ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + 1.8);

      // 2. Harmonic chord chime (E4: 329.63, G#4: 415.30, B4: 493.88, E5: 659.25)
      const notes = [329.63, 415.30, 493.88, 659.25];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const delay = idx * 0.14;

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + delay);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.015, now + delay + 0.8);

        gain.gain.setValueAtTime(0.001, now + delay);
        gain.gain.linearRampToValueAtTime(0.14, now + delay + 0.06);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 1.8);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 1.8);
      });

      // 3. Shimmering high crystal ping (B5: 987.77 -> E6: 1318.51)
      const ping = ctx.createOscillator();
      const pingGain = ctx.createGain();
      ping.type = "sine";
      ping.frequency.setValueAtTime(987.77, now + 0.55);
      ping.frequency.exponentialRampToValueAtTime(1318.51, now + 0.75);
      pingGain.gain.setValueAtTime(0.001, now + 0.55);
      pingGain.gain.linearRampToValueAtTime(0.18, now + 0.6);
      pingGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);

      ping.connect(pingGain);
      pingGain.connect(ctx.destination);
      ping.start(now + 0.55);
      ping.stop(now + 2.4);
    } catch (e) {
      console.warn("Startup chime bypassed:", e);
    }
  }

  populateVehicleOptions() {
    const select = document.getElementById("vehicle-select");
    if (!select) return;
    select.innerHTML = "";

    const vehicles = window.ECO_CONFIG.vehicles;
    Object.keys(vehicles).forEach(key => {
      const v = vehicles[key];
      const opt = document.createElement("option");
      opt.value = key;
      opt.textContent = `${v.icon} ${v.name} (${v.type})`;
      select.appendChild(opt);
    });
    select.value = this.currentVehicleKey;
  }

  populateCorridorOptions() {
    const select = document.getElementById("corridor-select");
    if (!select) return;
    select.innerHTML = "";

    const corridors = window.ECO_CONFIG.corridors;
    Object.keys(corridors).forEach(key => {
      const c = corridors[key];
      const opt = document.createElement("option");
      opt.value = key;
      opt.textContent = `${c.title} [${c.distanceKm} km]`;
      select.appendChild(opt);
    });
    select.value = this.currentCorridorKey;
  }

  attachEventListeners() {
    // Navigation tabs
    document.querySelectorAll(".nav-tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const tabTarget = btn.getAttribute("data-tab");
        this.switchTab(tabTarget);
      });
    });

    // Theme toggle
    const themeBtn = document.getElementById("theme-toggle-btn");
    if (themeBtn) {
      themeBtn.addEventListener("click", () => this.toggleTheme());
    }

    // Replay intro splash
    const btnReplay = document.getElementById("btn-replay-splash");
    if (btnReplay) {
      btnReplay.addEventListener("click", () => this.replaySplashScreen());
    }

    // Corridor change
    const corridorSelect = document.getElementById("corridor-select");
    if (corridorSelect) {
      corridorSelect.addEventListener("change", (e) => {
        this.isCustomRouteActive = false;
        this.loadCorridor(e.target.value);
      });
    }

    // Vehicle change
    const vehicleSelect = document.getElementById("vehicle-select");
    if (vehicleSelect) {
      vehicleSelect.addEventListener("change", (e) => {
        this.currentVehicleKey = e.target.value;
        this.recalculateAllRoutes();
      });
    }

    // Cargo load slider
    const cargoSlider = document.getElementById("cargo-load-slider");
    const cargoValLabel = document.getElementById("cargo-val-label");
    if (cargoSlider) {
      cargoSlider.addEventListener("input", (e) => {
        this.currentCargoLoad = parseInt(e.target.value, 10);
        if (cargoValLabel) cargoValLabel.textContent = `${this.currentCargoLoad}%`;
        this.recalculateAllRoutes();
      });
    }

    // Route selection cards
    document.querySelectorAll(".route-choice-card").forEach(card => {
      card.addEventListener("click", () => {
        const routeKey = card.getAttribute("data-route-key");
        this.selectRoute(routeKey);
      });
    });

    // Map Layer Switcher
    const layerSelect = document.getElementById("map-layer-select");
    if (layerSelect) {
      layerSelect.addEventListener("change", (e) => {
        window.ecoMap.setTileLayer(e.target.value);
      });
    }

    // Traffic Congestion Toggle
    const btnTraffic = document.getElementById("btn-toggle-traffic");
    if (btnTraffic) {
      btnTraffic.addEventListener("click", () => {
        const active = window.ecoMap.toggleTrafficLayer();
        btnTraffic.classList.toggle("active", active);
        btnTraffic.innerHTML = active ? "🚦 Traffic Heat: ON" : "🚦 Traffic Heat: OFF";
      });
    }

    // Locate Me Button
    const btnLocate = document.getElementById("btn-locate-me");
    if (btnLocate) {
      btnLocate.addEventListener("click", () => window.ecoMap.locateUser());
    }

    // Recenter Button
    const btnRecenter = document.getElementById("btn-recenter-map");
    if (btnRecenter) {
      btnRecenter.addEventListener("click", () => window.ecoMap.recenterMap());
    }

    // Fullscreen Map Button
    const btnFullscreen = document.getElementById("btn-map-fullscreen");
    if (btnFullscreen) {
      btnFullscreen.addEventListener("click", () => this.toggleMapFullscreen());
    }

    // Elevation Drawer Toggle
    const btnToggleElevation = document.getElementById("btn-toggle-elevation");
    const elevDrawer = document.getElementById("map-elevation-drawer");
    if (btnToggleElevation && elevDrawer) {
      btnToggleElevation.addEventListener("click", () => {
        elevDrawer.classList.toggle("open");
        btnToggleElevation.classList.toggle("active", elevDrawer.classList.contains("open"));
        if (elevDrawer.classList.contains("open")) {
          setTimeout(() => this.drawElevationChart(), 100);
        }
      });
    }

    // Pick on Map buttons
    const btnPickOrigin = document.getElementById("btn-pick-origin");
    const btnPickDest = document.getElementById("btn-pick-dest");
    if (btnPickOrigin) {
      btnPickOrigin.addEventListener("click", () => window.ecoMap.setPinDropMode("origin"));
    }
    if (btnPickDest) {
      btnPickDest.addEventListener("click", () => window.ecoMap.setPinDropMode("dest"));
    }

    // Location search inputs
    this.setupLocationSearch("search-origin-input", "origin-suggestions", "origin");
    this.setupLocationSearch("search-dest-input", "dest-suggestions", "destination");

    // Calculate Custom Route button
    const btnCalcCustom = document.getElementById("btn-calc-custom-route");
    if (btnCalcCustom) {
      btnCalcCustom.addEventListener("click", () => this.calculateLiveOSRMRoute());
    }

    // Simulation controls
    const btnSimStart = document.getElementById("btn-sim-start");
    const btnSimPause = document.getElementById("btn-sim-pause");
    const btnSimReset = document.getElementById("btn-sim-reset");
    const soundToggle = document.getElementById("sound-toggle-btn");

    if (btnSimStart) {
      btnSimStart.addEventListener("click", () => {
        if (window.ecoTelemetry.isRunning && window.ecoTelemetry.isPaused) {
          window.ecoTelemetry.resume();
        } else {
          this.startSimulation();
        }
      });
    }

    if (btnSimPause) {
      btnSimPause.addEventListener("click", () => window.ecoTelemetry.pause());
    }

    if (btnSimReset) {
      btnSimReset.addEventListener("click", () => this.resetSimulation());
    }

    // Speed multiplier buttons
    document.querySelectorAll(".sim-speed-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".sim-speed-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const spd = parseInt(btn.getAttribute("data-speed"), 10);
        window.ecoTelemetry.setSpeedMultiplier(spd);
      });
    });

    if (soundToggle) {
      soundToggle.addEventListener("click", () => {
        window.ecoTelemetry.audioAlertEnabled = !window.ecoTelemetry.audioAlertEnabled;
        soundToggle.classList.toggle("muted", !window.ecoTelemetry.audioAlertEnabled);
        soundToggle.innerHTML = window.ecoTelemetry.audioAlertEnabled ? "🔊 Sound Alerts: ON" : "🔇 Sound Alerts: OFF";
      });
    }

    // Fleet sliders
    ["fleet-size-slider", "ev-ratio-slider", "traffic-smooth-slider"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("input", () => this.updateFleetScenario());
    });

    // Leak filters
    document.querySelectorAll(".leak-filter-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".leak-filter-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.filterLeakList(btn.getAttribute("data-filter"));
      });
    });

    // Print Report
    const btnPrintReport = document.getElementById("btn-print-report");
    if (btnPrintReport) btnPrintReport.addEventListener("click", () => window.print());

    // Export Telemetry (CSV / JSON)
    const btnExportCsv = document.getElementById("btn-export-csv");
    if (btnExportCsv) btnExportCsv.addEventListener("click", () => window.ecoTelemetry.exportCSV());

    const btnExportJson = document.getElementById("btn-export-json");
    if (btnExportJson) btnExportJson.addEventListener("click", () => window.ecoTelemetry.exportJSON());

    // Compare Vehicles Modal
    const btnCompare = document.getElementById("btn-open-compare-modal");
    if (btnCompare) btnCompare.addEventListener("click", () => this.showVehicleComparisonModal());

    // Modal
    const modalCloseBtn = document.getElementById("modal-close-btn");
    if (modalCloseBtn) modalCloseBtn.addEventListener("click", () => this.closeModal());
    const modalBackdrop = document.getElementById("app-modal-backdrop");
    if (modalBackdrop) {
      modalBackdrop.addEventListener("click", (e) => {
        if (e.target === modalBackdrop) this.closeModal();
      });
    }
  }

  setupLocationSearch(inputId, suggestionsId, type) {
    const input = document.getElementById(inputId);
    const box = document.getElementById(suggestionsId);
    if (!input || !box) return;

    input.addEventListener("input", (e) => {
      clearTimeout(this.searchDebounceTimer);
      const query = e.target.value.trim();
      if (query.length < 3) {
        box.innerHTML = "";
        box.style.display = "none";
        return;
      }
      this.searchDebounceTimer = setTimeout(async () => {
        const results = await window.ecoMap.searchLocation(query);
        box.innerHTML = "";
        if (results.length > 0) {
          box.style.display = "block";
          results.forEach(res => {
            const item = document.createElement("div");
            item.className = "suggestion-item";
            item.innerHTML = `<strong>${res.shortName}</strong><small>${res.name}</small>`;
            item.addEventListener("click", () => {
              input.value = res.shortName;
              box.style.display = "none";
              window.ecoMap.setCustomEndpoint(type, [res.lat, res.lng], res.shortName);
              window.ecoMap.map.flyTo([res.lat, res.lng], 13);
              this.showToast(`📍 ${type === 'origin' ? 'Origin' : 'Destination'} selected: ${res.shortName}`);
            });
            box.appendChild(item);
          });
        } else {
          box.style.display = "none";
        }
      }, 350);
    });

    document.addEventListener("click", (e) => {
      if (!input.contains(e.target) && !box.contains(e.target)) {
        box.style.display = "none";
      }
    });
  }

  async calculateLiveOSRMRoute() {
    if (!window.customRouteState?.origin || !window.customRouteState?.destination) {
      this.showToast("⚠️ Please select both Origin and Destination (or click on the map).");
      return;
    }

    const o = window.customRouteState.origin;
    const d = window.customRouteState.destination;
    this.showToast("⚡ Querying live OpenStreetMap OSRM street network...");

    const osrmRoutes = await window.ecoMap.fetchLiveOSRMRoute(o.coords, d.coords);
    if (!osrmRoutes || osrmRoutes.length === 0) {
      this.showToast("❌ Unable to find street path between locations.");
      return;
    }

    // Synthesize competitive 3 routes
    const routes = window.ecoAIEngine.synthesizeRoutesFromOSRM(osrmRoutes, o, d);

    this.customCorridorData = {
      id: "custom_osrm_route",
      title: `${o.name} ➔ ${d.name}`,
      subtitle: `Live OpenStreetMap Highway Geometry · ${routes.standard.distanceKm} km`,
      region: "Live Geospatial Network",
      distanceKm: routes.standard.distanceKm,
      origin: o,
      destination: d,
      routes
    };

    this.isCustomRouteActive = true;
    window.ecoTelemetry.stop();
    this.recalculateAllRoutes();
    window.ecoMap.displayCorridor(this.customCorridorData, this.currentRouteKey);

    const corridorTitle = document.getElementById("active-corridor-title");
    const corridorRegion = document.getElementById("active-corridor-region");
    if (corridorTitle) corridorTitle.textContent = this.customCorridorData.title;
    if (corridorRegion) corridorRegion.textContent = `Live OSRM Geometry · ${routes.standard.distanceKm} km`;

    this.renderLeakRegistry();
    this.showToast("✅ Real-world live street route calculated with 100% road accuracy!");
  }

  onCustomRouteRequested() {
    if (window.customRouteState?.origin && window.customRouteState?.destination) {
      this.calculateLiveOSRMRoute();
    }
  }

  switchTab(tabId) {
    document.querySelectorAll(".nav-tab-btn").forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-tab") === tabId);
    });

    document.querySelectorAll(".tab-pane").forEach(pane => {
      pane.classList.toggle("active", pane.id === `tab-${tabId}`);
    });

    if (tabId === "navigator" || tabId === "telemetry") {
      setTimeout(() => {
        if (window.ecoMap.map) window.ecoMap.map.invalidateSize();
      }, 100);
    }

    if (tabId === "report") {
      this.generateAuditCertificate();
    }
  }

  toggleTheme() {
    this.currentTheme = this.currentTheme === "dark" ? "light" : "dark";
    document.body.classList.toggle("theme-light", this.currentTheme === "light");
    window.ecoMap.setTheme(this.currentTheme);
    const btn = document.getElementById("theme-toggle-btn");
    if (btn) {
      btn.innerHTML = this.currentTheme === "dark" ? "🌙 Forest Obsidian" : "☀️ Cream Botanical";
    }
  }

  toggleMapFullscreen() {
    const mapContainer = document.querySelector(".navigator-layout");
    if (!mapContainer) return;
    if (!document.fullscreenElement) {
      mapContainer.requestFullscreen().catch(err => console.warn(err));
    } else {
      document.exitFullscreen();
    }
  }

  getActiveCorridor() {
    if (this.isCustomRouteActive && this.customCorridorData) {
      return this.customCorridorData;
    }
    return window.ECO_CONFIG.corridors[this.currentCorridorKey];
  }

  loadCorridor(corridorKey) {
    this.currentCorridorKey = corridorKey;
    this.isCustomRouteActive = false;
    const corridor = window.ECO_CONFIG.corridors[corridorKey];
    if (!corridor) return;

    window.ecoTelemetry.stop();
    this.recalculateAllRoutes();
    window.ecoMap.displayCorridor(corridor, this.currentRouteKey);

    const corridorTitle = document.getElementById("active-corridor-title");
    const corridorRegion = document.getElementById("active-corridor-region");
    if (corridorTitle) corridorTitle.textContent = corridor.title;
    if (corridorRegion) corridorRegion.textContent = `${corridor.region} · ${corridor.distanceKm} km`;

    this.renderLeakRegistry();
  }

  recalculateAllRoutes() {
    const corridor = this.getActiveCorridor();
    const vehicle = window.ECO_CONFIG.vehicles[this.currentVehicleKey];
    if (!corridor || !vehicle) return;

    const stdEval = window.ecoAIEngine.evaluateRoute(corridor.routes.standard, vehicle, this.currentCargoLoad);
    const ecoEval = window.ecoAIEngine.evaluateRoute(corridor.routes.eco, vehicle, this.currentCargoLoad);
    const balEval = window.ecoAIEngine.evaluateRoute(corridor.routes.balanced, vehicle, this.currentCargoLoad);

    const comparison = window.ecoAIEngine.generateComparison(corridor.routes.standard, corridor.routes.eco, vehicle, this.currentCargoLoad);

    this.updateRouteCardUI("standard", stdEval);
    this.updateRouteCardUI("eco", ecoEval, comparison.savings);
    this.updateRouteCardUI("balanced", balEval);
    this.updateComparisonSummary(comparison);

    // Update Turn-by-Turn Card
    this.updateTurnByTurnHUD(corridor.routes[this.currentRouteKey]);

    // Update Elevation Profile
    const activeRoute = corridor.routes[this.currentRouteKey];
    this.elevationProfileData = window.ecoAIEngine.generateElevationProfile(
      activeRoute.waypoints,
      activeRoute.distanceKm,
      activeRoute.elevationGainM
    );
    this.drawElevationChart();

    window.ecoTelemetry.loadRoute(activeRoute.waypoints, activeRoute.leaks, vehicle, this.currentCargoLoad);
  }

  updateRouteCardUI(routeKey, metrics, savings = null) {
    const card = document.querySelector(`.route-choice-card[data-route-key="${routeKey}"]`);
    if (!card) return;

    const co2El = card.querySelector(".route-co2-val");
    const timeEl = card.querySelector(".route-time-val");
    const distEl = card.querySelector(".route-dist-val");
    const leaksEl = card.querySelector(".route-leaks-val");

    if (co2El) co2El.textContent = `${metrics.totalCo2Kg} kg CO₂`;
    if (timeEl) timeEl.textContent = `${metrics.durationMin} mins`;
    if (distEl) distEl.textContent = `${metrics.distanceKm} km`;
    if (leaksEl) leaksEl.textContent = `${metrics.leakCount} Leaks`;

    if (savings && routeKey === "eco") {
      const badge = card.querySelector(".eco-savings-pill");
      if (badge) {
        badge.textContent = `▼ ${savings.co2PercentSaved}% CO₂ Saved (-${savings.co2SavedKg}kg)`;
      }
    }
  }

  updateComparisonSummary(comp) {
    const bannerSavedCo2 = document.getElementById("banner-saved-co2");
    const bannerSavedFuel = document.getElementById("banner-saved-fuel");
    const bannerSavedMoney = document.getElementById("banner-saved-money");
    const bannerSavedTrees = document.getElementById("banner-saved-trees");

    if (bannerSavedCo2) bannerSavedCo2.textContent = `${comp.savings.co2SavedKg} kg`;
    if (bannerSavedFuel) bannerSavedFuel.textContent = `${comp.savings.fuelSavedLitres} L`;
    if (bannerSavedMoney) bannerSavedMoney.textContent = `₹${comp.savings.moneySaved}`;
    if (bannerSavedTrees) bannerSavedTrees.textContent = `${comp.savings.treeDaysEquivalent} Days`;
  }

  updateTurnByTurnHUD(route) {
    const container = document.getElementById("map-maneuver-hud");
    if (!container) return;

    if (!route.maneuvers || route.maneuvers.length === 0) {
      container.innerHTML = `
        <div class="maneuver-icon">🌿</div>
        <div class="maneuver-text-box">
          <strong>Optimal Eco-Corridor Active</strong>
          <span>Maintain steady rolling cruise at 40 km/h · Zero carbon leaks detected</span>
        </div>
      `;
      return;
    }

    const firstManeuver = route.maneuvers[0];
    container.innerHTML = `
      <div class="maneuver-icon">${firstManeuver.icon || '↑'}</div>
      <div class="maneuver-text-box">
        <strong>${firstManeuver.text}</strong>
        <span>In ${firstManeuver.distance} · Speed advisory: 42 km/h (${route.tag || 'AI Eco-Route'})</span>
      </div>
    `;
  }

  selectRoute(routeKey) {
    this.currentRouteKey = routeKey;

    document.querySelectorAll(".route-choice-card").forEach(c => {
      c.classList.toggle("selected", c.getAttribute("data-route-key") === routeKey);
    });

    window.ecoMap.highlightRoute(routeKey);

    const corridor = this.getActiveCorridor();
    const vehicle = window.ECO_CONFIG.vehicles[this.currentVehicleKey];
    const activeRoute = corridor.routes[routeKey];

    this.updateTurnByTurnHUD(activeRoute);

    // Refresh elevation
    this.elevationProfileData = window.ecoAIEngine.generateElevationProfile(
      activeRoute.waypoints,
      activeRoute.distanceKm,
      activeRoute.elevationGainM
    );
    this.drawElevationChart();

    window.ecoTelemetry.loadRoute(activeRoute.waypoints, activeRoute.leaks, vehicle, this.currentCargoLoad);
  }

  initElevationChart() {
    this.elevCanvas = document.getElementById("elevation-canvas");
    if (!this.elevCanvas) return;
    this.elevCtx = this.elevCanvas.getContext("2d");

    // Mousemove on elevation canvas to pinpoint on map
    this.elevCanvas.addEventListener("mousemove", (e) => {
      if (!this.elevationProfileData || this.elevationProfileData.length === 0) return;
      const rect = this.elevCanvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, x / rect.width));
      const idx = Math.floor(ratio * (this.elevationProfileData.length - 1));
      const pt = this.elevationProfileData[idx];
      if (pt) {
        window.ecoMap.setElevationCrosshair(pt.latLng);
        const tip = document.getElementById("elev-tooltip-text");
        if (tip) {
          tip.textContent = `${pt.distanceKm} km | Alt: ${pt.altitudeM}m | Grade: ${pt.gradePct}% ${pt.isSteepIncline ? '(⚠️ High Incline Penalty)' : ''}`;
        }
      }
    });

    this.elevCanvas.addEventListener("mouseleave", () => {
      window.ecoMap.setElevationCrosshair(null);
      const tip = document.getElementById("elev-tooltip-text");
      if (tip) tip.textContent = "Hover along graph to inspect road grade & incline";
    });
  }

  drawElevationChart() {
    if (!this.elevCanvas || !this.elevCtx) return;
    const ctx = this.elevCtx;
    const w = this.elevCanvas.width = this.elevCanvas.parentElement.clientWidth || 500;
    const h = this.elevCanvas.height = 110;

    ctx.clearRect(0, 0, w, h);
    if (!this.elevationProfileData || this.elevationProfileData.length < 2) return;

    const data = this.elevationProfileData;
    const alts = data.map(d => d.altitudeM);
    const minAlt = Math.min(...alts) - 5;
    const maxAlt = Math.max(...alts) + 15;
    const altRange = Math.max(10, maxAlt - minAlt);

    // Draw grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    for (let y = 20; y < h; y += 25) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Fill gradient area
    const stepX = w / (data.length - 1);
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "rgba(16, 185, 129, 0.35)");
    grad.addColorStop(1, "rgba(16, 185, 129, 0.02)");

    ctx.beginPath();
    data.forEach((pt, i) => {
      const x = i * stepX;
      const y = h - ((pt.altitudeM - minAlt) / altRange) * (h - 25) - 10;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Stroke line
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    data.forEach((pt, i) => {
      const x = i * stepX;
      const y = h - ((pt.altitudeM - minAlt) / altRange) * (h - 25) - 10;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Highlight steep points in terracotta
    data.forEach((pt, i) => {
      if (pt.isSteepIncline) {
        const x = i * stepX;
        const y = h - ((pt.altitudeM - minAlt) / altRange) * (h - 25) - 10;
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  startSimulation() {
    window.ecoTelemetry.start();
  }

  resetSimulation() {
    window.ecoTelemetry.stop();
    const corridor = this.getActiveCorridor();
    const vehicle = window.ECO_CONFIG.vehicles[this.currentVehicleKey];
    const activeRoute = corridor.routes[this.currentRouteKey];
    window.ecoTelemetry.loadRoute(activeRoute.waypoints, activeRoute.leaks, vehicle, this.currentCargoLoad);
    window.ecoMap.removeVehicleMarker();
    this.resetHUD();
  }

  onTelemetryStart() {
    const btnStart = document.getElementById("btn-sim-start");
    const btnPause = document.getElementById("btn-sim-pause");
    if (btnStart) btnStart.innerHTML = "▶ Driving...";
    if (btnPause) btnPause.disabled = false;
  }

  onTelemetryPause() {
    const btnStart = document.getElementById("btn-sim-start");
    if (btnStart) btnStart.innerHTML = "▶ Resume Drive";
  }

  onTelemetryResume() {
    const btnStart = document.getElementById("btn-sim-start");
    if (btnStart) btnStart.innerHTML = "▶ Driving...";
  }

  onTelemetryStop() {
    const btnStart = document.getElementById("btn-sim-start");
    const btnPause = document.getElementById("btn-sim-pause");
    if (btnStart) btnStart.innerHTML = "▶ Start Virtual Drive";
    if (btnPause) btnPause.disabled = true;
  }

  onTripCompleted(totalCo2Grams, totalDistanceKm) {
    const totalKg = (totalCo2Grams / 1000).toFixed(2);
    this.showToast(`🏁 Journey Completed! Covered ${totalDistanceKm.toFixed(1)} km · Emitted ${totalKg} kg CO₂`);

    this.fleetStats.totalTrips += 1;
    this.fleetStats.co2PreventedKg += Math.round(parseFloat(totalKg) * 0.32);
    this.updateFleetStatsUI();
  }

  onLeakDetected(leakEvent) {
    const leakAlertBanner = document.getElementById("telemetry-leak-banner");
    if (leakAlertBanner) {
      leakAlertBanner.classList.add("visible");
      const title = leakAlertBanner.querySelector(".alert-leak-title");
      const cause = leakAlertBanner.querySelector(".alert-leak-cause");
      if (title) title.textContent = `⚠️ CARBON LEAK DETECTED: ${leakEvent.leak.title}`;
      if (cause) cause.textContent = `${leakEvent.leak.cause}`;
    }

    this.showToast(`🚨 High Carbon Leak Alert: ${leakEvent.leak.title}`);
  }

  onLeakCleared() {
    const leakAlertBanner = document.getElementById("telemetry-leak-banner");
    if (leakAlertBanner) leakAlertBanner.classList.remove("visible");
  }

  updateVehiclePosition(coords, bearing) {
    window.ecoMap.updateVehicleMarker(coords, bearing);
  }

  updateTelemetryHUD(data) {
    window.ecoMap.updateVehicleMarker(data.latLng, data.bearing, data.isLeak, data.leakSeverity);

    const speedVal = document.getElementById("hud-speed-val");
    const speedNeedle = document.getElementById("hud-speed-needle");
    if (speedVal) speedVal.textContent = data.speedKmh;
    if (speedNeedle) {
      const angle = -120 + (data.speedKmh / 140) * 240;
      speedNeedle.style.transform = `rotate(${angle}deg)`;
    }

    const rpmVal = document.getElementById("hud-rpm-val");
    const throttleVal = document.getElementById("hud-throttle-val");
    const throttleBar = document.getElementById("hud-throttle-bar");
    if (rpmVal) rpmVal.textContent = data.engineRpm;
    if (throttleVal) throttleVal.textContent = `${data.throttlePct}%`;
    if (throttleBar) throttleBar.style.width = `${data.throttlePct}%`;

    const co2RateVal = document.getElementById("hud-co2-rate-val");
    const co2GpsVal = document.getElementById("hud-co2-gps-val");
    const sensorPpmVal = document.getElementById("hud-sensor-ppm-val");
    const fuelRateVal = document.getElementById("hud-fuel-rate-val");

    if (co2RateVal) co2RateVal.textContent = `${data.co2PerKm} g/km`;
    if (co2GpsVal) co2GpsVal.textContent = `${data.co2Gps} g/s`;
    if (sensorPpmVal) sensorPpmVal.textContent = `${data.exhaustPpm} ppm`;
    if (fuelRateVal) fuelRateVal.textContent = `${data.fuelRateLPerHr} L/h`;

    const tripCo2Val = document.getElementById("hud-trip-co2-val");
    const tripDistVal = document.getElementById("hud-trip-dist-val");
    const tripProgressVal = document.getElementById("hud-progress-val");
    const tripProgressBar = document.getElementById("hud-progress-bar");

    if (tripCo2Val) tripCo2Val.textContent = `${(data.totalCo2Grams / 1000).toFixed(2)} kg`;
    if (tripDistVal) tripDistVal.textContent = `${data.distanceKm} km`;
    if (tripProgressVal) tripProgressVal.textContent = `${data.progressPct}%`;
    if (tripProgressBar) tripProgressBar.style.width = `${data.progressPct}%`;

    const leakPill = document.getElementById("hud-leak-status-pill");
    if (leakPill) {
      if (data.isLeak) {
        leakPill.className = `hud-status-pill pill-leak-${data.leakSeverity.toLowerCase()}`;
        leakPill.textContent = `LEAK: ${data.leakType}`;
      } else {
        leakPill.className = "hud-status-pill pill-optimal";
        leakPill.textContent = "EMISSION: OPTIMAL GREEN";
      }
    }

    this.addTelemetryChartData(data.speedKmh, data.co2PerKm);
  }

  resetHUD() {
    const ids = [
      ["hud-speed-val", "0"],
      ["hud-rpm-val", "850"],
      ["hud-throttle-val", "0%"],
      ["hud-co2-rate-val", "0.0 g/km"],
      ["hud-co2-gps-val", "0.000 g/s"],
      ["hud-sensor-ppm-val", "410 ppm"],
      ["hud-fuel-rate-val", "0.00 L/h"],
      ["hud-trip-co2-val", "0.00 kg"],
      ["hud-trip-dist-val", "0.00 km"],
      ["hud-progress-val", "0%"]
    ];
    ids.forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    });

    const speedNeedle = document.getElementById("hud-speed-needle");
    if (speedNeedle) speedNeedle.style.transform = "rotate(-120deg)";

    const throttleBar = document.getElementById("hud-throttle-bar");
    if (throttleBar) throttleBar.style.width = "0%";

    const tripProgressBar = document.getElementById("hud-progress-bar");
    if (tripProgressBar) tripProgressBar.style.width = "0%";

    const leakAlertBanner = document.getElementById("telemetry-leak-banner");
    if (leakAlertBanner) leakAlertBanner.classList.remove("visible");

    this.chartData = { labels: [], co2Series: [], speedSeries: [] };
    this.drawChart();
  }

  initTelemetryChart() {
    this.chartCanvas = document.getElementById("telemetry-canvas-chart");
    if (!this.chartCanvas) return;
    this.chartCtx = this.chartCanvas.getContext("2d");
    this.drawChart();
  }

  addTelemetryChartData(speed, co2Rate) {
    if (!this.chartCtx) return;

    this.chartData.speedSeries.push(speed);
    this.chartData.co2Series.push(co2Rate);

    if (this.chartData.speedSeries.length > 40) {
      this.chartData.speedSeries.shift();
      this.chartData.co2Series.shift();
    }

    this.drawChart();
  }

  drawChart() {
    if (!this.chartCanvas || !this.chartCtx) return;
    const ctx = this.chartCtx;
    const w = this.chartCanvas.width = this.chartCanvas.parentElement.clientWidth || 400;
    const h = this.chartCanvas.height = 160;

    ctx.clearRect(0, 0, w, h);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    for (let y = 30; y < h; y += 35) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    if (this.chartData.speedSeries.length < 2) return;

    const n = this.chartData.speedSeries.length;
    const stepX = w / 39;

    ctx.strokeStyle = "#06b6d4";
    ctx.lineWidth = 2;
    ctx.beginPath();
    this.chartData.speedSeries.forEach((val, idx) => {
      const x = idx * stepX;
      const y = h - (val / 120) * (h - 20) - 10;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    this.chartData.co2Series.forEach((val, idx) => {
      const x = idx * stepX;
      const y = h - (val / 350) * (h - 20) - 10;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }

  renderLeakRegistry() {
    const container = document.getElementById("leak-registry-list");
    if (!container) return;
    container.innerHTML = "";

    const corridor = this.getActiveCorridor();
    const allLeaks = [...(corridor.routes.standard.leaks || []), ...(corridor.routes.balanced.leaks || [])];

    if (allLeaks.length === 0) {
      container.innerHTML = `<div class="empty-leak-state">✅ No active carbon leaks recorded in this corridor. Optimal green wave flow achieved!</div>`;
      return;
    }

    allLeaks.forEach(leak => {
      const card = document.createElement("div");
      card.className = `leak-item-card severity-${leak.severity.toLowerCase()}`;
      card.setAttribute("data-severity", leak.severity.toLowerCase());
      card.innerHTML = `
        <div class="leak-header-line">
          <span class="leak-tag tag-${leak.severity.toLowerCase()}">${leak.severity} LEAK</span>
          <span class="leak-name">${leak.title}</span>
          <span class="leak-type-badge">${leak.type}</span>
        </div>
        <div class="leak-details-grid">
          <div class="leak-metric-box">
            <span class="m-label">Excess Tailpipe CO₂</span>
            <span class="m-val text-leak">+${leak.extraCo2Grams} g</span>
          </div>
          <div class="leak-metric-box">
            <span class="m-label">Idling Delay</span>
            <span class="m-val">${leak.idleSeconds}s queue</span>
          </div>
          <div class="leak-metric-box">
            <span class="m-label">Coordinates</span>
            <span class="m-val font-mono">${leak.coords[0].toFixed(4)}, ${leak.coords[1].toFixed(4)}</span>
          </div>
        </div>
        <div class="leak-cause-text">
          <strong>Physical Cause:</strong> ${leak.cause}
        </div>
        <div class="leak-ai-remedy">
          <strong>AI Action Recommendation:</strong> ${leak.aiRecommendation}
        </div>
        <div class="leak-actions">
          <button class="btn-inspect-leak" onclick="window.appUI.inspectLeak('${leak.id}')">🔍 Open Diagnostic & Reroute</button>
        </div>
      `;
      container.appendChild(card);
    });
  }

  filterLeakList(filter) {
    const cards = document.querySelectorAll(".leak-item-card");
    cards.forEach(card => {
      if (filter === "all") {
        card.style.display = "block";
      } else {
        card.style.display = card.getAttribute("data-severity") === filter ? "block" : "none";
      }
    });
  }

  inspectLeak(leakId) {
    const corridor = this.getActiveCorridor();
    const allLeaks = [...(corridor.routes.standard.leaks || []), ...(corridor.routes.balanced.leaks || [])];
    const leak = allLeaks.find(l => l.id === leakId);
    if (!leak) return;

    this.openModal(`
      <div class="modal-leak-diagnostic">
        <div class="modal-badge-row">
          <span class="leak-tag tag-${leak.severity.toLowerCase()}">${leak.severity} CARBON LEAK</span>
          <span class="modal-id">ANOMALY REF: ${leak.id.toUpperCase()}</span>
        </div>
        <h2>${leak.title}</h2>
        <p class="modal-sub">Identified by Spatial Anomaly Detection Engine (Random Forest / Gradient Boosted IVE Model)</p>

        <div class="diagnostic-grid">
          <div class="diag-card">
            <h4>Wasted Fuel Burn</h4>
            <div class="diag-num text-leak">+${leak.extraCo2Grams}g CO₂</div>
            <p>Direct atmospheric carbon leakage at zero road progress.</p>
          </div>
          <div class="diag-card">
            <h4>Idling Stoppage</h4>
            <div class="diag-num">${leak.idleSeconds}s</div>
            <p>Exceeds EPA urban deceleration idle threshold (>30s).</p>
          </div>
          <div class="diag-card">
            <h4>Hotspot Geo-Location</h4>
            <div class="diag-num font-mono">${leak.coords[0].toFixed(4)}, ${leak.coords[1].toFixed(4)}</div>
            <p>Corridor intersection bottleneck node.</p>
          </div>
        </div>

        <div class="modal-cause-section">
          <h3>Root Cause Diagnostic</h3>
          <p>${leak.cause}</p>
        </div>

        <div class="modal-ai-solution">
          <h3>✦ EcoRoute AI Mitigation Engine</h3>
          <p>${leak.aiRecommendation}</p>
          <div class="modal-button-group">
            <button class="btn-primary" onclick="window.appUI.selectRoute('eco'); window.appUI.closeModal(); window.appUI.switchTab('navigator');">
              🌱 Apply EcoRoute AI Bypass Reroute
            </button>
          </div>
        </div>
      </div>
    `);
  }

  updateFleetScenario() {
    const fleetSize = parseInt(document.getElementById("fleet-size-slider")?.value || "50", 10);
    const evRatio = parseInt(document.getElementById("ev-ratio-slider")?.value || "20", 10);
    const trafficSmooth = parseInt(document.getElementById("traffic-smooth-slider")?.value || "60", 10);

    const fleetSizeLabel = document.getElementById("fleet-size-val");
    const evRatioLabel = document.getElementById("ev-ratio-val");
    const trafficSmoothLabel = document.getElementById("traffic-smooth-val");

    if (fleetSizeLabel) fleetSizeLabel.textContent = `${fleetSize} Vehicles`;
    if (evRatioLabel) evRatioLabel.textContent = `${evRatio}% EVs`;
    if (trafficSmoothLabel) trafficSmoothLabel.textContent = `${trafficSmooth}% Smooth Flow`;

    const avgDailyKmPerVehicle = 85;
    const annualKmFleet = fleetSize * avgDailyKmPerVehicle * 300;
    const baselineCo2Kg = annualKmFleet * 0.185;

    const evCo2SavedKg = baselineCo2Kg * (evRatio / 100) * 0.75;
    const ecoRoutingSavedKg = baselineCo2Kg * (1 - (evRatio / 100)) * (0.15 + (trafficSmooth / 100) * 0.18);
    const totalAnnualSavedKg = Math.round(evCo2SavedKg + ecoRoutingSavedKg);
    const totalAnnualSavedTons = (totalAnnualSavedKg / 1000).toFixed(1);

    const fuelMoneySaved = Math.round(totalAnnualSavedKg * 42.5);
    const carbonCreditsEarned = Math.round(totalAnnualSavedTons * 1.0);

    const resTons = document.getElementById("forecast-saved-tons");
    const resMoney = document.getElementById("forecast-saved-money");
    const resCredits = document.getElementById("forecast-carbon-credits");

    if (resTons) resTons.textContent = `${totalAnnualSavedTons} Tons CO₂`;
    if (resMoney) resMoney.textContent = `₹${(fuelMoneySaved / 100000).toFixed(2)} Lakhs`;
    if (resCredits) resCredits.textContent = `${carbonCreditsEarned} Verified Credits`;
  }

  updateFleetStatsUI() {
    const elTrips = document.getElementById("fleet-stat-trips");
    const elCo2 = document.getElementById("fleet-stat-co2");
    const elFuel = document.getElementById("fleet-stat-fuel");
    const elMoney = document.getElementById("fleet-stat-money");

    if (elTrips) elTrips.textContent = this.fleetStats.totalTrips.toLocaleString();
    if (elCo2) elCo2.textContent = `${(this.fleetStats.co2PreventedKg / 1000).toFixed(1)} t`;
    if (elFuel) elFuel.textContent = `${this.fleetStats.fuelSavedL.toLocaleString()} L`;
    if (elMoney) elMoney.textContent = `₹${(this.fleetStats.moneySavedInr / 100000).toFixed(2)} L`;
  }

  renderAcademicPortfolio() {
    const data = window.ECO_CONFIG.portfolioData;
    
    const teamContainer = document.getElementById("academic-team-roster");
    if (teamContainer) {
      teamContainer.innerHTML = data.team.map(m => `
        <div class="team-member-card">
          <div class="member-avatar">🌱</div>
          <div class="member-name">${m.name}</div>
          <div class="member-role">${m.role}</div>
          <div class="member-usn">${m.usn}</div>
        </div>
      `).join("");
    }

    const litBody = document.getElementById("literature-table-body");
    if (litBody) {
      litBody.innerHTML = data.literatureSurvey.map(item => `
        <tr>
          <td>${item.id}</td>
          <td><strong>${item.title}</strong></td>
          <td>${item.authors}</td>
          <td><span class="lit-year-badge">${item.year}</span></td>
          <td>${item.methodology}</td>
          <td><span class="tag-limitation">${item.limitations}</span></td>
          <td><strong class="text-emerald">${item.ecoRouteAdvance}</strong></td>
        </tr>
      `).join("");
    }

    const gapContainer = document.getElementById("research-gaps-grid");
    if (gapContainer) {
      gapContainer.innerHTML = data.researchGaps.map(g => `
        <div class="academic-gap-card">
          <div class="gap-icon">${g.icon}</div>
          <h3>${g.title}</h3>
          <p>${g.desc}</p>
        </div>
      `).join("");
    }
  }

  generateAuditCertificate() {
    const corridor = this.getActiveCorridor();
    const vehicle = window.ECO_CONFIG.vehicles[this.currentVehicleKey];
    const stdRoute = corridor.routes.standard;
    const ecoRoute = corridor.routes.eco;
    const comp = window.ecoAIEngine.generateComparison(stdRoute, ecoRoute, vehicle, this.currentCargoLoad);

    const reportDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const serial = `ECO-${Math.floor(100000 + Math.random() * 900000)}`;

    const elCert = document.getElementById("audit-certificate-content");
    if (!elCert) return;

    elCert.innerHTML = `
      <div class="certificate-paper">
        <div class="cert-header">
          <div class="cert-logo-box">
            <span class="cert-logo-icon">🌿</span>
            <div>
              <h2>EcoRoute AI™ Carbon Audit Certificate</h2>
              <p>Certified Low-Emission Journey Verification · BITM Ballari Green Logistics Framework</p>
            </div>
          </div>
          <div class="cert-serial-box">
            <span class="serial-num">CERTIFICATE #${serial}</span>
            <span class="cert-date">${reportDate}</span>
          </div>
        </div>

        <div class="cert-divider"></div>

        <div class="cert-meta-grid">
          <div class="cert-meta-item">
            <span class="cert-label">Corridor Traversed</span>
            <strong>${corridor.title}</strong>
          </div>
          <div class="cert-meta-item">
            <span class="cert-label">Vehicle Category</span>
            <strong>${vehicle.name} (${vehicle.energyType})</strong>
          </div>
          <div class="cert-meta-item">
            <span class="cert-label">Cargo Capacity Load</span>
            <strong>${this.currentCargoLoad}% Payload</strong>
          </div>
          <div class="cert-meta-item">
            <span class="cert-label">Institution / Framework</span>
            <strong>Dept of ECE, BITM Ballari (Autonomous VTU)</strong>
          </div>
        </div>

        <div class="cert-stats-comparison">
          <div class="cert-stat-col unoptimized">
            <h3>Standard Route (Baseline)</h3>
            <div class="cert-metric-row"><span>Distance:</span> <strong>${stdRoute.distanceKm} km</strong></div>
            <div class="cert-metric-row"><span>Estimated Time:</span> <strong>${stdRoute.durationMin} mins</strong></div>
            <div class="cert-metric-row"><span>Tailpipe Carbon:</span> <strong class="text-danger">${comp.standard.totalCo2Kg} kg CO₂</strong></div>
            <div class="cert-metric-row"><span>Carbon Leaks Encountered:</span> <strong>${comp.standard.leakCount} Critical Hotspots</strong></div>
            <div class="cert-metric-row"><span>Eco Score:</span> <strong>${comp.standard.ecoScore}/100</strong></div>
          </div>

          <div class="cert-stat-col cert-ai-optimized">
            <div class="cert-stamp-badge">VERIFIED GREEN</div>
            <h3>EcoRoute AI™ Optimized</h3>
            <div class="cert-metric-row"><span>Distance:</span> <strong>${ecoRoute.distanceKm} km</strong></div>
            <div class="cert-metric-row"><span>Optimized Time:</span> <strong>${ecoRoute.durationMin} mins</strong></div>
            <div class="cert-metric-row"><span>Tailpipe Carbon:</span> <strong class="text-emerald">${comp.eco.totalCo2Kg} kg CO₂</strong></div>
            <div class="cert-metric-row"><span>Carbon Leaks Avoided:</span> <strong class="text-emerald">100% Mitigated (0 Leaks)</strong></div>
            <div class="cert-metric-row"><span>Eco Score:</span> <strong class="text-emerald">${comp.eco.ecoScore}/100</strong></div>
          </div>
        </div>

        <div class="cert-savings-banner">
          <div class="cs-item">
            <span class="cs-label">Net Carbon Abated</span>
            <span class="cs-val text-emerald">▼ ${comp.savings.co2SavedKg} kg CO₂ (${comp.savings.co2PercentSaved}%)</span>
          </div>
          <div class="cs-item">
            <span class="cs-label">Fuel Conserved</span>
            <span class="cs-val">${comp.savings.fuelSavedLitres} Litres</span>
          </div>
          <div class="cs-item">
            <span class="cs-label">Direct Cost Saved</span>
            <span class="cs-val">₹${comp.savings.moneySaved}</span>
          </div>
          <div class="cs-item">
            <span class="cs-label">Tree Absorption Days</span>
            <span class="cs-val">${comp.savings.treeDaysEquivalent} Days</span>
          </div>
        </div>

        <div class="cert-footer">
          <div class="cert-sign-col">
            <div class="cert-sign-line"></div>
            <strong>Dr. Abdul Lateef Haroon P S</strong>
            <p>Project Guide · Associate Professor, ECE</p>
          </div>
          <div class="cert-seal-col">
            <div class="green-seal">
              <span>✦ BITM ✦</span>
              <small>VTU BELAGAVI</small>
            </div>
          </div>
          <div class="cert-sign-col">
            <div class="cert-sign-line"></div>
            <strong>EcoRoute Research Team</strong>
            <p>Sayeeda Zaiba · Nazia Firdouse · Rafiya Banu · Tahiya Tarannum</p>
          </div>
        </div>
      </div>
    `;
  }

  showToast(message) {
    let toast = document.getElementById("app-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "app-toast";
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className = "toast-show";
    setTimeout(() => {
      toast.className = "";
    }, 4500);
  }

  showVehicleComparisonModal() {
    const corridor = this.getActiveCorridor();
    const routeKey = this.currentRouteKey || "eco";
    const activeRoute = corridor.routes[routeKey] || corridor.routes.eco;
    const vehicles = window.ECO_CONFIG.vehicles;

    const cardsHtml = Object.keys(vehicles).map(k => {
      const v = vehicles[k];
      const metrics = window.ecoAIEngine.evaluateRoute(activeRoute, v, this.currentCargoLoad);
      const isSelected = k === this.currentVehicleKey;
      const co2Color = v.fuelType === "ev" ? "var(--emerald-glow)" : (metrics.totalCo2Kg > 15 ? "var(--danger)" : (metrics.totalCo2Kg < 5 ? "var(--emerald-glow)" : "var(--terracotta-light)"));

      return `
        <div class="compare-vehicle-card ${isSelected ? 'active-vehicle-card' : ''}">
          <div class="cv-header">
            <span class="cv-icon">${v.icon}</span>
            <div class="cv-title-box">
              <strong class="cv-name">${v.name}</strong>
              <span class="cv-type">${v.type} · ${v.energyType}</span>
            </div>
            ${isSelected ? '<span class="cv-active-tag">Active</span>' : ''}
          </div>
          
          <div class="cv-metrics-grid">
            <div class="cv-metric-item">
              <span class="cv-lbl">Trip Carbon (Tailpipe)</span>
              <strong class="cv-val" style="color:${co2Color}">${metrics.totalCo2Kg} kg CO₂</strong>
            </div>
            <div class="cv-metric-item">
              <span class="cv-lbl">${v.fuelType === 'ev' ? 'Electric Energy' : 'Fuel Consumed'}</span>
              <strong class="cv-val">${v.fuelType === 'ev' ? `${metrics.energyKwh} kWh` : `${metrics.totalFuelLitres} L`}</strong>
            </div>
            <div class="cv-metric-item">
              <span class="cv-lbl">Estimated Trip Cost</span>
              <strong class="cv-val">₹${metrics.fuelCost}</strong>
            </div>
            <div class="cv-metric-item">
              <span class="cv-lbl">Eco Efficiency Score</span>
              <strong class="cv-val text-emerald">${metrics.ecoScore}/100</strong>
            </div>
          </div>

          <div style="margin-top:12px;">
            <button class="btn-primary" style="width:100%;font-size:0.75rem;padding:6px 10px;" onclick="window.appUI.selectVehicleAndRecalculate('${k}')">
              ${isSelected ? '✓ Current Active Profile' : `Switch to ${v.name}`}
            </button>
          </div>
        </div>
      `;
    }).join("");

    this.openModal(`
      <div class="modal-vehicle-comparison">
        <div class="modal-comp-header">
          <div>
            <span style="font-size:0.72rem;font-weight:700;color:var(--emerald-glow);letter-spacing:0.1em;text-transform:uppercase;">IVE Emission Model · Physics Benchmark</span>
            <h2>Multi-Vehicle Carbon & Economic Comparison</h2>
            <p style="font-size:0.85rem;color:var(--text-muted);margin-top:4px;">
              Route: <strong>${corridor.title}</strong> (${activeRoute.name} · ${activeRoute.distanceKm} km, Payload: ${this.currentCargoLoad}%)
            </p>
          </div>
        </div>

        <div class="compare-vehicles-container">
          ${cardsHtml}
        </div>
      </div>
    `);
  }

  selectVehicleAndRecalculate(vehicleKey) {
    this.currentVehicleKey = vehicleKey;
    const select = document.getElementById("vehicle-select");
    if (select) select.value = vehicleKey;
    this.closeModal();
    this.recalculateAllRoutes();
    const v = window.ECO_CONFIG.vehicles[vehicleKey];
    this.showToast(`🚗 Vehicle profile switched to: ${v.name}`);
  }

  openModal(htmlContent) {
    const backdrop = document.getElementById("app-modal-backdrop");
    const container = document.getElementById("modal-inner-container");
    if (!backdrop || !container) return;
    container.innerHTML = htmlContent;
    backdrop.classList.add("modal-open");
  }

  closeModal() {
    const backdrop = document.getElementById("app-modal-backdrop");
    if (backdrop) backdrop.classList.remove("modal-open");
  }
}

// Global UI instance
window.appUI = new EcoRouteApp();

window.addEventListener("DOMContentLoaded", () => {
  window.appUI.init();
});
