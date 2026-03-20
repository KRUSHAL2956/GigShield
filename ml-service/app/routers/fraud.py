from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import math

router = APIRouter()

class GPSPing(BaseModel):
    """Simple GPS coordinate with a timestamp for tracking movement."""
    lat: float = Field(..., ge=-90, le=90)
    lng: float = Field(..., ge=-180, le=180)
    timestamp: datetime
    accuracy: Optional[float] = None

class FraudCheckRequest(BaseModel):
    """Payload to compare the current position against a previous known point."""
    rider_id: int
    current_ping: GPSPing
    previous_ping: Optional[GPSPing] = None

class FraudResult(BaseModel):
    """ML response indicating if the movement pattern is physically possible."""
    is_suspicious: bool
    risk_score: float
    reason: Optional[str] = None
    velocity_kmh: float

def haversine_distance(lat1, lon1, lat2, lon2) -> float:
    """
    Standard formula to calculate circular distance between two GPS points in kilometers.
    Essential for velocity checks on a spherical earth model.
    """
    R = 6371  # Earth radius in km
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    a = math.sin(dLat/2) * math.sin(dLat/2) + \
        math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * \
        math.sin(dLon/2) * math.sin(dLon/2)
    # Clamp 'a' to [0, 1] to avoid math domain errors due to float precision
    a = max(0, min(1, a))
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

@router.post("/check", response_model=FraudResult)
async def check_fraud(req: FraudCheckRequest):
    """
    Analyzes displacement over time to flag 'teleportation' or physically impossible movements.
    Used to prevent GPS spoofing and claim manipulation.
    """
    if not req.previous_ping:
        # First ping of the session - nothing to compare against yet
        return FraudResult(is_suspicious=False, risk_score=0.0, velocity_kmh=0.0)

    # Standardize both timestamps to UTC to ensure accurate time_diff calculation
    # This prevents errors when comparing naive and timezone-aware datetimes
    ts_curr = req.current_ping.timestamp.replace(tzinfo=None)
    ts_prev = req.previous_ping.timestamp.replace(tzinfo=None)

    # Calculate elapsed time in hours (standardizing for KM/H)
    time_diff = (ts_curr - ts_prev).total_seconds() / 3600
    if time_diff <= 0:
        # Pings arriving out of order or at the exact same millisecond
        return FraudResult(is_suspicious=True, risk_score=1.0, reason="Invalid timestamp sequence", velocity_kmh=0.0)

    # Calculate great-circle distance (KM)
    dist = haversine_distance(
        req.previous_ping.lat, req.previous_ping.lng,
        req.current_ping.lat, req.current_ping.lng
    )

    # Derived velocity calculation
    velocity = dist / time_diff

    # 🚨 ANOMALY HEURISTICS:
    # Most delivery vehicles (bikes/scooters) in India struggle to exceed 80 km/h in dense traffic.
    # Anything over 150 km/h is flagged as a likely GPS spoof or 'teleportation' attempt.
    is_suspicious = False
    risk_score = 0.0
    reason = None

    if velocity > 150:
        is_suspicious = True
        risk_score = 0.95
        reason = f"Physically impossible velocity ({velocity:.2f} km/h) - Likely GPS Spoofing"
    elif velocity > 85:
        is_suspicious = True
        risk_score = 0.60
        reason = f"Suspicious city-limit velocity ({velocity:.2f} km/h)"
    
    return FraudResult(
        is_suspicious=is_suspicious,
        risk_score=risk_score,
        reason=reason,
        velocity_kmh=round(velocity, 2)
    )
