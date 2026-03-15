from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

router = APIRouter()

# --- City Risk Values ---
CITY_RISK = {
    "Mumbai": 1.4,
    "Delhi": 1.3,
    "Chennai": 1.35,
    "Bangalore": 1.1,
    "Pune": 1.15,
    "Hyderabad": 1.2
}

# --- Season Risk by month (1-12) ---
SEASON_RISK = {
    1: 1.0, 2: 1.0, 3: 1.0, 4: 1.2, 5: 1.3,
    6: 1.5, 7: 1.6, 8: 1.55, 9: 1.4,
    10: 1.2, 11: 1.3, 12: 1.0
}


class RiderScoreRequest(BaseModel):
    rating: float = Field(default=4.0, ge=1.0, le=5.0)
    tenure_months: int = Field(default=0, ge=0)
    weekly_earnings: float = Field(default=3000.0, ge=0)
    claims_6m: int = Field(default=0, ge=0)
    active_days: int = Field(default=5, ge=0)
    city: str = "Mumbai"


class ScoreBreakdown(BaseModel):
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


def calc_rating_score(rating: float) -> int:
    if rating >= 4.8:
        return 25
    elif rating >= 4.5:
        return 20
    elif rating >= 4.0:
        return 15
    elif rating >= 3.5:
        return 10
    else:
        return 5


def calc_tenure_score(months: int) -> int:
    if months >= 12:
        return 20
    elif months >= 9:
        return 16
    elif months >= 6:
        return 12
    elif months >= 3:
        return 8
    else:
        return 4


def calc_earnings_score(earnings: float) -> int:
    if earnings >= 6000:
        return 20
    elif earnings >= 4500:
        return 16
    elif earnings >= 3000:
        return 12
    elif earnings >= 1500:
        return 8
    else:
        return 4


def calc_claims_score(claims: int) -> int:
    if claims == 0:
        return 15
    elif claims == 1:
        return 12
    elif claims == 2:
        return 9
    elif claims == 3:
        return 5
    else:
        return 2


def calc_consistency_score(active_days: int) -> int:
    if active_days >= 6:
        return 10
    elif active_days == 5:
        return 8
    elif active_days == 4:
        return 6
    elif active_days == 3:
        return 4
    else:
        return 2


def calc_city_risk_score(city: str) -> int:
    risk = CITY_RISK.get(city, 1.2)
    if risk <= 1.1:
        return 10
    elif risk <= 1.2:
        return 7
    elif risk <= 1.35:
        return 4
    else:
        return 2


def get_score_multiplier(total_score: int) -> float:
    if total_score >= 85:
        return 1.0
    elif total_score >= 70:
        return 0.85
    elif total_score >= 55:
        return 0.70
    elif total_score >= 40:
        return 0.55
    else:
        return 0.40


def get_loyalty_tier(tenure_months: int, rating: float) -> tuple:
    """Returns (tier_name, premium_discount, payout_bonus)"""
    if tenure_months > 12 and rating > 4.8:
        return ("Titanium", 0.40, 0.25)
    elif tenure_months > 6 and rating > 4.5:
        return ("Gold", 0.20, 0.15)
    else:
        return ("Silver", 0.0, 0.0)


def calc_premium_pct(rating: float, tenure_months: int, claims_6m: int,
                     city: str, month: Optional[int] = None) -> float:
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

    # Clamp between 2.0% and 6.0%
    return round(max(2.0, min(6.0, final_pct)), 2)


@router.post("/score/rider", response_model=ScoreBreakdown)
async def calculate_rider_score(req: RiderScoreRequest):
    """Calculate the 0-100 rider score and personalized premium."""

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
