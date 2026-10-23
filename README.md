# QuarantineCare — Biocontainment OS (Full-Stack Application)

A mission-critical quarantine and biocontainment clinical operations system built with **React.js** frontend and **Node.js + Express.js** backend. Engineered for isolation ward bed management, continuous vital telemetry tracking, doctor rounds, ISO-72H discharge validation, and cryptographic audit logging.

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
Run the install command from the root directory:
```bash
npm run install:all
```
*(Or individually in `backend/` and `frontend/` using `npm install`)*

### 2. Start Backend & Frontend

#### Terminal 1: Node.js Express Backend
```bash
cd backend
npm start
```
*Backend runs on `http://localhost:5000`*

#### Terminal 2: React.js Frontend
```bash
cd frontend
npm run dev
```
*Frontend runs on `http://localhost:3000` with automatic `/api` proxying to port 5000*

---

## 🏗️ Architecture & Project Structure

```
Factwise Task/
├── backend/
│   ├── data/
│   │   └── store.js         # In-memory store with 74 isolation patient records, vitals histories, doctor notes
│   ├── cryptoUtils.js       # SHA-256 Merkle root & cryptographic tamper-evident block generator
│   ├── server.js            # Express REST API (patients, vitals, rounds, discharge, outcomes, audit, settings)
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js    # Centralized REST API client
│   │   ├── components/
│   │   │   ├── Header.jsx   # Top bar with ⌘K search, live clock, role switcher (Nurse/Doctor/Admin), alert drawer
│   │   │   ├── Sidebar.jsx  # Fixed 250px clinical navigation with real-time badges & capacity bar
│   │   │   ├── Toast.jsx    # Floating notification toast for vital entries & discharge signoffs
│   │   │   └── RegisterPatientModal.jsx # Bed allocation & patient transfer-in modal
│   │   ├── context/
│   │   │   └── AppContext.jsx # Shared global state, stats sync, simulated active persona
│   │   ├── pages/
│   │   │   ├── OverviewDashboard.jsx  # 6 KPI bentos, interactive 74-bed ward matrix, live alert stream
│   │   │   ├── PatientDirectory.jsx   # High-density patient registry, triage tabs, filter rail
│   │   │   ├── PatientDetail.jsx      # Dossier with temperature SVG timeline, ISO-72H engine, labs, doctor notes
│   │   │   ├── NurseTasks.jsx         # Shift duty queue, decimal temperature entry, auto-advancement
│   │   │   ├── NurseDashboard.jsx     # Bedside vitals KPI cards, rapid sweep action, fever alerts
│   │   │   ├── DoctorRounds.jsx       # Visit queue, missing temperature warning banner, clinical note logger
│   │   │   ├── DoctorDashboard.jsx    # Clinical acuity breakdown, pending evaluations, discharge recommendations
│   │   │   ├── DischargeQueue.jsx     # ISO-72H-FEVERFREE multi-step signoff & bed turnover release
│   │   │   ├── OutcomesReports.jsx    # WHO Biocontainment benchmarks, efficacy rates, cohort trend charts
│   │   │   ├── AuditLog.jsx           # Tamper-evident SHA-256 block ledger with Verify Integrity action
│   │   │   ├── UserManagement.jsx     # Directorate staff directory, role reassignment, and status management
│   │   │   ├── LoginPage.jsx          # Secure multi-role authentication with demo preset logins
│   │   │   └── SettingsPage.jsx       # Staff profile dossier, governance parameters, clinical thresholds, RBAC
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── tailwind.config.js   # Precision design tokens matching DESIGN.md
│   ├── postcss.config.js
│   ├── vite.config.js       # Vite config with /api reverse proxy
│   └── package.json
│
└── package.json             # Root workspace runner scripts
```

---

## 🌟 Key Features & Clinical Protocols

1. **Role-Based Access Control (RBAC) & Dedicated Dashboards**:
   - **Nurse Scope**: Focused on bedside decimal vitals sweeps, observation logs, and high-fever detection.
   - **Doctor Scope**: Clinical rounds evaluations, triage acuity scoring, fever spike follow-ups, and discharge recommendations.
   - **Administrator Scope**: Admissions, airlock negative-pressure containment, bed turnover, governance thresholds, staff user management, and Merkle audit log.

2. **Secure Authentication & Demo Presets**:
   - Full login screen (`/login`) with session token verification, role permissions enforcement, and protected route redirection.
   - 1-click Demo credentials for Nurse (`nurse@quarantinecare.org`), Doctor (`doctor@quarantinecare.org`), and Admin (`admin@quarantinecare.org`).

3. **74-Bed Containment Grid (Overview Dashboard)**:
   - Visualizes all 74 isolation units across 4 Containment Wings (Wing A, BSL-4 Wing B, Wing C, Wing D).
   - Real-time status indicators (Stable Afebrile, Triage Caution, Fever Spike ≥38.5°C, Discharge Ready).

4. **ISO-72H-FEVERFREE Verification Protocol (Discharge Queue)**:
   - Validates that a patient has maintained 3 consecutive 24-hour periods (72 full hours) with all recorded temperatures < 37.5°C without antipyretic suppression.
   - Multi-step electronic sign-off (Biometrics verified, Lab PCR negative, Attending physician approval, UVGI bed decontamination).
   - Bed release action decrements occupancy from 74/74 to 73/74 and writes an immutable cryptographic record.

5. **Nurse Temperature Entry (Nurse Tasks)**:
   - Shift queue with decimal temperature inputs, route selection (Tympanic, Oral, Axillary, Infrared), and antipyretic suppression toggles.
   - Instant visual feedback (<37.5°C Normal, 37.5–38.4°C Borderline, ≥38.5°C Critical Fever Spike).
   - Auto-advance to next pending patient in queue upon submission.

6. **Doctor Rounds & Exception Justification (Doctor Rounds)**:
   - Acuity-prioritized visit queue with missing temperature protocol warning.
   - Requires clinical justification if evaluating an exception patient without recent recorded vitals.

7. **Cryptographic Compliance Ledger (Audit Log)**:
   - SHA-256 hashed audit blocks linked in a Merkle tree structure complying with ISO-27799 healthcare data governance standards.
   - Interactive "Verify Integrity" button that validates hash chain continuity and confirms zero drift.

8. **Staff Profile & Biocontainment Clearance Dossier**:
   - Detailed clinician profile view with BSL-4 Airborne Pathogen clearance badge, clinical license registry, and RBAC permissions matrix.

