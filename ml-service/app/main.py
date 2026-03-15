import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import score

app = FastAPI(
    title="GigShield ML Service",
    description="AI-powered risk assessment and fraud detection for gig workers",
    version="1.0.0"
)

# CORS - Secure config
allowed_origins = os.getenv("ALLOWED_ORIGINS", "").split(",")
allow_origins_list = [origin.strip() for origin in allowed_origins if origin.strip()]

if not allow_origins_list:
    allow_origins_list = ["http://localhost:3000"] # Safe default for dev if not provided

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(score.router, prefix="/ml", tags=["Scoring"])

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "gigshield-ml-service",
        "version": "1.0.0"
    }
