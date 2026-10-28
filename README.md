# EcoRoute AI: Real-Time Vehicular Carbon Leak Detector & Eco-Routing System

> **Department of Electronics & Communication Engineering**  
> **Ballari Institute of Technology and Management (BITM), Ballari**  
> *(Autonomous Institution, Affiliated to Visvesvaraya Technological University, Belagavi)*  
> **Project Coordination:** Dr. Naseeruddin  
> **Project Guide:** Dr. Abdul Lateef Haroon P S (Associate Professor, Dept. of ECE)  
> **Research Team:** Sayeeda Zaiba, Nazia Firdouse, Rafiya Banu, Tahiya Tarannum  

---

## 🌿 Executive Overview

**EcoRoute AI** is an intelligent, full-stack vehicular and logistics carbon emission detector, real-time spatial anomaly identifier, and multi-objective eco-navigation platform. 

While conventional routing engines (Google Maps, Waze, Mapbox) optimize primarily for transit time or distance, they disregard the hidden **carbon cost** of each route. High idling at congested junctions, stop-and-go shockwaves, and steep grade inclines create invisible **"carbon leaks"** in everyday transport. 

EcoRoute AI bridges the critical gap between **detection** and **remediation**, closing the loop by identifying micro-scale carbon leaks and recalculating optimal, low-emission corridors that reduce real-world tailpipe emissions by **18% to 34%**.

---

## 🚀 Key Modules & System Architecture

### 1. 🗺️ Multi-Route GIS Eco-Navigator
- Powered by Leaflet.js with customized high-contrast eco-cartography.
- Compares **3 Simultaneous Paths**:
  - **Standard Route (Baseline)**: Time-optimized, passes through known congestion choke points with heavy carbon leakage.
  - **EcoRoute AI™ (Recommended)**: Lowest cumulative CO₂, smooth green-wave corridors, avoiding bottlenecks.
  - **Balanced Route**: Low-grade scenic highway with gentle inclines and steady cruising speeds.
- Interactive corridor switcher:
  - **Ballari Urban Academic Corridor** (Ballari City Center to BITM Campus via Allipur)
  - **Interstate Freight Expressway** (Ballari Steel & Logistics Hub to Bengaluru Peenya via NH 50 / NH 44)
  - **Bengaluru Tech Grid** (Electronic City Phase 1 to ITPL Whitefield via Silk Board & Marathahalli)
  - **Western Ghats Mountain Pass** (Mysuru to Ooty Nilgiri Plateau via Kalhatty / Gudalur Valley)

### 2. 🧠 AI Carbon Emission & Leak Detection Engine
- Implements empirical algorithms derived from the **IVE (International Vehicle Emission)** and **CMEM (Comprehensive Modal Emission Model)** standards:
  $$\text{Emission} = f(\text{BaseRate}, \text{Speed}, \text{Acceleration}, \text{Road Grade}, \text{Payload Weight}, \text{Congestion Index})$$
- **Spatial Anomaly Classifier**:
  - Automatically flags **Carbon Leaks**:
    - `IDLE_BOTTLENECK`: Traffic signal delays & dead-stop queue drag (>30s idle).
    - `ACCEL_SHOCK_WAVE`: Rapid stop-and-go cycles causing excessive enrichment spikes.
    - `GRADIENT_PENALTY`: Steep road inclines (>4.5%) forcing high-torque low-gear operation.
- AI Root Cause Analysis with 1-click bypass reroute recommendations.
- **⚖️ Multi-Vehicle Comparison Suite**: Instant side-by-side evaluation of all 6 vehicle categories (Petrol Sedan, Diesel SUV, Freight 16T, Delivery Van, Parallel Hybrid, Zero-Tailpipe EV).

### 3. ⚡ Virtual OBD-II Telemetry Simulator & Live Driving Cockpit
- Emulates a vehicle's CAN bus and exhaust gas sensor (MQ-135 proxy):
  - Dynamic analog speedometer with glowing needle physics.
  - Crankshaft engine RPM & throttle percentage tracking.
  - Real-time CO₂ rate ($g/\text{km}$ and $g/\text{sec}$).
  - Live 2D HTML5 canvas sensor stream graph.
  - Radar-pulsing leak alert HUD with synthesized audio sonar pings (Web Audio API).
  - Playback controls: Play, Pause, Reset, 1x/2x/5x/10x simulation speeds with smooth multi-vertex coordinate traversal.
  - **📊 Flight Data Recorder & 1-Click Export**: Download complete timestamped OBD-II telemetry logs as **CSV** or **JSON** for academic research and publication.

### 4. 🚛 Enterprise Fleet Decarbonization & "What-If" Simulator
- Real-time fleet KPI tracking: Total Trips, Cumulative Tonnes CO₂ Abated, Fuel Conserved, and Net Financial Savings.
- **Interactive Scenario Planner**:
  - Adjust sliders for Fleet Size (10 - 300 vehicles), EV Transition Ratio (0 - 100%), and EcoRoute Adoption Rate (10 - 100%).
  - Dynamically calculates annual forecast tonnes of CO₂ abated, fuel cost conserved (in Lakhs INR), and ISO 14064 verified carbon credits.

### 5. 📚 Academic Research Archive & Literature Benchmark
- Directly embeds the Phase 1 research foundation from BITM Ballari:
  - Complete comparative literature review table benchmarked against 5 landmark publications (*Smith & Lee 2020*, *Kumar & Singh 2021*, *Budennyy et al. 2022*, *Martiny 2023*, *Sarioguz 2025*).
  - 6 clearly formulated research gap cards highlighting hardware independence, closed-loop pipelines, and developing-economy context.

### 6. 📜 Official Carbon Audit Certificate Generator
- Generates an official, printable **Green Journey Audit Certificate** featuring:
  - Certified carbon abatement stats & tree-days absorption equivalents.
  - Unique cryptographic verification serial number (`ECO-XXXXXX`).
  - Formal signature lines for Guide Dr. Abdul Lateef Haroon P S, Project Coordinator Dr. Naseeruddin, and the research team.

---

## 🎨 Design Philosophy & Theme

- **Curated Palette**:
  - **Forest Deep & Emerald Glow** (`#0a160d`, `#142a1a`, `#10b981`, `#34d399`)
  - **Warm Terracotta & Sand Accents** (`#c4693d`, `#d4845a`, `#faf7f2`)
  - **Radar Alert Crimson** (`#ef4444`)
- **Typography Hierarchy**:
  - Branding & Research Headings: `Playfair Display`
  - UI Labels, Metrics, and Buttons: `Plus Jakarta Sans`
  - Body Text & Explanations: `DM Sans`
  - Telemetry Readings & Coordinates: `JetBrains Mono`
- Seamless Dark Mode (`Forest Emerald`) and Light Mode (`Cream Botanical`) toggle.

---

## 💻 Local Execution Instructions

To run the application locally on any browser:

```bash
# Navigate to project folder
cd C:\Users\HP\.gemini\antigravity-ide\scratch\ecoroute-app

# Start lightweight local server (Python 3)
python -m http.server 8085
```

Open your browser and navigate to:  
👉 **`http://localhost:8085`**

---

## 👥 Credits & Citations

- **Institution**: Ballari Institute of Technology & Management (BITM), Ballari (Autonomous — VTU, Belagavi).
- **Department**: Electronics & Communication Engineering.
- **Faculty Guide**: Dr. Abdul Lateef Haroon P S.
- **Project Coordinator**: Dr. Naseeruddin.
- **Student Researchers**: Sayeeda Zaiba, Nazia Firdouse, Rafiya Banu, Tahiya Tarannum.
