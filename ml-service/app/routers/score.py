from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

router = APIRouter()

# 🌍 Geographic Risk Multipliers
# We adjust baseline risk based on historical weather disaster frequency and infrastructure.
CITY_RISK = {
    "Mumbai": 1.4,      # High monsoon/flood risk
    "Delhi": 1.3,       # Extreme heat and pollution waves
    "Chennai": 1.35,    # Cyclone and heavy rainfall vulnerability
    "Bangalore": 1.1,   # Relatively stable, moderate rain
    "Pune": 1.15,       # Occasional flash flooding
    "Hyderabad": 1.2    # Heatwaves and heavy local showers
}

# 🗓️ Seasonal Risk by Month (1-12)
# Primarily tracking the Indian Monsoon (June-Sept) and peak summer (April-May).
SEASON_RISK = {
    1: 1.0, 2: 1.0, 3: 1.0, 4: 1.2, 5: 1.3,
    6: 1.5, 7: 1.6, 8: 1.55, 9: 1.4,
    10: 1.2, 11: 1.3, 12: 1.0
}


class RiderScoreRequest(BaseModel):
    """Input parameters for calculating a rider's merit-based insurance profile."""
    rating: float = Field(default=4.0, ge=1.0, le=5.0)
    tenure_months: int = Field(default=0, ge=0)
    weekly_earnings: float = Field(default=3000.0, ge=0)
    claims_6m: int = Field(default=0, ge=0)
    active_days: int = Field(default=5, ge=0)
    city: str = "Mumbai"


class ScoreBreakdown(BaseModel):
    """Comprehensive output including the 0-100 score, premium %, and claim caps."""
    total_score: int
    rating_score: int
    tenure_score: int
    earnings_score: int
    claims_score: int
    consistency_score: int
    city_risk_score: int
    premium_pct: float
    premium_amount: float
    monthly_cap: float
    weekly_cap: float
    per_event_cap: float
    loyalty_tier: str
    loyalty_discount: float


# ── Internal Calculation Helpers ──

def calc_rating_score(rating: float) -> int:
    """Awards points based on platform rating (Max 25 pts)."""
    if rating >= 4.8: return 25
    if rating >= 4.5: return 20
    if rating >= 4.0: return 15
    if rating >= 3.5: return 10
    return 5


def calc_tenure_score(months: int) -> int:
    """Loyalty rewards: longer tenure equals lower platform risk (Max 20 pts)."""
    if months >= 12: return 20
    if months >= 9: return 16
    if months >= 6: return 12
    if months >= 3: return 8
    return 4


def calc_earnings_score(earnings: float) -> int:
    """Financial stability check: higher earnings correlate with consistent riding (Max 20 pts)."""
    if earnings >= 6000: return 20
    if earnings >= 4500: return 16
    if earnings >= 3000: return 12
    if earnings >= 1500: return 8
    return 4


def calc_claims_score(claims: int) -> int:
    """Bonus points for low claim frequency over the last 6 months (Max 15 pts)."""
    if claims == 0: return 15
    if claims == 1: return 12
    if claims == 2: return 9
    if claims == 3: return 5
    return 2


def calc_consistency_score(active_days: int) -> int:
    """Measures weekly commitment to the platform (Max 10 pts)."""
    if active_days >= 6: return 10
    if active_days == 5: return 8
    if active_days == 4: return 6
    if active_days == 3: return 4
    return 2


def calc_city_risk_score(city: str) -> int:
    """Inverts the risk factor: safer cities get higher points (Max 10 pts)."""
    risk = CITY_RISK.get(city, 1.2)
    if risk <= 1.1: return 10
    if risk <= 1.2: return 7
    if risk <= 1.35: return 4
    return 2


def get_score_multiplier(total_score: int) -> float:
    """Determines the leverage multiplier for coverage caps based on total score."""
    if total_score >= 85: return 1.0
    if total_score >= 70: return 0.85
    if total_score >= 55: return 0.70
    if total_score >= 40: return 0.55
    return 0.40


def get_loyalty_tier(tenure_months: int, rating: float) -> tuple:
    """Categorizes riders into tiers for perks and faster processing."""
    if tenure_months > 12 and rating > 4.8:
        return ("Titanium", 0.40, 0.25)
    elif tenure_months > 6 and rating > 4.5:
        return ("Gold", 0.20, 0.15)
    else:
        return ("Silver", 0.0, 0.0)


def calc_premium_pct(rating: float, tenure_months: int, claims_6m: int,
                     city: str, month: Optional[int] = None) -> float:
    """
    Main Dynamic Premium Logic:
    Adjusts the base 3.5% rate using rider merit, city risk, and current season.
    """
    if month is None:
        month = datetime.now().month
    
    base = 3.5
    rating_discount = (rating - 3.0) * 0.3
    tenure_discount = min(tenure_months * 0.05, 0.8)
    claims_surcharge = claims_6m * 0.2
    city_risk = CITY_RISK.get(city, 1.2)
    city_surcharge = (city_risk - 1.0) * 0.5
    season_risk = SEASON_RISK.get(month, 1.0)
    season_surcharge = (season_risk - 1.0) * 0.3

    final_pct = base - rating_discount - tenure_discount + claims_surcharge + city_surcharge + season_surcharge

    # Safety clamp: Ensures premium stays within a reasonable bound (2% - 6%)
    return round(max(2.0, min(6.0, final_pct)), 2)


@router.post("/score/rider", response_model=ScoreBreakdown)
async def calculate_rider_score(req: RiderScoreRequest):
    """
    Endpoint to execute the two-stage risk analysis:
    1. Calculate a 0-100 merit score based on behavioral history.
    2. Derive a dynamic premium percentage adjusted by environmental factors.
    """

    # Step 1: Calculate individual scores
    rating_s = calc_rating_score(req.rating)
    tenure_s = calc_tenure_score(req.tenure_months)
    earnings_s = calc_earnings_score(req.weekly_earnings)
    claims_s = calc_claims_score(req.claims_6m)
    consistency_s = calc_consistency_score(req.active_days)
    city_risk_s = calc_city_risk_score(req.city)

    total = rating_s + tenure_s + earnings_s + claims_s + consistency_s + city_risk_s

    # Step 2: Calculate premium %
    base_premium = calc_premium_pct(req.rating, req.tenure_months, req.claims_6m, req.city, month=None)

    # Apply loyalty tier discount
    tier_name, tier_discount, _ = get_loyalty_tier(req.tenure_months, req.rating)
    premium_pct = round(base_premium * (1 - tier_discount), 2)
    premium_pct = max(2.0, premium_pct)  # Floor at 2%

    # Step 3: Calculate caps
    multiplier = get_score_multiplier(total)
    premium_amount = round(req.weekly_earnings * (premium_pct / 100), 2)
    monthly_cap = round(req.weekly_earnings * multiplier, 2)
    weekly_cap = round(monthly_cap * 0.40, 2)
    per_event_cap = round(weekly_cap * 0.30, 2)

    return ScoreBreakdown(
        total_score=total,
        rating_score=rating_s,
        tenure_score=tenure_s,
        earnings_score=earnings_s,
        claims_score=claims_s,
        consistency_score=consistency_s,
        city_risk_score=city_risk_s,
        premium_pct=premium_pct,
        premium_amount=premium_amount,
        monthly_cap=monthly_cap,
        weekly_cap=weekly_cap,
        per_event_cap=per_event_cap,
        loyalty_tier=tier_name,
        loyalty_discount=tier_discount * 100
    )
