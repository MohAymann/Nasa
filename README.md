# AstroHealth — Astronaut Autonomous Health Monitoring Software
### NASA International Space Apps Challenge Solution

> **A mission-critical, minimal, and modern health monitoring system empowering astronauts on long-duration lunar and Martian transit missions to assess, interpret, and act upon their physiological and psychological well-being.**

---

## 🌌 Overview & Mission Context

Long-duration human space missions—such as NASA's Artemis lunar exploration and upcoming crewed Mars transit—expose astronauts to prolonged microgravity, hazardous ionizing cosmic radiation, chronic confinement, and extreme distances from Earth. 

Under communication latency conditions (up to 22 minutes one-way delay to Mars), ground flight surgeons cannot provide immediate real-time telemedicine. Astronauts must take direct responsibility for continuous health assessment, preventative countermeasure execution, and rapid clinical decision-making.

**AstroHealth** is built specifically for this operational environment. It provides a cohesive, clinical-grade medical interface devoid of distracting, unscientific visual clutter. Instead, it utilizes clean aerospace-grade typography, standardized NASA color-coded risk tiers, interactive anatomical mapping, and evidence-based clinical protocols derived from NASA's Human Research Program (HRP).

---

## 🛡️ NASA Human Research Program: The 5 Spaceflight Hazards

AstroHealth directly tracks and counters the **5 Hazards of Human Spaceflight** identified by NASA:

| NASA Hazard | Spaceflight Pathophysiology | Tracked Indicators | Countermeasures & Mitigation |
| :--- | :--- | :--- | :--- |
| **1. Space Radiation** | Galactic cosmic rays (GCR) and solar particle events (SPE) induce DNA double-strand breaks, elevating lifetime fatal cancer risk and tissue damage. | Daily Radiation Dose (`mSv/day`), Cumulative Exposure | Active semiconductor dosimeter logging, storm shelter relocation during solar energetic particle events. |
| **2. Isolation & Confinement** | Circadian desynchronization from 90-minute orbital cycles, sensory deprivation, and interpersonal stressors degrade behavioral health. | Mood Score (`1–10`), Sleep Duration (`hrs`) | Dynamic solid-state lighting (SSL), circadian sleep entrainment, weekly private family uplink, mindfulness protocols. |
| **3. Altered Gravity Fields** | Microgravity causes cephalad fluid shifts, baroreceptor resetting, 1–2% monthly bone mineral density loss in weight-bearing bones, and muscle atrophy. | Heart Rate (`bpm`), Blood Pressure (`mmHg`), Weight-Bearing Recovery | 2.5 hours/day mandatory exercise: Advanced Resistive Exercise Device (ARED) squats/deadlifts, T-2 cycle interval training. |
| **4. Distance from Earth** | Communication delays of 1.3 seconds (Moon) up to 22 minutes (Mars) prevent live emergency surgical/telemedical guidance. | Composite Autonomous Status, Algorithmic Risk Triage | Onboard autonomous threshold triage, localized formulary guidance, emergency stabilization checklists. |
| **5. Hostile Closed Environment** | Elevated spacecraft $CO_2$ levels (>3 mmHg), acoustic fan noise (>50 dBA), microbial transfer, and altered thermoregulation (lack of convection). | Blood Oxygenation ($SpO_2$), Core Body Temp ($°C$), Daily Fluid Intake ($mL$) | Cabin atmosphere scrubber monitoring, 2.5–3.0 L/day targeted hydration to prevent kidney stone formation, ear protection. |

---

## 📊 Core Physiological Indicators Monitored

AstroHealth tracks 10 mission-critical bio-indicators with precise physiological threshold definitions:

1. **Resting Heart Rate (`bpm`)**: Evaluates cardiac deconditioning and autonomic tone (Nominal: 60–100 bpm).
2. **Systolic Blood Pressure (`mmHg`)**: Monitors cephalad fluid redistribution and post-mission orthostatic risk (Nominal: 90–120 mmHg).
3. **Diastolic Blood Pressure (`mmHg`)**: Evaluates systemic vascular resistance and hydration deficits (Nominal: 60–80 mmHg).
4. **Blood Oxygen Saturation ($SpO_2$ `%`)**: Detects hypoxia caused by cabin pressure shifts or environmental scrubbing anomalies (Nominal: 95–100%).
5. **Core Body Temperature ($°C$)**: Detects impaired microgravity thermoregulation or infection (Nominal: 36.1–37.2°C).
6. **Fasting Blood Glucose (`mg/dL`)**: Tracks spaceflight-induced insulin sensitivity variations and metabolic equilibrium (Nominal: 70–100 mg/dL).
7. **Daily Sleep Duration (`hrs`)**: Protects neurocognitive performance and operational alertness (Nominal: 7.0–9.0 hrs).
8. **Psychological Mood Score (`/10`)**: Quantifies subjective well-being, stress coping, and crew morale (Nominal: 7–10).
9. **Daily Radiation Dose (`mSv`)**: Active measurement of ionizing radiation against NASA career thresholds (Nominal: 0–1.0 mSv/day).
10. **Hydration & Fluid Intake (`mL`)**: Prevents negative fluid balance and reduces calcium oxalate renal stone risks (Nominal: 2,000–3,500 mL/day).

---

## 🖥️ System Architecture & Key Features

### 1. Minimal, Aerospace-Standard User Interface
- **Design Philosophy**: No gratuitous purple gradients, glowing neon orbs, or artificial animations. A disciplined zinc-950 dark medical console optimized for legibility under dim spacecraft cabin lighting.
- **Unified Color System**:
  - 🟢 **Normal / Nominal** (`#22c55e`): Physiological parameters within healthy bounds.
  - 🟡 **Caution** (`#f59e0b`): Moderate excursion requiring monitoring and behavioral adjustment.
  - 🔴 **Critical Alert** (`#ef4444`): Urgent excursion requiring protocol execution and flight surgeon notification.
  - 🔵 **Informational / Accent** (`#3b82f6`): Guidance benchmarks and navigational focus.

### 2. Real-Time Mission Dashboard (`/`)
- Live mission timer and UTC mission clock.
- Quick summary cards for total logs, active unacknowledged alerts, and composite crew health status.
- Expandable metric telemetry cards displaying normal ranges, microgravity adaptations, and immediate clinical guidance.
- Sol 42 Simulation Seed: 1-click loading of realistic multi-day astronaut mission telemetry for comprehensive review and testing.

### 3. Vital Signs Logging Console (`/log`)
- Rapid single-click metric selection with numerical validation.
- Instant clinical feedback: immediate assessment of low, normal, or elevated status with tailored actions.
- Automatic alert generation dispatched into the mission alert queue when caution or critical thresholds are crossed.
- Recent readings log with filtering and historical timestamps.

### 4. Physiological Trends & Analytics (`/history`)
- Built on top of **Recharts** for performant, responsive time-series visualization.
- Multi-timespan filtering: **7 Days**, **14 Days**, **30 Days**, or **All Time**.
- System-level filtering: Cardiovascular, Respiratory, Metabolic, Behavioral, and Radiation.
- Statistical summary panel per metric: Minimum, Maximum, Average, and Trend Direction ($↑$, $↓$, $→$).
- Complete historical audit log of clinical warnings with acknowledgment workflows.

### 5. Interactive SVG Anatomical Body Map (`/bodymap`)
- Vector-rendered human anatomical silhouette mapping 7 distinct physiological zones:
  - **Head & Neuro-Behavioral**: Mood, sleep quality, and thermoregulatory stability.
  - **Cardiovascular & Pulmonary**: Central cardiac output and oxygen saturation.
  - **Metabolic & Abdomen**: Blood glucose and fluid assimilation.
  - **Left Upper Extremity**: Blood pressure cuff monitoring site.
  - **Right Upper Extremity**: Continuous fingertip photoplethysmography pulse oximetry.
  - **Lower Extremities**: Trabecular bone mineral preservation and muscular atrophy.
  - **Collar Semiconductor Dosimeter**: Continuous ionizing radiation detection.
- Dynamic color-coding reflects the worst-case status of indicators mapped to that anatomical region.
- Right-hand diagnostic drawer presenting physiological context, space adaptation mechanics, and direct vital recording links.

### 6. Medical Protocols & Countermeasures (`/guidance`)
- Searchable clinical guidelines across all 10 monitored bio-indicators.
- Dual-tab architecture on each metric card:
  - **Action Protocol**: Concrete steps for Low, Normal, and High readings, including exact thresholds for contacting ground surgeons.
  - **Pathophysiology & Risks**: Detailed scientific explanations of why the metric behaves differently in space.
- Standardized mission health directives:
  - **Emergency CAPCOM Protocol**: Immediate steps for critical telemetry excursions.
  - **2.5-Hour Countermeasure Exercise Directive**: ARED resistive squats/deadlifts and CEVIS cycle intervals.
  - **Microgravity Nutrition & Bone Support**: Caloric intake, sodium limits, and calcium/Vitamin D3 supplementation.
  - **Circadian Entrainment Protocol**: Sleep station acoustic damping, light spectrum shifting, and sleep hygiene.
  - **Behavioral Resilience Protocol**: Cognitive monitoring, mindfulness rest, and private psychological conferences.

### 7. Space Hazards & Cumulative Radiation Tracker (`/hazards`)
- Comprehensive overview of the 5 NASA Human Research Program hazards.
- Dynamic hazard risk estimation based on live crew telemetry.
- **Cumulative Radiation Exposure Meter**: Tracks total mission dose against NASA's 1,000 mSv career limit with clear progress bars and safety margins.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router, Turbopack, React 19)
- **Styling**: Tailwind CSS v4 (Design token-driven variables, minimal zinc palette)
- **Data Visualization**: Recharts (Customized dark-theme SVG charts with reference boundaries)
- **State Management**: React Context + `useReducer` with automatic `localStorage` synchronization
- **Architecture**: 100% Client-Side Interactive, zero external backend dependencies required for deployment

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or later
- npm or yarn

### Installation & Launch

1. Navigate to the `nasa` directory:
   ```bash
   cd nasa
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```

4. Open your web browser and navigate to:
   ```
   http://localhost:3000
   ```

### Production Build
To create an optimized, static production build:
```bash
npm run build
npm run start
```

---

## 📚 References & Space Agency Resources

- **NASA Human Research Program (HRP) Hazards**: [https://www.nasa.gov/hrp/hazards/](https://www.nasa.gov/hrp/hazards/)
- **NASA Human Research Program Risks**: [https://www.nasa.gov/hrp/risks/](https://www.nasa.gov/hrp/risks/)
- **NASA Space Flight Human-System Standard (NASA-STD-3001)**: Technical criteria for crew health, habitability, and medical operations.
- **Canadian Space Agency (CSA) — Radiation Monitoring**: [https://www.asc-csa.gc.ca/](https://www.asc-csa.gc.ca/)
- **CSA — Science Experiments in Space & Microgravity Health**: Research on bone demineralization, vascular stiffness, and immune dysregulation aboard the ISS.

---

*Developed for the NASA International Space Apps Challenge.*
