import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import score, fraud

# 🛡️ GigShield ML Service: Core FastAPI Entry Point
# This microservice handles all AI-driven risk scoring and fraud detection.
app = FastAPI(
    title="GigShield ML Service",
    description="AI-powered risk assessment and fraud detection for gig workers",
    version="1.0.0"
)

# 🌐 CORS Configuration
# Ensures only authorized origins (like our backend and local dev) can query the ML models.
allowed_origins = os.getenv("ALLOWED_ORIGINS", "").split(",")
allow_origins_list = [origin.strip() for origin in allowed_origins if origin.strip()]

if not allow_origins_list:
    # Safe fallback for local development environments
    allow_origins_list = ["http://localhost:3000", "http://localhost:5000"] 

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routing Orchestration: Integrating specialized risk and fraud domains
app.include_router(score.router, prefix="/ml", tags=["Scoring"])
app.include_router(fraud.router, prefix="/ml/fraud", tags=["Fraud Detection"])

@app.get("/health")
async def health():
    """Standard health check for service discovery and monitoring tools."""
    return {
        "status": "healthy",
        "service": "gigshield-ml-service",
        "version": "1.0.0"
    }
