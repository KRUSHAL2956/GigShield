# 🛡️ GigShield  
### AI-Powered Parametric Income Protection for Food Delivery Riders

---

## 1. 📌 Problem Understanding

India’s gig economy relies heavily on delivery partners working for platforms like Swiggy and Zomato. These workers operate in highly volatile conditions where external disruptions such as:

- Heavy rainfall  
- Extreme heat  
- Severe air pollution  
- Local curfews or flooding  

directly reduce their working hours and, therefore, their income.

Unlike salaried workers, delivery partners have **no income protection mechanism**. A few hours of disruption can result in a significant drop in their weekly earnings.

Traditional insurance models fail in this context because they are:
- Claim-based  
- Time-consuming  
- Not aligned with daily/weekly income cycles  

👉 Therefore, there is a need for a **real-time, automated, income protection system**.

---

## 2. 💡 Proposed Solution

GigShield is a **parametric insurance platform** designed specifically for gig delivery workers.

Instead of relying on claims, the system:
- Monitors real-world disruption signals  
- Detects income-impacting events  
- Calculates estimated income loss  
- Triggers payouts automatically  

This creates a **zero-claim, real-time insurance experience**.

---

## 3. 👤 Target Persona

**Primary Users:** Food delivery riders (Swiggy / Zomato)

### Typical Profile:
- Works 8–10 hours per day  
- Earns ₹4,000–₹8,000 per week  
- Income directly linked to active working time  

### Key Risk:
Any disruption → immediate income drop

---

## 4. 🔄 System Workflow

The complete system operates in the following sequence:

### Step 1: Onboarding
- Rider registers with basic details  
- System assigns an initial risk score  

### Step 2: Policy Activation
- Personalized weekly premium is calculated  
- Rider chooses payment mode (weekly / per delivery)

### Step 3: Continuous Monitoring
- System monitors weather and environmental data for the rider’s location  

### Step 4: Trigger Detection
- If predefined thresholds are crossed, a disruption event is created  

### Step 5: Fraud Validation
- Rider activity and location data are validated  

### Step 6: Payout Processing
- Income loss is calculated  
- Payout is triggered automatically (simulated in current phase)

---

## 5. 💸 Weekly Premium Model

GigShield uses a **dynamic weekly pricing approach**.

### Base Formula:

`Final Premium (%) = 3.5% - Loyalty Adjustment + Risk Adjustment`

### Key Factors:
- Rider rating  
- Platform experience  
- Weekly income consistency  
- Claim history  
- City-level risk  

### Example:

Weekly income = ₹5,000  
Premium rate = 2.5%  

→ Weekly premium = ₹125  

### Micro-Deduction Model:
Instead of a lump sum:
- ~₹2 is deducted per delivery  
- Reduces friction and improves adoption  

---

## 6. 🌩️ Parametric Trigger System

The system uses external APIs to detect disruptions.

| Event | Threshold | Source |
|------|----------|--------|
| Rain | > 15 mm/hr | Weather API |
| Heat | > 42°C | Weather API |
| AQI | > 300 | AQI API |
| Flood | Official alerts | Mock/API |

### Trigger Engine:
- Runs periodically (hourly)  
- Creates disruption events automatically  

---

## 7. 💰 Income Loss Calculation

Income loss is estimated using a simple model:

```text
Hourly Income = Weekly Earnings / 60
Loss = Hourly Income × Duration of Disruption
```

### Example:

₹5,000/week → ₹83/hour  
3.5 hours disruption  

→ Payout ≈ ₹290  

---

## 8. 🤖 AI/ML Integration

### 8.1 Risk Scoring Model
- Assigns rider categories (High / Medium / Low risk)  
- Adjusts premium dynamically  

### 8.2 Fraud Detection Model
- Uses location-based velocity validation  
- Detects unrealistic movement  

### 8.3 Future Scope
- Predictive risk modeling  
- Dynamic pricing based on forecast  

---

## 9. 🛡️ Adversarial Defense & Anti-Spoofing Strategy

To address GPS spoofing and coordinated fraud:

### Differentiation:
- Detects impossible speed (>150 km/h)  
- Identifies unnatural movement patterns  

### Multi-Signal Validation:
- GPS history  
- Device/network signals  
- Behavioral patterns  

### Fraud Rules:
- No activity during disruption → flagged  
- Sudden cluster claims → system alert  

### UX Balance:
- Flagged claims enter review mode  
- Additional verification requested  
- No immediate rejection for genuine users  

---

## 10. 🏗️ System Architecture

### Frontend:
- React.js  
- Tailwind CSS  

### Backend:
- Node.js + Express  

### ML Service:
- Python + FastAPI  

### Database:
- PostgreSQL  

### External APIs:
- Weather API  
- AQI API  

---

## 11. 📂 Project Structure

```text
├── backend/            # APIs, auth, payout logic
├── frontend/           # UI and dashboard
├── ml-service/         # risk & fraud models
├── database/           # schema & migrations
└── docker-compose.yml
```

---

## 12. 📊 Dashboard Design

### Rider Dashboard:
- Coverage status  
- Earnings protected  
- Payout history  

### Admin Dashboard:
- Fraud monitoring  
- Risk analytics  
- System insights  

---

## 13. 💼 Business Model

### Revenue:
- Weekly micro-premiums  

### Profit Strategy:
- Maintain controlled payout ratio  
- Adjust pricing based on seasonal risk  
- Prevent fraud effectively  

---

## 14. 🧪 Implementation Status

### Completed:
- User onboarding  
- Trigger engine  
- Premium logic  
- Fraud detection  
- Payout calculation  

### In Progress:
- Admin dashboard  
- UI improvements  

### Pending:
- Real payment integration  
- Predictive AI models  

---

## 15. 🚀 Future Roadmap

### Phase 2:
- Full automation of workflows  
- Enhanced analytics  
- Improved fraud detection  

### Phase 3:
- Payment gateway integration  
- Platform API integration  
- Multi-city scaling  

---

## 16. 🏁 Conclusion

GigShield introduces a new approach to insurance:

- Event-driven instead of claim-driven  
- Automated instead of manual  
- Designed specifically for gig workers  

The system aims to provide **reliable income protection** in a way that is simple, scalable, and practical.

---

**GigShield — Protecting Income, Not Just Assets**
