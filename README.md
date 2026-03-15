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
