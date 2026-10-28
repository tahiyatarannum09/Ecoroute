/**
 * EcoRoute: AI Carbon Leak Detector
 * Configuration, Vehicle Physics Models, Strategic Corridors, and Live GIS Settings
 * Department of Electronics & Communication Engineering, BITM Ballari (Autonomous - VTU)
 * Research Team: Sayeeda Zaiba, Nazia Firdouse, Rafiya Banu, Tahiya Tarannum
 * Mentors: Dr. Abdul Lateef Haroon P S, Dr. Naseeruddin
 */

window.ECO_CONFIG = {
  appName: "EcoRoute AI: Carbon Leak Detector",
  version: "3.0.0-LiveGIS-Edition",
  academicAffiliation: "BITM Ballari · Autonomous VTU Belagavi",
  defaultCenter: [15.1394, 76.9214], // Ballari Central
  defaultZoom: 13,

  // Live GIS Routing API endpoints (Public OpenStreetMap OSRM & Nominatim)
  osrmEndpoint: "https://router.project-osrm.org/route/v1/driving",
  nominatimEndpoint: "https://nominatim.openstreetmap.org/search",

  // Vehicle Categories & Physical Emission Parameters (IVE & EPA Modal Benchmarks)
  vehicles: {
    petrol_sedan: {
      id: "petrol_sedan",
      name: "Standard Petrol Sedan",
      type: "ICE Petrol",
      icon: "🚗",
      curbWeightKg: 1350,
      engineDisplacementL: 1.5,
      fuelType: "petrol",
      baseCo2PerKm: 142.5, // g/km at optimal cruising 60 km/h
      idleFuelRateLPerHr: 0.72, // L/hr
      idleCo2PerMin: 28.2, // g/min idling
      fuelCostPerL: 102.5, // INR
      energyType: "Gasoline (E10)",
      dragCoefficient: 0.29,
      efficiencyScore: 74
    },
    diesel_suv: {
      id: "diesel_suv",
      name: "Diesel SUV / Commuter",
      type: "ICE Diesel",
      icon: "🚙",
      curbWeightKg: 1950,
      engineDisplacementL: 2.2,
      fuelType: "diesel",
      baseCo2PerKm: 188.0,
      idleFuelRateLPerHr: 0.98,
      idleCo2PerMin: 42.6,
      fuelCostPerL: 89.0,
      energyType: "Ultra-Low Sulfur Diesel",
      dragCoefficient: 0.36,
      efficiencyScore: 65
    },
    logistics_truck: {
      id: "logistics_truck",
      name: "Heavy Logistics Freight (16T)",
      type: "Heavy Commercial",
      icon: "🚛",
      curbWeightKg: 12500,
      engineDisplacementL: 6.7,
      fuelType: "diesel",
      baseCo2PerKm: 685.0,
      idleFuelRateLPerHr: 2.85,
      idleCo2PerMin: 124.0,
      fuelCostPerL: 89.0,
      energyType: "Commercial Diesel",
      dragCoefficient: 0.58,
      efficiencyScore: 42
    },
    delivery_van: {
      id: "delivery_van",
      name: "Urban Delivery Van (Last-Mile)",
      type: "Commercial Van",
      icon: "🚐",
      curbWeightKg: 2600,
      engineDisplacementL: 2.0,
      fuelType: "diesel",
      baseCo2PerKm: 245.0,
      idleFuelRateLPerHr: 1.15,
      idleCo2PerMin: 50.0,
      fuelCostPerL: 89.0,
      energyType: "Commercial Diesel",
      dragCoefficient: 0.38,
      efficiencyScore: 68
    },
    hybrid_electric: {
      id: "hybrid_electric",
      name: "Parallel Hybrid Electric (HEV)",
      type: "Hybrid",
      icon: "🌿",
      curbWeightKg: 1480,
      engineDisplacementL: 1.8,
      fuelType: "hybrid",
      baseCo2PerKm: 78.4,
      idleFuelRateLPerHr: 0.12,
      idleCo2PerMin: 4.8, // Engine cuts off frequently
      fuelCostPerL: 102.5,
      energyType: "Gasoline / Regenerative Dual",
      dragCoefficient: 0.26,
      efficiencyScore: 89
    },
    battery_ev: {
      id: "battery_ev",
      name: "Zero-Tailpipe EV (BEV)",
      type: "Electric Vehicle",
      icon: "⚡",
      curbWeightKg: 1720,
      batteryKwh: 64,
      fuelType: "ev",
      baseCo2PerKm: 0.0,
      gridCo2PerKm: 42.0, // Grid generation indirect factor
      idleFuelRateLPerHr: 0.0,
      idleCo2PerMin: 0.8,
      fuelCostPerL: 7.5,
      energyType: "Grid Electricity (64 kWh)",
      dragCoefficient: 0.24,
      efficiencyScore: 98
    }
  },

  // Strategic Preset Corridors with high-accuracy coordinates
  corridors: {
    ballari_academic: {
      id: "ballari_academic",
      title: "Ballari Urban · City Center to BITM Campus",
      subtitle: "Academic Transit & Urban Bottleneck Corridor",
      region: "Ballari, Karnataka",
      distanceKm: 8.4,
      origin: { name: "Ballari City Junction (DC Office / Railway Stn)", coords: [15.1455, 76.9236] },
      destination: { name: "BITM Ballari Campus, Goutham Nagar", coords: [15.1112, 76.8774] },
      description: "Dense mixed urban corridor passing through historical market bottlenecks, railway crossing, and the new green bypass arterial.",
      routes: {
        standard: {
          name: "Standard Route (Via Infantry Road & Market Cross)",
          tag: "Fastest on Paper · Heavy Bottlenecks",
          distanceKm: 8.4,
          durationMin: 26,
          avgSpeedKmh: 19,
          avgCongestion: 0.74,
          elevationGainM: 36,
          color: "#f97316",
          waypoints: [
            [15.1455, 76.9236],
            [15.1425, 76.9212],
            [15.1385, 76.9175],
            [15.1351, 76.9142], // Market Bottleneck Leak 1
            [15.1330, 76.9105],
            [15.1310, 76.9080], // Railway Gate Choke Leak 2
            [15.1275, 76.9030],
            [15.1240, 76.8965],
            [15.1210, 76.8910], // Commercial Signal Stop-and-Go Leak 3
            [15.1170, 76.8850],
            [15.1135, 76.8805],
            [15.1112, 76.8774]
          ],
          maneuvers: [
            { text: "Depart south from Ballari City Junction", distance: "600m", icon: "↑" },
            { text: "Enter Market Cross (Heavy Pedestrian Congestion)", distance: "1.2km", icon: "⚠️", leakWarning: true },
            { text: "Stop at Railway Level Crossing (Idling penalty 145s)", distance: "850m", icon: "⏳", leakWarning: true },
            { text: "Continue straight on Allipur Main Road", distance: "2.4km", icon: "↑" },
            { text: "Turn right toward BITM Campus Entrance", distance: "450m", icon: "↱" }
          ],
          leaks: [
            {
              id: "leak_bl_01",
              title: "Market Choke Point Idling Trap",
              type: "IDLE_BOTTLENECK",
              severity: "CRITICAL",
              coords: [15.1351, 76.9142],
              idleSeconds: 145,
              extraCo2Grams: 310,
              cause: "Unsynchronized 4-way intersection + pedestrian spillover",
              aiRecommendation: "Eco-bypass via Ring Road bypass saves 310g CO₂ and avoids 4.5 mins idle"
            },
            {
              id: "leak_bl_02",
              title: "Railway Cross Incline & Queue",
              type: "ACCEL_SHOCK_WAVE",
              severity: "HIGH",
              coords: [15.1310, 76.9080],
              idleSeconds: 90,
              extraCo2Grams: 240,
              cause: "Sudden deceleration wave followed by steep restart surge",
              aiRecommendation: "Maintain steady 32 km/h green wave corridor"
            },
            {
              id: "leak_bl_03",
              title: "Commercial Signal Idling Drag",
              type: "IDLE_BOTTLENECK",
              severity: "MEDIUM",
              coords: [15.1210, 76.8910],
              idleSeconds: 65,
              extraCo2Grams: 165,
              cause: "Long 120s static signal cycle without smart sensor induction",
              aiRecommendation: "Suggest AI Smart Signal Green-Wave coordination"
            }
          ]
        },
        eco: {
          name: "EcoRoute AI™ (Via Green Ring Outer Arterial)",
          tag: "AI Recommended · 32.4% Lower Carbon",
          distanceKm: 9.2,
          durationMin: 18,
          avgSpeedKmh: 38,
          avgCongestion: 0.22,
          elevationGainM: 18,
          color: "#10b981",
          waypoints: [
            [15.1455, 76.9236],
            [15.1482, 76.9205],
            [15.1470, 76.9110],
            [15.1440, 76.9015], // Smooth outer arterial
            [15.1390, 76.8920],
            [15.1320, 76.8850],
            [15.1240, 76.8800],
            [15.1165, 76.8785],
            [15.1112, 76.8774]
          ],
          maneuvers: [
            { text: "Head west on North Ring Bypass", distance: "1.4km", icon: "↰" },
            { text: "Merge smoothly onto Green Wave Arterial (Optimal speed 40 km/h)", distance: "4.8km", icon: "🌿" },
            { text: "Continue unobstructed past Goutham Nagar bypass", distance: "2.1km", icon: "↑" },
            { text: "Arrive at BITM Ballari Green Campus Gate", distance: "900m", icon: "🎯" }
          ],
          leaks: [] // Zero critical leaks!
        },
        balanced: {
          name: "Balanced Low-Grade Route (Via Cantonment Road)",
          tag: "Moderate Carbon / Scenic",
          distanceKm: 8.8,
          durationMin: 22,
          avgSpeedKmh: 27,
          avgCongestion: 0.38,
          elevationGainM: 25,
          color: "#06b6d4",
          waypoints: [
            [15.1455, 76.9236],
            [15.1405, 76.9195],
            [15.1360, 76.9100],
            [15.1290, 76.9020],
            [15.1220, 76.8940],
            [15.1150, 76.8820],
            [15.1112, 76.8774]
          ],
          maneuvers: [
            { text: "Depart via Cantonment Avenue", distance: "1.2km", icon: "↑" },
            { text: "Steady gentle climb along scenic trees", distance: "3.6km", icon: "⛰️" },
            { text: "Turn west toward BITM Campus", distance: "3.2km", icon: "↰" }
          ],
          leaks: [
            {
              id: "leak_bl_04",
              title: "Cantonment Gentle Incline Drag",
              type: "GRADIENT_PENALTY",
              severity: "LOW",
              coords: [15.1220, 76.8940],
              idleSeconds: 20,
              extraCo2Grams: 65,
              cause: "Continuous 3.8% road inclination at low gear",
              aiRecommendation: "Maintain consistent torque; avoid hard kickdowns"
            }
          ]
        }
      }
    },

    freight_expressway: {
      id: "freight_expressway",
      title: "Interstate Freight Corridor · Ballari to Bengaluru Hub",
      subtitle: "Heavy Logistics & Commercial Highway (NH 50 / NH 44)",
      region: "Karnataka State Highway Network",
      distanceKm: 298.0,
      origin: { name: "Ballari Industrial Steel & Logistics Zone", coords: [15.1650, 76.9100] },
      destination: { name: "Bengaluru Peenya Logistics Park", coords: [13.0280, 77.5400] },
      description: "High-tonnage commercial corridor where eco-routing generates massive cumulative carbon savings in tonnage.",
      routes: {
        standard: {
          name: "Standard Highway Corridor (Toll Plazas & Mountain Pass)",
          tag: "Standard Commercial Navigation",
          distanceKm: 298.0,
          durationMin: 320,
          avgSpeedKmh: 56,
          avgCongestion: 0.58,
          elevationGainM: 480,
          color: "#f97316",
          waypoints: [
            [15.1650, 76.9100],
            [14.9200, 76.7800],
            [14.4600, 76.6200],
            [13.9800, 76.9500],
            [13.5600, 77.2100],
            [13.2500, 77.4100],
            [13.0280, 77.5400]
          ],
          leaks: [
            {
              id: "leak_fr_01",
              title: "Tumkur Toll Barrier Queue Drag",
              type: "IDLE_BOTTLENECK",
              severity: "CRITICAL",
              coords: [13.5600, 77.2100],
              idleSeconds: 380,
              extraCo2Grams: 4200,
              cause: "Freight queuing and stop-and-start acceleration waves at toll plaza",
              aiRecommendation: "EcoRoute dynamic FastTag lane pre-allocation avoids 4.2kg CO₂"
            },
            {
              id: "leak_fr_02",
              title: "Ghat Section Hill Climb Penalty",
              type: "GRADIENT_PENALTY",
              severity: "HIGH",
              coords: [13.9800, 76.9500],
              idleSeconds: 40,
              extraCo2Grams: 2850,
              cause: "7.2% sustained gradient causing continuous maximum torque fuel enrichment",
              aiRecommendation: "Gradual grade alternate bypass saves 2.85kg CO₂"
            }
          ]
        },
        eco: {
          name: "EcoRoute AI™ Smart Logistics Gradient Bypass",
          tag: "AI Recommended · 28.5% Carbon Reduction",
          distanceKm: 306.0,
          durationMin: 295,
          avgSpeedKmh: 68,
          avgCongestion: 0.18,
          elevationGainM: 260,
          color: "#10b981",
          waypoints: [
            [15.1650, 76.9100],
            [14.9500, 76.8500],
            [14.5000, 76.7200],
            [13.9500, 77.1000],
            [13.4800, 77.3000],
            [13.1500, 77.4800],
            [13.0280, 77.5400]
          ],
          leaks: []
        },
        balanced: {
          name: "Balanced State Highway Route",
          tag: "Moderate Toll Cost / Steady Speed",
          distanceKm: 301.0,
          durationMin: 310,
          avgSpeedKmh: 61,
          avgCongestion: 0.35,
          elevationGainM: 350,
          color: "#06b6d4",
          waypoints: [
            [15.1650, 76.9100],
            [14.8500, 76.8000],
            [14.3500, 76.7000],
            [13.8500, 77.1200],
            [13.3500, 77.3500],
            [13.0280, 77.5400]
          ],
          leaks: []
        }
      }
    },

    bengaluru_tech: {
      id: "bengaluru_tech",
      title: "Bengaluru Tech Grid · Electronic City to Whitefield",
      subtitle: "Hyper-Congested Urban Mobility Testbed",
      region: "Bengaluru, Karnataka",
      distanceKm: 27.5,
      origin: { name: "Electronic City Phase 1 Toll", coords: [12.8452, 77.6602] },
      destination: { name: "ITPL Whitefield Tech Campus", coords: [12.9866, 77.7381] },
      description: "Infamous Silicon Valley traffic corridor featuring intense flyover bottlenecks and Silk Board junction carbon leaks.",
      routes: {
        standard: {
          name: "Central Ring Road Route (Via Silk Board & Marathahalli)",
          tag: "Worst Carbon Footprint · Severe Idling",
          distanceKm: 27.5,
          durationMin: 68,
          avgSpeedKmh: 17,
          avgCongestion: 0.88,
          elevationGainM: 52,
          color: "#f97316",
          waypoints: [
            [12.8452, 77.6602],
            [12.8900, 77.6400],
            [12.9175, 77.6235],
            [12.9350, 77.6650],
            [12.9560, 77.7010],
            [12.9750, 77.7250],
            [12.9866, 77.7381]
          ],
          leaks: [
            {
              id: "leak_bg_01",
              title: "Silk Board Mega Junction Idling Trap",
              type: "IDLE_BOTTLENECK",
              severity: "CRITICAL",
              coords: [12.9175, 77.6235],
              idleSeconds: 320,
              extraCo2Grams: 890,
              cause: "Uncontrolled merging from 6 directions creating dead-stop idling",
              aiRecommendation: "Peripheral ring bypass averts 890g tailpipe surge"
            },
            {
              id: "leak_bg_02",
              title: "Marathahalli Underpass Shockwave",
              type: "ACCEL_SHOCK_WAVE",
              severity: "CRITICAL",
              coords: [12.9560, 77.7010],
              idleSeconds: 195,
              extraCo2Grams: 640,
              cause: "Repeated hard braking and aggressive accelerations on flyover slip",
              aiRecommendation: "Eco-routing maintains continuous rolling momentum"
            }
          ]
        },
        eco: {
          name: "EcoRoute AI™ Smart Perimeter Corridor (Via Outer Green Link)",
          tag: "AI Recommended · 34.2% Lower Carbon",
          distanceKm: 31.2,
          durationMin: 44,
          avgSpeedKmh: 42,
          avgCongestion: 0.28,
          elevationGainM: 32,
          color: "#10b981",
          waypoints: [
            [12.8452, 77.6602],
            [12.8600, 77.7100],
            [12.9000, 77.7600],
            [12.9450, 77.7700],
            [12.9780, 77.7550],
            [12.9866, 77.7381]
          ],
          leaks: []
        },
        balanced: {
          name: "Intermediate Arterial Route (Via Sarjapur Link)",
          tag: "Moderate Distance & Emissions",
          distanceKm: 28.8,
          durationMin: 52,
          avgSpeedKmh: 31,
          avgCongestion: 0.52,
          elevationGainM: 40,
          color: "#06b6d4",
          waypoints: [
            [12.8452, 77.6602],
            [12.8800, 77.6800],
            [12.9200, 77.7100],
            [12.9600, 77.7280],
            [12.9866, 77.7381]
          ],
          leaks: [
            {
              id: "leak_bg_03",
              title: "Sarjapur Junction Signal Lag",
              type: "IDLE_BOTTLENECK",
              severity: "MEDIUM",
              coords: [12.9200, 77.7100],
              idleSeconds: 75,
              extraCo2Grams: 210,
              cause: "Signal delay during morning peak hour rush",
              aiRecommendation: "Smooth advisory speed 35 km/h"
            }
          ]
        }
      }
    },

    western_ghats_mountain: {
      id: "western_ghats_mountain",
      title: "Western Ghats Mountain Pass · Mysuru to Ooty",
      subtitle: "High-Gradient Topographic & Hairpin Incline Corridor",
      region: "Karnataka - Tamil Nadu Border (NH 766 / NH 181)",
      distanceKm: 124.0,
      origin: { name: "Mysuru Heritage Palace Gate", coords: [12.3051, 76.6551] },
      destination: { name: "Ooty Nilgiri Botanical Plateau", coords: [11.4138, 76.7031] },
      description: "Severe mountain topography rising from 760m to 2,240m elevation. Extreme testbed for GRADIENT_PENALTY detection and regenerative braking efficiency.",
      routes: {
        standard: {
          name: "Direct Ghat Pass (Via Kalhatty 36 Hairpin Bends)",
          tag: "Shortest Distance · Severe Grade Clamber",
          distanceKm: 124.0,
          durationMin: 195,
          avgSpeedKmh: 38,
          avgCongestion: 0.62,
          elevationGainM: 1480,
          color: "#f97316",
          waypoints: [
            [12.3051, 76.6551],
            [12.1400, 76.6700],
            [11.9200, 76.6800],
            [11.6600, 76.6300],
            [11.5300, 76.6800], // Kalhatty Base
            [11.4700, 76.6900], // Hairpin Incline Leak 1
            [11.4350, 76.7000], // Summit Peak Leak 2
            [11.4138, 76.7031]
          ],
          maneuvers: [
            { text: "Depart south from Mysuru on NH 766", distance: "45km", icon: "↑" },
            { text: "Enter Bandipur Foothill transit zone", distance: "32km", icon: "🌲" },
            { text: "Begin Kalhatty 36 Hairpin Climb (>11% sustained incline)", distance: "18km", icon: "⛰️", leakWarning: true },
            { text: "Summit hairpin plateau with cooling drag", distance: "6km", icon: "⏳", leakWarning: true },
            { text: "Arrive at Ooty Nilgiri Plateau", distance: "4km", icon: "🎯" }
          ],
          leaks: [
            {
              id: "leak_wg_01",
              title: "Kalhatty Hairpin Gradient Surge",
              type: "GRADIENT_PENALTY",
              severity: "CRITICAL",
              coords: [11.4700, 76.6900],
              idleSeconds: 45,
              extraCo2Grams: 3450,
              cause: "11.2% steep incline forcing low 1st/2nd gear high-RPM enrichment",
              aiRecommendation: "EcoRoute gradual gradient corridor via Gudalur avoids 3.45kg CO₂"
            },
            {
              id: "leak_wg_02",
              title: "Hairpin Bend Decel-Accel Shockwave",
              type: "ACCEL_SHOCK_WAVE",
              severity: "HIGH",
              coords: [11.4350, 76.7000],
              idleSeconds: 60,
              extraCo2Grams: 1820,
              cause: "Dead-stop braking on blind turns followed by steep uphill torque surge",
              aiRecommendation: "Green-Wave momentum preservation via Gudalur arterial"
            }
          ]
        },
        eco: {
          name: "EcoRoute AI™ Gentle Valley Grade (Via Gudalur Valley NH 181)",
          tag: "AI Recommended · 31.8% Lower Carbon · Gentle Slope",
          distanceKm: 142.0,
          durationMin: 180,
          avgSpeedKmh: 47,
          avgCongestion: 0.24,
          elevationGainM: 920,
          color: "#10b981",
          waypoints: [
            [12.3051, 76.6551],
            [12.1100, 76.6500],
            [11.8500, 76.6200],
            [11.5800, 76.5100], // Gudalur Valley gradual slope
            [11.5100, 76.5500],
            [11.4700, 76.6200],
            [11.4300, 76.6700],
            [11.4138, 76.7031]
          ],
          maneuvers: [
            { text: "Depart Mysuru toward Gundlupet Junction", distance: "58km", icon: "↑" },
            { text: "Follow Gentle Incline NH 181 via Gudalur Valley (Average grade 3.8%)", distance: "48km", icon: "🌿" },
            { text: "Continuous rolling momentum with regenerative downhill sections", distance: "26km", icon: "⚡" },
            { text: "Arrive at Ooty Botanical Plateau", distance: "10km", icon: "🎯" }
          ],
          leaks: []
        },
        balanced: {
          name: "Balanced Scenic Foothills Route",
          tag: "Moderate Incline · Wildlife Sanctuary Corridor",
          distanceKm: 135.0,
          durationMin: 188,
          avgSpeedKmh: 43,
          avgCongestion: 0.38,
          elevationGainM: 1150,
          color: "#06b6d4",
          waypoints: [
            [12.3051, 76.6551],
            [12.0800, 76.6600],
            [11.7500, 76.5800],
            [11.5200, 76.5800],
            [11.4500, 76.6500],
            [11.4138, 76.7031]
          ],
          maneuvers: [
            { text: "Scenic transit along Mudumalai Buffer corridor", distance: "62km", icon: "↑" },
            { text: "Moderate steady incline along Pykara Lake", distance: "45km", icon: "⛰️" },
            { text: "Direct approach to Ooty Center", distance: "28km", icon: "🎯" }
          ],
          leaks: []
        }
      }
    }
  },

  // E-Portfolio Academic Metadata
  portfolioData: {
    title: "EcoRoute: AI Carbon Leak Detector",
    institution: "Ballari Institute of Technology and Management (BITM), Ballari",
    university: "Autonomous Institution, Affiliated to Visvesvaraya Technological University (VTU), Belagavi",
    department: "Electronics & Communication Engineering",
    academicYear: "2025–26 (Phase 1 & Phase 2 Complete Implementation)",
    mentors: {
      guide: "Dr. Abdul Lateef Haroon P S (Associate Professor, ECE Dept)",
      coordinator: "Dr. Naseeruddin (Project Coordinator, ECE Dept)"
    },
    team: [
      { name: "Sayeeda Zaiba", role: "AI Routing & Geospatial Lead", usn: "3BR22EC089" },
      { name: "Nazia Firdouse", role: "Carbon Leak Detection & ML Lead", usn: "3BR22EC061" },
      { name: "Rafiya Banu", role: "IoT Sensor Simulation & Telemetry", usn: "3BR22EC078" },
      { name: "Tahiya Tarannum", role: "Dashboard Architecture & Analytics", usn: "3BR22EC102" }
    ],
    literatureSurvey: [
      {
        id: 1,
        title: "IoT-based Vehicle CO₂ Emission Monitoring using CACC",
        authors: "M. Smith, J. Lee",
        year: 2020,
        methodology: "Uses IoT sensors, GPS, and CACC to monitor and optimise vehicle speed for reducing emissions",
        limitations: "Requires physical hardware setup; limited scalability across consumer fleets",
        ecoRouteAdvance: "Replaces physical dependency with real-time AI emission inference + OBD-II virtual streaming"
      },
      {
        id: 2,
        title: "Eco-Routing for Reducing Vehicle Emissions",
        authors: "A. Kumar, R. Singh",
        year: 2021,
        methodology: "Route optimisation using traffic and emission models (IVE model)",
        limitations: "Accuracy strictly depends on offline data; fails under dynamic urban congestion",
        ecoRouteAdvance: "Continuous real-time closed-loop sensing with micro-scale carbon leak hotspot detection"
      },
      {
        id: 3,
        title: "eco2AI for AI Energy Consumption Tracking",
        authors: "S. Budennyy et al.",
        year: 2022,
        methodology: "Tracks energy usage and CO₂ emissions of AI models using software-based monitoring",
        limitations: "Focuses exclusively on AI datacenter compute, not physical vehicular routing",
        ecoRouteAdvance: "Bridges computational energy tracking with vehicular navigation and logistics decarbonization"
      },
      {
        id: 4,
        title: "Towards Sustainable AI: Monitoring & Analysis of Carbon Emissions in ML Algorithms",
        authors: "Aurora Martiny",
        year: 2023,
        methodology: "Uses ML models and CodeCarbon to analyze energy consumption during model training",
        limitations: "Focuses on static training phase, zero real-time edge or operational routing integration",
        ecoRouteAdvance: "Deploys sub-millisecond edge ML inference for live vehicle routing recommendations"
      },
      {
        id: 5,
        title: "Artificial Intelligence for Sustainable Logistics: Route Optimisation",
        authors: "Orcun Sarioguz",
        year: 2025,
        methodology: "Uses ML, Ant Colony Optimization (ACO), and Genetic Algorithms for logistics simulation",
        limitations: "High infrastructure demand; difficult to implement in developing or semi-urban regions",
        ecoRouteAdvance: "Lightweight, universal web-based execution with zero hardware installation required"
      }
    ],
    researchGaps: [
      { icon: "🔌", title: "Hardware Dependency", desc: "Prior systems require costly, dedicated physical gas analyzers. EcoRoute operates with sensor-free AI estimation and standard smartphone GPS / OBD-II proxies." },
      { icon: "🔄", title: "Disconnected Pipelines", desc: "Detection and rerouting have historically been treated in isolation. EcoRoute couples real-time hotspot identification directly with dynamic path recalculation." },
      { icon: "📊", title: "Lack of Real-Time Intelligence", desc: "Existing approaches rely on historical batch calculations. EcoRoute adapts in real time to live traffic shockwaves and road incline shifts." },
      { icon: "🌍", title: "Context & Developing Market Gaps", desc: "Most models are tuned for pristine European highways. EcoRoute handles irregular traffic, mixed vehicles, and varying road topologies typical of India and developing nations." },
      { icon: "👤", title: "User Accessibility", desc: "Earlier tools were locked inside enterprise fleet software. EcoRoute provides an intuitive consumer and fleet cockpit." },
      { icon: "🤖", title: "Comprehensive AI Model Scope", desc: "Combines predictive emission modeling, spatial anomaly detection for carbon leaks, and multi-objective path optimization in one closed loop." }
    ]
  }
};
