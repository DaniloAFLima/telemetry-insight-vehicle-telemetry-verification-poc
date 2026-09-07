# Telemetry Insight — Vehicle Telemetry Verification POC

> **Automated telemetry verification, diagnostic log processing, statistical anomaly detection, and AI-assisted root-cause analysis for connected vehicles.**  
> Built as an engineering proof-of-concept for the **GlobalLogic Opportunity Showcase — AI Developer & Data Scientist** role.

🔗 **Live Demo:** [https://daniloaflima.github.io/telemetry-insight-vehicle-telemetry-verification-poc/](https://daniloaflima.github.io/telemetry-insight-vehicle-telemetry-verification-poc/) (Public simulation route: [`/demo`](https://daniloaflima.github.io/telemetry-insight-vehicle-telemetry-verification-poc/demo))

[![React](https://img.shields.io/badge/Frontend-React%2018%20%7C%20TypeScript%20%7C%20Vite%20%7C%20Tailwind-blue)](#tech-stack)
[![PocketBase](https://img.shields.io/badge/Backend-Skip%20Cloud%20(PocketBase)-orange)](#architecture)
[![ML](https://img.shields.io/badge/Analytics-Statistical%20IQR%20%7C%20Heuristic%20Classifier-green)](#core-pipeline)
[![Live Demo](https://img.shields.io/badge/Public%20Demo-GitHub%20Pages-brightgreen)](https://daniloaflima.github.io/telemetry-insight-vehicle-telemetry-verification-poc/demo)

---

## Executive Summary

Modern connected vehicles generate continuous, high-frequency telemetry streams across CAN, LIN, and Ethernet buses. Validating vehicle software against diagnostic logs typically involves tedious manual inspection of gigabyte-scale trace files.

**Telemetry Insight** solves this by automating:
1. **Diagnostic Log Ingestion:** Support for raw CAN/LIN traces, standard CSV exports, and structured JSON logs.
2. **Statistical Outlier Detection:** Configurable Interquartile Range (IQR) filtering (default 2.5x threshold) and 3-sigma statistical thresholds to clean noise and flag out-of-envelope values.
3. **Multi-Signal Anomaly Classification:** Heuristic classifier categorizing issues by subsystem (`BATTERY`, `MOTOR`, `THERMAL`, `COMMUNICATION`, `BRAKE`, `SUSPENSION`) and severity (`CRITICAL`, `WARNING`, `INFO`).
4. **Interactive Multi-Run Comparison:** Side-by-side metric diffing (duration, sampling frequency, anomaly rate, delta calculations) between software runs.
5. **AI-Assisted Root Cause Analysis:** Skip Cloud native LLM integration generating professional markdown verification summaries and diagnostic recommendations.
6. **Executive PDF Reports:** Formatted diagnostic report generation with executive summaries and anomaly breakdowns.

---

## Screenshots

Visual walkthrough of the Telemetry Insight Vehicle Telemetry Verification POC:

### 1. Verification Dashboard & KPI Overview
> Real-time software verification dashboard displaying key diagnostic indicators (logs analyzed, anomalies detected, statistical IQR outlier rate, pipeline latency) and anomalous spike trends across CAN/LIN telemetry sessions.

![Telemetry Insight Verification Dashboard](src/assets/image-b8186.png)

---

### 2. Public Live Demo Showcase (`/demo`)
> Interactive public showcase presenting the GlobalLogic vehicle telemetry challenge, highlighting the engineering stack (Python, Pandas, NumPy, Scikit-learn, Docker, Skip Cloud Native AI Agents) and core verification benchmarks (~87% classification accuracy, ~5% anomaly baseline, 2.5x IQR envelope).

![Automated Telemetry Verification Demo Hero](src/assets/image-e28b0.png)

---

### 3. Live CAN Telemetry Stream Simulation
> High-frequency CAN voltage signal stream (`CAN1_ECU_BattVolt` at 50 Hz) simulated in real time through an end-to-end verification pipeline (Ingestion -> IQR Filter -> 50 Hz Timestamping -> ML Classifier), highlighting out-of-envelope voltage deviations and signal spikes.

![Live CAN Telemetry Stream Simulation](src/assets/image-4b0fe.png)

---

## System Architecture

```
[ Connected Vehicle / Test Bench ]
         │  (CAN / LIN / OBD-II Log Files or Live Simulated Stream)
         ▼
[ Ingestion & Normalization Layer ]
   - Format Sniffing (CSV, JSON, CAN DBC Traces)
   - Sampling Frequency Normalization (50 Hz / 100 Hz resampling)
         │
         ▼
[ Statistical Cleaning & Outlier Engine ]
   - 2.5x IQR Envelope Filter
   - Rolling Z-Score Spike Detector
   - Signal Integrity / CRC Validation
         │
         ▼
[ Heuristic Anomaly Classifier ]
   - Voltage Out-of-Envelope (>14.4V or <11.8V)
   - Thermal Runaway & Temperature Spikes (>65°C)
   - Motor Current Surges (>180A)
   - CAN Bus Dropouts & Frame Latency Violations
         │
         ├──► [ Real-Time Dashboard (React + Recharts + Tailwind) ]
         ├──► [ Multi-Run Comparator (Side-by-side metric diff) ]
         └──► [ AI Root Cause Engine (Skip Cloud native LLM) ]
```

---

## Tech Stack & GlobalLogic Alignment

This prototype demonstrates direct competencies sought in the **GlobalLogic Student / Recent Graduate AI Developer & Data Scientist** role:

| Capability | POC Implementation | GlobalLogic Job Fit |
|---|---|---|
| **Vehicle Telemetry Domain** | CAN/LIN bus simulation, battery/ECU signal envelopes, automotive fault codes | High domain relevance (automotive diagnostics, connected mobility) |
| **Data Pipelines & ETL** | Client & server-side streaming ingest, statistical outlier cleaning, timestamp alignment | Python, Pandas, NumPy equivalent data processing patterns |
| **Statistical & ML Analysis** | IQR filtering, moving window anomaly scoring, multi-subsystem classification | Scikit-learn, statistical modeling, feature engineering |
| **AI Integration** | Skip Cloud native LLM prompts for root-cause synthesis and mitigation plans | LLM application development, prompt engineering |
| **Modern Web UI** | React 18, TypeScript, Tailwind CSS, Lucide icons, Recharts | Interactive visualization of large diagnostic datasets |
| **Cloud & Backend** | Skip Cloud (PocketBase), Realtime subscriptions, REST APIs | Cloud-native backends, microservices, containerized workflows |

---

## Live Demonstration

The repository includes a standalone **Public Demo** view accessible without authentication:

- **Live URL:** [https://daniloaflima.github.io/telemetry-insight-vehicle-telemetry-verification-poc/demo](https://daniloaflima.github.io/telemetry-insight-vehicle-telemetry-verification-poc/demo)
- **Path:** `/demo`
- **Features:**
  - Dynamic CAN stream simulation with toggleable playback speed (`1x`, `5x`, `20x`).
  - Active ETL verification pipeline stages (CAN/LIN Ingest, IQR Filter, Timestamp Resampling, Anomaly Classifier).
  - Real-time animated canvas charting of voltage signals against ISO nominal thresholds (`11.8V` – `14.4V`).
  - Instant anomaly detection counter and rate calculation.
  - Interactive "Run Demo Verification Pipeline" workflow.

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation & Run

```bash
# Clone the repository
git clone https://github.com/danilo-lima/telemetry-insight.git
cd telemetry-insight

# Install dependencies
npm install

# Start the development server
npm run dev
```

Visit `http://localhost:5173/demo` for the public showcase, or navigate to `/login` to sign in.

---

## Verification Pipeline Details

1. **IQR Statistical Filter:**
   $$\text{IQR} = Q_3 - Q_1$$
   $$\text{Lower Bound} = Q_1 - 2.5 \times \text{IQR}, \quad \text{Upper Bound} = Q_3 + 2.5 \times \text{IQR}$$
2. **Subsystem Thresholds:**
   - **ECU Battery Voltage:** $11.8\text{V} \le V \le 14.4\text{V}$
   - **Battery Module Temperature:** $T \le 55^\circ\text{C}$ (Warning), $T \ge 65^\circ\text{C}$ (Critical)
   - **Motor Phase Current:** $I \le 160\text{A}$ (Nominal), $I \ge 185\text{A}$ (Critical Spike)

---

## Author & Contact

- **Danilo Lima** — AI Developer & Data Scientist Candidate
- Developed as part of the GlobalLogic Automotive Telemetry Verification Opportunity Showcase.
