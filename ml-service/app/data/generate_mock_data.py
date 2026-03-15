"""
Generate mock data for GigShield demo.
Creates 4 rider personas and 12 months of disruption events.
"""
import json
from datetime import datetime, timedelta
import random

def generate_mock_riders():
    """4 demo rider personas from the master plan."""
    return [
        {
            "name": "Ravi Kumar",
            "phone": "9876543210",
            "city": "Mumbai",
            "zone": "Andheri",
            "platform": "Swiggy",
            "avg_weekly_earnings": 5000,
            "tenure_months": 14,
            "lifetime_avg_rating": 4.9,
            "password_hash": "<hashed_password>"
        },
        {
            "name": "Suresh Yadav",
            "phone": "9876543211",
            "city": "Delhi",
            "zone": "Dwarka",
            "platform": "Zomato",
            "avg_weekly_earnings": 3200,
            "tenure_months": 5,
            "lifetime_avg_rating": 4.1,
            "password_hash": "<hashed_password>"
        },
        {
            "name": "Priya Sharma",
            "phone": "9876543212",
            "city": "Mumbai",
            "zone": "Powai",
            "platform": "Swiggy",
            "avg_weekly_earnings": 2800,
            "tenure_months": 1,
            "lifetime_avg_rating": 4.6,
            "password_hash": "<hashed_password>"
        },
        {
            "name": "Vikram Singh",
            "phone": "9876543213",
            "city": "Mumbai",
            "zone": "Dharavi",
            "platform": "Zomato",
            "avg_weekly_earnings": 4000,
            "tenure_months": 3,
            "lifetime_avg_rating": 3.4,
            "password_hash": "<hashed_password>"
        }
    ]


def generate_disruption_events():
    """12 months of historical disruption events for Mumbai, Delhi, Chennai."""
    events = []
    cities = {
        "Mumbai": {
            "zones": ["Andheri", "Powai", "Dharavi", "Bandra", "Kurla"],
            "events": [
                ("heavy_rain", 0.3, 3.5, "high"),
                ("flood_alert", 0.05, 12.0, "extreme"),
                ("extreme_heat", 0.1, 5.0, "high"),
            ]
        },
        "Delhi": {
            "zones": ["Dwarka", "Rohini", "Saket", "Noida", "Gurgaon"],
            "events": [
                ("extreme_heat", 0.25, 5.0, "high"),
                ("severe_pollution", 0.2, 6.0, "high"),
                ("heavy_rain", 0.15, 3.5, "high"),
            ]
        },
        "Chennai": {
            "zones": ["T Nagar", "Adyar", "Tambaram", "Velachery"],
            "events": [
                ("heavy_rain", 0.25, 4.0, "high"),
                ("flood_alert", 0.08, 12.0, "extreme"),
                ("extreme_heat", 0.15, 5.0, "high"),
            ]
        }
    }

    base_date = datetime.now() - timedelta(days=365)

    for city, config in cities.items():
        for day_offset in range(365):
            current_date = base_date + timedelta(days=day_offset)
            month = current_date.month

            for event_type, base_prob, avg_duration, severity in config["events"]:
                # Adjust probability by season
                season_mult = 1.0
                if event_type == "heavy_rain" and month in [6, 7, 8, 9]:
                    season_mult = 3.0
                elif event_type == "extreme_heat" and month in [4, 5, 6]:
                    season_mult = 2.5
                elif event_type == "severe_pollution" and month in [10, 11, 12, 1]:
                    season_mult = 2.0

                if random.random() < base_prob * season_mult * 0.1:
                    duration = round(avg_duration + random.uniform(-1.5, 2.0), 2)
                    duration = max(1.0, duration)
                    zone = random.choice(config["zones"])
                    events.append({
                        "city": city,
                        "zone": zone,
                        "disruption_type": event_type,
                        "severity": severity,
                        "started_at": current_date.isoformat(),
                        "duration_hours": duration,
                        "actual_duration_hours": duration,
                        "source_api": "openweathermap" if event_type != "severe_pollution" else "waqi"
                    })

    return events


if __name__ == "__main__":
    riders = generate_mock_riders()
    events = generate_disruption_events()

    print(f"Generated {len(riders)} mock riders")
    print(f"Generated {len(events)} disruption events")

    with open("/tmp/mock_riders.json", "w") as f:
        json.dump(riders, f, indent=2)
    with open("/tmp/mock_events.json", "w") as f:
        json.dump(events, f, indent=2, default=str)

    print("Saved to /tmp/mock_riders.json and /tmp/mock_events.json")
