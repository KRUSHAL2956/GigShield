# GigShield 🛡️

**AI-Powered Income Protection for Food Delivery Riders (Swiggy & Zomato)**

GigShield is a premium insurtech platform designed to protect Swiggy and Zomato food delivery riders from income disruptions caused by weather, pollution, and catastrophic events. Unlike traditional insurance, GigShield uses real-time API triggers to detect disruptions and issue instant UPI payouts without claims or paperwork.

## 🚀 Key Features

- **AI-Powered Risk Scoring**: Personalized premium rates based on rider performance and history.
- **Automatic Triggers**: Real-time integration with Weather and AQI APIs (Mumbai, Delhi, Bangalore, etc.).
- **Instant Payouts**: UPI-based settlements triggered within 30 seconds of a confirmed disruption.
- **Premium Design**: A high-end, animated landing page with glassmorphism and smooth scroll-reveal effects.
- **Rider Dashboard**: Comprehensive tracking of payouts, coverage limits, and rider score.
- **Admin Portal**: Fraud detection, manual trigger overrides, and detailed analytics.

## 🏗️ Architecture

The project is built with a modern microservices-inspired architecture:

- **Frontend**: React.js with Tailwind CSS, Framer Motion, and Lucide React.
- **Backend**: Node.js/Express.js with PostgreSQL for state management.
- **ML Service**: Python/FastAPI service for custom risk analysis and fraud detection.
- **Database**: PostgreSQL with optimized schemas for high-frequency payout logs.

## 📂 Project Structure

```bash
├── backend/        # Express.js API, JWT Auth, Payout Logic
├── frontend/       # React App, Design System, Rider/Admin UI
├── ml-service/     # AI/ML models for fraud and risk scoring
├── database/       # Migrations and schema definitions
└── docker-compose.yml
```

## 🛡️ Adversarial Defense & Anti-Spoofing Strategy

In response to sophisticated fraud rings utilizing advanced GPS-spoofing to trigger mass false parametric insurance payouts during localized weather events, GigShield employs a multi-layered, AI-driven defense mechanism. Here is how our architecture natively defends the liquidity pool while protecting honest workers:

### 1. The Differentiation (AI-Driven Contextual Verification)
To differentiate between a genuinely stranded rider and a bad actor spoofing their location from the safety of their home, our ML architecture moves beyond static coordinate verification to **Behavioral & Kinematic Profiling**. 
- A genuinely stranded rider exhibits erratic micro-movements (seeking shelter, struggling through water) over time, followed by stationary behavior in public/commercial sheltering zones. 
- A GPS-spoofing bad actor instantly "jumps" into a red-alert zone, maintaining an unnaturally perfect stationary coordinate or repeating a synthetic algorithmic movement loop. 
Our ML time-series models (e.g., LSTMs) analyze this specific trajectory history in the critical 15 minutes leading up to the claim, instantly flagging impossible velocity spikes (teleportation) and synthetic stillness.

### 2. The Data (Multi-Signal Triangulation)
Relying solely on GPS is obsolete. To detect a coordinated, Telegram-organized fraud ring of 500+ workers, our system analyzes a matrix of secondary and meta-data points to expose the syndicate:
- **Network & Hardware Telemetry:** BSSID (Wi-Fi router MAC addresses) and IP clustering. If 50 "stranded" workers map to the same residential ISP or home Wi-Fi router, it is immediately flagged as a coordinated syndicate.
- **Battery & Sensor Diagnostics:** Altitude (barometric pressure) and accelerometer data. Spoofing apps easily fake coordinates but cannot fake the authentic bumpiness of a flooded road or the altitude of a localized bridge vs. a high-rise 15th-floor apartment.
- **Temporal Claim Velocity (The "Flash Mob" Metric):** If 500 claims are triggered from the exact same 1 sq km grid within a 120-second window, the ML service identifies the anomalous spike compared to historical distribution patterns and freezes automated payouts for that grid.

### 3. The UX Balance (Fair & Frictionless Resolution)
We must protect the liquidity pool without penalizing an honest worker whose network drops due to a severe storm or damaged infrastructure. 
- **The "Yellow Zone" Soft Flag:** Claims flagged for suspected spoofing do not result in an instant ban. Instead, they enter a "Yellow Zone."
- **Proof-of-Presence Step-Up Auth:** The rider receives a frictionless, time-limited prompt in the app to capture a 3-second live video or photo of their surroundings (with enforced live-camera capture, explicitly blocking gallery uploads). 
- **Grace Period Processing:** Because honest workers in a storm may have poor internet, this step-up auth is cached offline. Once they reach safety and regain their connection hours later, the proof syncs, and the payout is processed retroactively. This ensures honest workers get their money securely without the system being drained by fraudsters.

## 🛠️ Quick Start

### 1. Prerequisites
- Node.js (v18+)
- Docker & Docker Compose (Recommended)
- PostgreSQL (Only if running locally without Docker)
- Python 3.10+ (For ML Service local setup)

### 2. Setup
Clone the repository and install dependencies:

```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install

# Install ML service dependencies
cd ../ml-service && pip install -r requirements.txt
```

### 3. Environment Variables
Copy `.env.example` to `.env` in both `backend` and `frontend` directories and fill in the required API keys (WeatherAPI, AQI, Payout Gateways).

### 4. Run the Application
Use Docker Compose to spin up the entire stack:

```bash
docker-compose up --build
```

The application will be available at [http://localhost:3000](http://localhost:3000).

---
*Created as part of the DEVTrails Project.*
