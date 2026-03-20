-- ============================================
-- GigShield Database Schema
-- DEVTrails 2026
-- 11 tables in dependency order
-- ============================================

-- 1. Core rider profiles
CREATE TABLE IF NOT EXISTS riders (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    phone           VARCHAR(15) UNIQUE NOT NULL,
    city            VARCHAR(50) NOT NULL,
    zone            VARCHAR(100) NOT NULL,
    platform        VARCHAR(20) NOT NULL CHECK (platform IN ('Swiggy', 'Zomato')),
    avg_weekly_earnings DECIMAL(10,2) DEFAULT 0,
    tenure_months   INTEGER DEFAULT 0,
    lifetime_avg_rating DECIMAL(3,2) DEFAULT 4.0 CHECK (lifetime_avg_rating >= 0.00 AND lifetime_avg_rating <= 5.00),
    password_hash   VARCHAR(255),
    firebase_uid    VARCHAR(128) UNIQUE,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_riders_phone ON riders(phone);

-- 2. Actual earnings per week
CREATE TABLE IF NOT EXISTS weekly_earnings (
    id              SERIAL PRIMARY KEY,
    rider_id        INTEGER NOT NULL REFERENCES riders(id) ON DELETE CASCADE,
    week_start      DATE NOT NULL,
    amount          DECIMAL(10,2) NOT NULL,
    deliveries_count INTEGER DEFAULT 0,
    active_days     INTEGER DEFAULT 0 CHECK (active_days >= 0 AND active_days <= 7),
    created_at      TIMESTAMP DEFAULT NOW(),
    UNIQUE(rider_id, week_start)
);

-- 3. AI-calculated score every week
CREATE TABLE IF NOT EXISTS rider_scores (
    id              SERIAL PRIMARY KEY,
    rider_id        INTEGER NOT NULL REFERENCES riders(id) ON DELETE CASCADE,
    week_start      DATE NOT NULL,
    total_score     INTEGER NOT NULL CHECK (total_score >= 0 AND total_score <= 100),
    rating_score    INTEGER DEFAULT 0,
    tenure_score    INTEGER DEFAULT 0,
    earnings_score  INTEGER DEFAULT 0,
    claims_score    INTEGER DEFAULT 0,
    consistency_score INTEGER DEFAULT 0,
    city_risk_score INTEGER DEFAULT 0,
    premium_pct     DECIMAL(4,2) NOT NULL,
    created_at      TIMESTAMP DEFAULT NOW(),
    UNIQUE(rider_id, week_start)
);

-- 4. Weekly insurance policies
CREATE TABLE IF NOT EXISTS policies (
    id              SERIAL PRIMARY KEY,
    rider_id        INTEGER NOT NULL REFERENCES riders(id) ON DELETE CASCADE,
    week_start      DATE NOT NULL,
    week_end        DATE NOT NULL,
    premium_pct     DECIMAL(4,2) NOT NULL CHECK (premium_pct >= 0),
    premium_amount  DECIMAL(10,2) NOT NULL CHECK (premium_amount >= 0),
    monthly_cap     DECIMAL(10,2) NOT NULL CHECK (monthly_cap >= 0),
    weekly_cap      DECIMAL(10,2) NOT NULL CHECK (weekly_cap >= 0),
    per_event_cap   DECIMAL(10,2) NOT NULL CHECK (per_event_cap >= 0),
    status          VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'expired', 'cancelled')),
    created_at      TIMESTAMP DEFAULT NOW(),
    UNIQUE(rider_id, week_start),
    CHECK (week_end > week_start)
);

-- 5. Premium payment records
CREATE TABLE IF NOT EXISTS premium_transactions (
    id              SERIAL PRIMARY KEY,
    policy_id       INTEGER NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    amount          DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    payment_method  VARCHAR(20) DEFAULT 'upi',
    razorpay_ref    VARCHAR(100),
    status          VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    paid_at         TIMESTAMP DEFAULT NOW()
);

-- Unique index for razorpay_ref to allow multiple NULLs but only one of each reference
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_razorpay_ref ON premium_transactions(razorpay_ref) WHERE razorpay_ref IS NOT NULL;

-- 6. Weather/disruption events detected by trigger engine
CREATE TABLE IF NOT EXISTS disruption_events (
    id              SERIAL PRIMARY KEY,
    city            VARCHAR(50) NOT NULL,
    zone            VARCHAR(100),
    disruption_type VARCHAR(30) NOT NULL CHECK (disruption_type IN ('heavy_rain', 'extreme_heat', 'severe_pollution', 'flood_alert', 'curfew')),
    severity        VARCHAR(20) NOT NULL CHECK (severity IN ('moderate', 'high', 'extreme')),
    started_at      TIMESTAMP NOT NULL,
    ended_at        TIMESTAMP,
    duration_hours  DECIMAL(5,2),
    actual_duration_hours DECIMAL(5,2),
    source_api      VARCHAR(50),
    raw_data        JSONB,
    created_at      TIMESTAMP DEFAULT NOW(),
    CONSTRAINT chk_ended_after_started CHECK (ended_at IS NULL OR ended_at > started_at)
);

-- 7. All claims — approved and fraud-blocked
CREATE TABLE IF NOT EXISTS claims (
    id              SERIAL PRIMARY KEY,
    rider_id        INTEGER NOT NULL REFERENCES riders(id) ON DELETE CASCADE,
    policy_id       INTEGER NOT NULL REFERENCES policies(id) ON DELETE RESTRICT,
    event_id        INTEGER NOT NULL REFERENCES disruption_events(id) ON DELETE RESTRICT,
    raw_payout      DECIMAL(10,2) NOT NULL CHECK (raw_payout >= 0),
    final_payout    DECIMAL(10,2) DEFAULT 0 CHECK (final_payout >= 0),
    fraud_score     INTEGER DEFAULT 0,
    fraud_reasons   TEXT[],
    status          VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'fraud_blocked', 'rejected', 'cap_exceeded')),
    created_at      TIMESTAMP DEFAULT NOW(),
    processed_at    TIMESTAMP
);

-- 8. Money actually sent to riders
CREATE TABLE IF NOT EXISTS payout_transactions (
    id              SERIAL PRIMARY KEY,
    claim_id        INTEGER NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    amount          DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    upi_id          VARCHAR(100),
    razorpay_payout_id VARCHAR(100) UNIQUE,
    status          VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    paid_at         TIMESTAMP
);

-- 9. Running cap totals (also cached in Redis)
CREATE TABLE IF NOT EXISTS weekly_coverage_usage (
    id              SERIAL PRIMARY KEY,
    rider_id        INTEGER NOT NULL REFERENCES riders(id) ON DELETE CASCADE,
    week_start      DATE NOT NULL,
    total_claimed   DECIMAL(10,2) DEFAULT 0,
    events_count    INTEGER DEFAULT 0,
    monthly_total   DECIMAL(10,2) DEFAULT 0,
    updated_at      TIMESTAMP DEFAULT NOW(),
    UNIQUE(rider_id, week_start)
);

-- 10. Per-delivery micro-premium tracking (NEW)
CREATE TABLE IF NOT EXISTS delivery_logs (
    id              SERIAL PRIMARY KEY,
    rider_id        INTEGER NOT NULL REFERENCES riders(id) ON DELETE CASCADE,
    delivery_earning DECIMAL(10,2) NOT NULL,
    premium_deducted DECIMAL(10,2) NOT NULL,
    policy_id       INTEGER REFERENCES policies(id),
    created_at      TIMESTAMP DEFAULT NOW()
);

-- 11. Payout logs for automatic/manual triggers (NEW)
CREATE TABLE IF NOT EXISTS payouts (
    id              SERIAL PRIMARY KEY,
    rider_id        INTEGER NOT NULL REFERENCES riders(id) ON DELETE CASCADE,
    event_id        INTEGER REFERENCES disruption_events(id) ON DELETE SET NULL,
    amount          DECIMAL(10,2),
    base_payout     DECIMAL(10,2),
    final_payout    DECIMAL(10,2),
    trigger_event   TEXT,
    loyalty_tier    VARCHAR(20),
    multiplier_applied DECIMAL(4,2),
    status          VARCHAR(20) DEFAULT 'processed' CHECK (status IN ('pending', 'processed', 'failed', 'cancelled')),
    created_at      TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- Indexes for common queries
-- ============================================
CREATE INDEX IF NOT EXISTS idx_policies_rider ON policies(rider_id, status);
CREATE INDEX IF NOT EXISTS idx_claims_rider ON claims(rider_id, status);
CREATE INDEX IF NOT EXISTS idx_disruption_events_city ON disruption_events(city, disruption_type, started_at);
CREATE INDEX IF NOT EXISTS idx_delivery_logs_rider ON delivery_logs(rider_id, created_at);

-- Add missing foreign-key indexes
CREATE INDEX IF NOT EXISTS idx_claims_policy ON claims(policy_id);
CREATE INDEX IF NOT EXISTS idx_claims_event ON claims(event_id);
CREATE INDEX IF NOT EXISTS idx_premium_transactions_policy ON premium_transactions(policy_id);
CREATE INDEX IF NOT EXISTS idx_payout_transactions_claim ON payout_transactions(claim_id);
CREATE INDEX IF NOT EXISTS idx_delivery_logs_policy ON delivery_logs(policy_id);

-- Payouts indexes
CREATE INDEX IF NOT EXISTS idx_payouts_rider ON payouts(rider_id, created_at);
CREATE INDEX IF NOT EXISTS idx_payouts_event ON payouts(event_id);
