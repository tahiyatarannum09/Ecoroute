/**
 * EcoRoute AI: Interactive GIS Map & Spatial Carbon Leak Visualizer
 * Real-Time OSRM Road Routing, Nominatim Geocoding, Satellite/Traffic Layers & Radar Leak Pulses
 * Department of Electronics & Communication Engineering, BITM Ballari
 */

class EcoMapManager {
  constructor(mapContainerId = "map") {
    this.containerId = mapContainerId;
    this.map = null;
    this.tileLayers = {};
    this.currentTileLayer = null;
    this.trafficLayerGroup = null;
    this.isTrafficVisible = false;

    this.routeLayers = {
      standard: null,
      eco: null,
      balanced: null
    };
    this.leakMarkers = [];
    this.originMarker = null;
    this.destMarker = null;
    this.vehicleMarker = null;
    this.userLocMarker = null;
    this.elevationHoverMarker = null;
    this.selectedRouteKey = "eco";
    
    // Live Pin Drop Mode: null, 'origin', or 'destination'
    this.pinDropMode = null;
  }

  initMap() {
    if (this.map) return;

    const defaultCenter = window.ECO_CONFIG.defaultCenter;
    const defaultZoom = window.ECO_CONFIG.defaultZoom;

    this.map = L.map(this.containerId, {
      center: defaultCenter,
      zoom: defaultZoom,
      zoomControl: false,
      attributionControl: true
    });

    // Custom positioned zoom control
    L.control.zoom({ position: "bottomright" }).addTo(this.map);

    // 100% Free, High-Fidelity GIS Tile Providers (No API Keys or Watermarks Required)
    const esriDarkBase = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
      attribution: 'Tiles &copy; Esri, HERE, Garmin, &copy; OpenStreetMap',
      maxZoom: 16
    });
    const esriDarkLabels = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}", {
      attribution: '',
      maxZoom: 16,
      pane: "shadowPane" // Ensure labels sit smoothly above base
    });
    // Classy Emerald Night: Dark Obsidian Canvas with High-Contrast Road Labels
    this.tileLayers.ecoDark = L.layerGroup([esriDarkBase, esriDarkLabels]);

    // Daylight Street Map (Clean Voyager replacement, no API key watermark)
    this.tileLayers.voyager = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom',
      maxZoom: 18
    });

    // High-Resolution Satellite Hybrid
    const esriSatBase = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      attribution: "Tiles &copy; Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP",
      maxZoom: 19
    });
    this.tileLayers.satellite = esriSatBase;

    // Topographic Elevation Cartography
    this.tileLayers.topo = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}", {
      maxZoom: 18,
      attribution: 'Tiles &copy; Esri &mdash; Sources: GEBCO, NOAA, CHS, OSU, UNH, CSUMB, National Geographic, DeLorme, NAVTEQ'
    });

    // Standard OpenStreetMap
    this.tileLayers.osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    // Traffic congestion overlay layer group
    this.trafficLayerGroup = L.layerGroup();

    // Default layer: ecoDark
    this.currentTileLayer = this.tileLayers.ecoDark;
    this.currentTileLayer.addTo(this.map);

    // Map Click Listener
    this.map.on("click", (e) => {
      this.handleMapClick(e.latlng);
    });
  }

  setTheme(themeName) {
    if (!this.map) return;
    if (themeName === "light") {
      this.setTileLayer("voyager");
    } else {
      this.setTileLayer("ecoDark");
    }
  }

  setTileLayer(layerKey) {
    if (!this.map || !this.tileLayers[layerKey]) return;
    if (this.currentTileLayer) {
      this.map.removeLayer(this.currentTileLayer);
    }
    this.currentTileLayer = this.tileLayers[layerKey];
    this.currentTileLayer.addTo(this.map);
  }

  toggleTrafficLayer(visible) {
    if (!this.map) return;
    this.isTrafficVisible = typeof visible === "boolean" ? visible : !this.isTrafficVisible;
    if (this.isTrafficVisible) {
      this.renderTrafficCongestion();
      this.trafficLayerGroup.addTo(this.map);
    } else {
      this.map.removeLayer(this.trafficLayerGroup);
    }
    return this.isTrafficVisible;
  }

  renderTrafficCongestion() {
    this.trafficLayerGroup.clearLayers();
    const corridor = window.ECO_CONFIG.corridors[window.appUI?.currentCorridorKey || "ballari_academic"];
    if (!corridor || !corridor.routes.standard) return;

    // Overlay heat zones around standard route bottleneck segments
    const wps = corridor.routes.standard.waypoints;
    if (wps.length >= 4) {
      // Congestion Zone 1 (Red bottleneck)
      const redZone = [wps[2], wps[3], wps[4]];
      L.polyline(redZone, {
        color: "#ef4444",
        weight: 12,
        opacity: 0.45,
        lineCap: "round"
      }).addTo(this.trafficLayerGroup);

      // Congestion Zone 2 (Amber slow crawl)
      const amberZone = [wps[5], wps[6], wps[7]];
      L.polyline(amberZone, {
        color: "#f59e0b",
        weight: 10,
        opacity: 0.4,
        lineCap: "round"
      }).addTo(this.trafficLayerGroup);
    }
  }

  handleMapClick(latlng) {
    if (this.pinDropMode === "origin") {
      this.setCustomEndpoint("origin", [latlng.lat, latlng.lng], "Custom Map Pick (Start)");
      this.pinDropMode = null;
      window.appUI?.showToast("📍 Origin set to map click location.");
      window.appUI?.onCustomRouteRequested();
    } else if (this.pinDropMode === "dest") {
      this.setCustomEndpoint("destination", [latlng.lat, latlng.lng], "Custom Map Pick (Destination)");
      this.pinDropMode = null;
      window.appUI?.showToast("🎯 Destination set to map click location.");
      window.appUI?.onCustomRouteRequested();
    } else if (window.appUI && window.appUI.onMapClicked) {
      window.appUI.onMapClicked(latlng);
    }
  }

  setPinDropMode(mode) {
    this.pinDropMode = mode; // 'origin' or 'dest'
    if (mode === "origin") {
      window.appUI?.showToast("👆 Click anywhere on the map to set Origin (Point A).");
    } else if (mode === "dest") {
      window.appUI?.showToast("👆 Click anywhere on the map to set Destination (Point B).");
    }
  }

  setCustomEndpoint(type, coords, name) {
    if (type === "origin") {
      if (!window.customRouteState) window.customRouteState = {};
      window.customRouteState.origin = { name, coords };
      this.plotEndpointMarker("origin", window.customRouteState.origin);
    } else {
      if (!window.customRouteState) window.customRouteState = {};
      window.customRouteState.destination = { name, coords };
      this.plotEndpointMarker("dest", window.customRouteState.destination);
    }
  }

  /**
   * Fetches real live road network geometry from OpenStreetMap OSRM API
   */
  async fetchLiveOSRMRoute(originCoords, destCoords) {
    const url = `${window.ECO_CONFIG.osrmEndpoint}/${originCoords[1]},${originCoords[0]};${destCoords[1]},${destCoords[0]}?overview=full&geometries=geojson&steps=true&annotations=true&alternatives=true`;
    try {
      const response = await fetch(url, { headers: { "Accept": "application/json" } });
      if (!response.ok) throw new Error(`OSRM HTTP ${response.status}`);
      const data = await response.json();
      if (!data.routes || data.routes.length === 0) throw new Error("No routes found by OSRM");

      return data.routes.map((r, idx) => {
        // GeoJSON coordinates are [lon, lat], Leaflet needs [lat, lon]
        const leafletCoords = r.geometry.coordinates.map(c => [c[1], c[0]]);
        const distanceKm = r.distance / 1000;
        const durationMin = r.duration / 60;

        // Extract turn-by-turn maneuvers
        const maneuvers = [];
        if (r.legs && r.legs[0] && r.legs[0].steps) {
          r.legs[0].steps.forEach(step => {
            if (step.maneuver && step.name) {
              const modifier = step.maneuver.modifier || "";
              const type = step.maneuver.type || "turn";
              let icon = "↑";
              if (modifier.includes("right")) icon = "↱";
              else if (modifier.includes("left")) icon = "↰";
              else if (type === "arrive") icon = "🎯";

              maneuvers.push({
                text: `${type.toUpperCase()} ${modifier ? `(${modifier})` : ""} on ${step.name || "unnamed road"}`,
                distance: `${Math.round(step.distance)}m`,
                icon
              });
            }
          });
        }

        return {
          routeIndex: idx,
          waypoints: leafletCoords,
          distanceKm: parseFloat(distanceKm.toFixed(2)),
          durationMin: Math.round(durationMin),
          avgSpeedKmh: Math.round(distanceKm / (durationMin / 60)),
          maneuvers: maneuvers.length > 0 ? maneuvers : null
        };
      });
    } catch (err) {
      console.warn("Live OSRM fetch failed or rate-limited; utilizing fallback high-accuracy route:", err);
      return null;
    }
  }

  /**
   * Geocoding search via Nominatim
   */
  async searchLocation(queryText) {
    if (!queryText || queryText.trim().length < 2) return [];
    const url = `${window.ECO_CONFIG.nominatimEndpoint}?q=${encodeURIComponent(queryText)}&format=json&limit=5&addressdetails=1`;
    try {
      const resp = await fetch(url, { headers: { "Accept": "application/json" } });
      if (!resp.ok) return [];
      const results = await resp.json();
      return results.map(r => ({
        name: r.display_name,
        shortName: r.name || r.display_name.split(",")[0],
        lat: parseFloat(r.lat),
        lng: parseFloat(r.lon)
      }));
    } catch (e) {
      console.warn("Nominatim search error:", e);
      return [];
    }
  }

  /**
   * Locates user's live device location via HTML5 Geolocation
   */
  locateUser() {
    if (!navigator.geolocation) {
      window.appUI?.showToast("❌ Geolocation is not supported by your browser.");
      return;
    }
    window.appUI?.showToast("🛰️ Acquiring live GPS satellite lock...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = pos.coords.accuracy;

        if (this.userLocMarker) this.map.removeLayer(this.userLocMarker);

        const icon = L.divIcon({
          className: "custom-user-gps-marker",
          html: `
            <div class="user-gps-pulse">
              <div class="gps-core"></div>
              <div class="gps-ring"></div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        this.userLocMarker = L.marker([lat, lng], { icon }).addTo(this.map);
        this.userLocMarker.bindPopup(`<b>Your Live GPS Location</b><br>Accuracy: ±${Math.round(accuracy)}m`).openPopup();
        this.map.flyTo([lat, lng], 14, { duration: 1.5 });

        // Update custom origin
        this.setCustomEndpoint("origin", [lat, lng], "My Current Live Location");
        window.appUI?.showToast("✅ GPS Position Acquired! Set as route origin.");
      },
      (err) => {
        window.appUI?.showToast("⚠️ Unable to retrieve GPS coordinates: " + err.message);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  displayCorridor(corridorData, activeRouteKey = "eco") {
    if (!this.map || !corridorData) return;
    this.clearAllRoutes();
    this.clearLeaks();
    this.selectedRouteKey = activeRouteKey;

    const routes = corridorData.routes;
    const bounds = L.latLngBounds([]);

    // 1. Plot Endpoints
    this.plotEndpoints(corridorData.origin, corridorData.destination);
    bounds.extend(corridorData.origin.coords);
    bounds.extend(corridorData.destination.coords);

    // 2. Plot Standard Route (Warm Amber)
    if (routes.standard) {
      const isSelected = activeRouteKey === "standard";
      this.routeLayers.standard = L.polyline(routes.standard.waypoints, {
        color: isSelected ? "#f97316" : "rgba(249, 115, 22, 0.4)",
        weight: isSelected ? 6 : 4,
        opacity: isSelected ? 0.95 : 0.4,
        dashArray: isSelected ? null : "6, 8",
        lineCap: "round",
        lineJoin: "round"
      }).addTo(this.map);

      this.routeLayers.standard.on("click", () => {
        if (window.appUI) window.appUI.selectRoute("standard");
      });

      routes.standard.waypoints.forEach(pt => bounds.extend(pt));
    }

    // 3. Plot Balanced Route (Cyan)
    if (routes.balanced) {
      const isSelected = activeRouteKey === "balanced";
      this.routeLayers.balanced = L.polyline(routes.balanced.waypoints, {
        color: isSelected ? "#06b6d4" : "rgba(6, 182, 212, 0.4)",
        weight: isSelected ? 6 : 4,
        opacity: isSelected ? 0.95 : 0.4,
        lineCap: "round",
        lineJoin: "round"
      }).addTo(this.map);

      this.routeLayers.balanced.on("click", () => {
        if (window.appUI) window.appUI.selectRoute("balanced");
      });

      routes.balanced.waypoints.forEach(pt => bounds.extend(pt));
    }

    // 4. Plot EcoRoute AI (Glowing Emerald Green with animated flow)
    if (routes.eco) {
      const isSelected = activeRouteKey === "eco";
      this.routeLayers.eco = L.polyline(routes.eco.waypoints, {
        color: isSelected ? "#10b981" : "rgba(16, 185, 129, 0.45)",
        className: isSelected ? "animated-eco-polyline" : "",
        weight: isSelected ? 7 : 4,
        opacity: isSelected ? 1.0 : 0.5,
        lineCap: "round",
        lineJoin: "round"
      }).addTo(this.map);

      this.routeLayers.eco.on("click", () => {
        if (window.appUI) window.appUI.selectRoute("eco");
      });

      routes.eco.waypoints.forEach(pt => bounds.extend(pt));
    }

    // 5. Plot Carbon Leaks
    const leakSource = routes[activeRouteKey]?.leaks?.length ? routes[activeRouteKey].leaks : routes.standard.leaks;
    this.plotLeaks(leakSource);

    // Refresh traffic overlay if on
    if (this.isTrafficVisible) {
      this.renderTrafficCongestion();
    }

    // Smoothly zoom bounds
    if (bounds.isValid()) {
      this.map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
    }
  }

  highlightRoute(routeKey) {
    this.selectedRouteKey = routeKey;
    const styles = {
      eco: { active: "#10b981", inactive: "rgba(16, 185, 129, 0.35)", weightActive: 7, weightInactive: 4 },
      standard: { active: "#f97316", inactive: "rgba(249, 115, 22, 0.35)", weightActive: 6, weightInactive: 3.5 },
      balanced: { active: "#06b6d4", inactive: "rgba(6, 182, 212, 0.35)", weightActive: 6, weightInactive: 3.5 }
    };

    ["eco", "standard", "balanced"].forEach(k => {
      if (this.routeLayers[k]) {
        const isSel = k === routeKey;
        this.routeLayers[k].setStyle({
          color: isSel ? styles[k].active : styles[k].inactive,
          weight: isSel ? styles[k].weightActive : styles[k].weightInactive,
          opacity: isSel ? 1.0 : 0.4
        });
        if (isSel) {
          this.routeLayers[k].bringToFront();
        }
      }
    });
  }

  plotEndpoints(origin, destination) {
    this.plotEndpointMarker("origin", origin);
    this.plotEndpointMarker("dest", destination);
  }

  plotEndpointMarker(type, data) {
    if (type === "origin") {
      if (this.originMarker) this.map.removeLayer(this.originMarker);
      const originIcon = L.divIcon({
        className: "custom-marker-origin",
        html: `
          <div class="marker-pulse-container origin-marker">
            <div class="marker-pin origin-pin">
              <span>A</span>
            </div>
            <div class="marker-label">${data.name.split('(')[0]}</div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });
      this.originMarker = L.marker(data.coords, { icon: originIcon, draggable: true }).addTo(this.map);
      this.originMarker.on("dragend", (e) => {
        const pos = e.target.getLatLng();
        this.setCustomEndpoint("origin", [pos.lat, pos.lng], "Dragged Origin (A)");
        window.appUI?.onCustomRouteRequested();
      });
    } else {
      if (this.destMarker) this.map.removeLayer(this.destMarker);
      const destIcon = L.divIcon({
        className: "custom-marker-dest",
        html: `
          <div class="marker-pulse-container dest-marker">
            <div class="marker-pin dest-pin">
              <span>B</span>
            </div>
            <div class="marker-label">${data.name.split('(')[0]}</div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });
      this.destMarker = L.marker(data.coords, { icon: destIcon, draggable: true }).addTo(this.map);
      this.destMarker.on("dragend", (e) => {
        const pos = e.target.getLatLng();
        this.setCustomEndpoint("destination", [pos.lat, pos.lng], "Dragged Destination (B)");
        window.appUI?.onCustomRouteRequested();
      });
    }
  }

  plotLeaks(leaks) {
    this.clearLeaks();
    if (!leaks || leaks.length === 0) return;

    leaks.forEach(leak => {
      const severityClass = leak.severity.toLowerCase();
      
      const leakIcon = L.divIcon({
        className: `custom-leak-marker leak-${severityClass}`,
        html: `
          <div class="leak-radar-pulse ${severityClass}">
            <div class="radar-circle circle-1"></div>
            <div class="radar-circle circle-2"></div>
            <div class="leak-icon-badge">
              <span class="leak-emoji">${leak.type === 'IDLE_BOTTLENECK' ? '⏳' : leak.type === 'GRADIENT_PENALTY' ? '⛰️' : '⚡'}</span>
            </div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      });

      const marker = L.marker(leak.coords, { icon: leakIcon }).addTo(this.map);

      const popupHtml = `
        <div class="leak-popup-card">
          <div class="leak-popup-header">
            <span class="leak-badge badge-${severityClass}">${leak.severity} LEAK</span>
            <span class="leak-type-title">${leak.title}</span>
          </div>
          <div class="leak-popup-body">
            <div class="leak-stat-row">
              <span class="stat-label">Extra Tailpipe CO₂:</span>
              <strong class="stat-val text-leak">+${leak.extraCo2Grams} g</strong>
            </div>
            <div class="leak-stat-row">
              <span class="stat-label">Idling Penalty:</span>
              <strong class="stat-val">${leak.idleSeconds}s queue</strong>
            </div>
            <div class="leak-cause-text">
              <strong>Root Cause:</strong> ${leak.cause}
            </div>
            <div class="leak-remedy-box">
              <div class="remedy-head">✦ AI Recommendation</div>
              <div class="remedy-body">${leak.aiRecommendation}</div>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        className: "custom-leaflet-popup",
        maxWidth: 320
      });

      this.leakMarkers.push(marker);
    });
  }

  updateVehicleMarker(latLng, bearing = 0, isLeak = false, severity = "NONE") {
    if (!this.map || !latLng) return;

    const haloClass = isLeak ? `halo-leak-${severity.toLowerCase()}` : "halo-normal";
    
    if (!this.vehicleMarker) {
      const vehicleIcon = L.divIcon({
        className: "custom-vehicle-tracker",
        html: `
          <div id="vehicle-marker-node" class="vehicle-marker-wrapper ${haloClass}">
            <div class="vehicle-headlight-cone" style="transform: rotate(${bearing}deg);"></div>
            <div class="vehicle-bearing-arrow" style="transform: rotate(${bearing}deg);">
              <svg viewBox="0 0 32 32" width="28" height="28">
                <path d="M16 2 L28 26 L16 20 L4 26 Z" fill="#10b981" stroke="#ffffff" stroke-width="2"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      this.vehicleMarker = L.marker(latLng, { icon: vehicleIcon, zIndexOffset: 1000 }).addTo(this.map);
    } else {
      this.vehicleMarker.setLatLng(latLng);
      const node = document.getElementById("vehicle-marker-node");
      if (node) {
        node.className = `vehicle-marker-wrapper ${haloClass}`;
        const arrow = node.querySelector(".vehicle-bearing-arrow");
        const cone = node.querySelector(".vehicle-headlight-cone");
        if (arrow) arrow.style.transform = `rotate(${bearing}deg)`;
        if (cone) cone.style.transform = `rotate(${bearing}deg)`;
      }
    }
  }

  removeVehicleMarker() {
    if (this.vehicleMarker && this.map) {
      this.map.removeLayer(this.vehicleMarker);
      this.vehicleMarker = null;
    }
  }

  setElevationCrosshair(latLng) {
    if (!this.map || !latLng) {
      if (this.elevationHoverMarker) {
        this.map.removeLayer(this.elevationHoverMarker);
        this.elevationHoverMarker = null;
      }
      return;
    }

    if (!this.elevationHoverMarker) {
      const icon = L.divIcon({
        className: "elevation-crosshair-icon",
        html: `<div class="elev-pin-dot"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });
      this.elevationHoverMarker = L.marker(latLng, { icon }).addTo(this.map);
    } else {
      this.elevationHoverMarker.setLatLng(latLng);
    }
  }

  recenterMap() {
    const corridor = window.ECO_CONFIG.corridors[window.appUI?.currentCorridorKey || "ballari_academic"];
    if (corridor) {
      this.displayCorridor(corridor, this.selectedRouteKey);
    }
  }

  clearAllRoutes() {
    ["standard", "eco", "balanced"].forEach(k => {
      if (this.routeLayers[k] && this.map) {
        this.map.removeLayer(this.routeLayers[k]);
        this.routeLayers[k] = null;
      }
    });
  }

  clearLeaks() {
    this.leakMarkers.forEach(m => {
      if (this.map) this.map.removeLayer(m);
    });
    this.leakMarkers = [];
  }
}

// Global Map Manager instance
window.ecoMap = new EcoMapManager();
