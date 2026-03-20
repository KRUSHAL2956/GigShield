const express = require('express');
const bcrypt = require('bcryptjs');
const { z } = require('zod');
const admin = require('firebase-admin');
const Rider = require('../models/rider');
const Policy = require('../models/policy');
const Claim = require('../models/claim');
const DeliveryLog = require('../models/delivery');
const { authMiddleware } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimit');
const jwt = require('jsonwebtoken');

const axios = require('axios');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("FATAL ERROR: process.env.JWT_SECRET is required.");
  process.exit(1);
}


const router = express.Router();
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

const { registerSchema, loginSchema } = require('../validations/riderSchemas');

// Get current authenticated rider profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const rider = await Rider.findById(req.user.id);
    if (!rider) {
      return res.status(404).json({ error: 'Rider not found' });
    }
    const { password_hash, ...sanitizedRider } = rider;
    res.json({ rider: sanitizedRider });
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/riders/register
router.post('/register', authLimiter, async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);

    // Secure Account Linking Check: If firebase_uid is provided, check if it's already used
    if (data.firebase_uid) {
      const riderWithUid = await Rider.findByFirebaseUid(data.firebase_uid);
      if (riderWithUid) {
        return res.status(409).json({ error: 'This Google/Firebase account is already linked to another rider.' });
      }
    }

    // Check if phone already exists
    const existing = await Rider.findByPhone(data.phone);
    if (existing) {
      return res.status(409).json({ error: 'Phone number already registered. Please login instead.' });
    }

    // Hash password (Legacy - keeping for DB compatibility but making it optional in effect)
    let passwordToHash = data.password || require('crypto').randomBytes(8).toString('hex');
    const password_hash = await bcrypt.hash(passwordToHash, 10);

    const rider = await Rider.create({
      name: data.name,
      email: data.email,
      phone: data.phone,
      city: data.city,
      zone: data.zone,
      platform: data.platform,
      avg_weekly_earnings: data.avg_weekly_earnings,
      upi_id: data.upi_id,
      password_hash,
      firebase_uid: data.firebase_uid
    });

    // Try to get initial score from ML service
    let score = null;
    try {
      const scoreRes = await axios.post(`${ML_SERVICE_URL}/ml/score/rider`, {
        rating: 4.0,
        tenure_months: 0,
        weekly_earnings: data.avg_weekly_earnings,
        claims_6m: 0,
        active_days: 5,
        city: data.city
      }, { timeout: 5000 });
      score = scoreRes.data;
    } catch (mlErr) {
      console.warn('ML service unavailable for initial scoring:', mlErr.message);
    }

    const { password_hash: _pw, ...safeRider } = rider;
    res.status(201).json({
      message: 'Registration successful',
      rider: safeRider,
      score
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      console.error('Zod Validation Failed:', err.errors.map(e => ({ path: e.path, message: e.message })));
      return res.status(400).json({ error: 'Validation failed', details: err.errors });
    }
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/riders/login
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) return res.status(400).json({ error: 'Phone and password required' });

    const normalizedPhone = phone.replace(/\D/g, '').slice(-10);
    const rider = await Rider.findByPhoneWithHash(normalizedPhone);

    if (!rider || !rider.password_hash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, rider.password_hash);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: rider.id, role: 'rider' }, JWT_SECRET, { expiresIn: '7d' });
    
    res.cookie('custom_token', token, { 
       httpOnly: true, 
       secure: process.env.NODE_ENV === 'production', 
       sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', 
       maxAge: 7 * 24 * 60 * 60 * 1000 
    });

    const { password_hash: _pw, ...safeRider } = rider;
    res.json({ message: 'Login successful', rider: safeRider, token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/riders/auth/firebase
router.post('/auth/firebase', authLimiter, async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ error: 'ID Token required' });

  try {
    if (!admin.apps.length) {
      console.error('[Auth] Firebase Admin NOT initialized');
      return res.status(500).json({ error: 'Authentication service unavailable' });
    }
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, phone_number, email, displayName } = decodedToken;
    const name = displayName; 
    
    console.log('[Auth] Google Token Decoded: Success');

    // 1. Try finding by firebase_uid
    let rider = await Rider.findByFirebaseUid(uid);
    console.log('[Auth] findByFirebaseUid matched:', !!rider);
    
    // 2. If not found, try finding by phone (for SMS OTP users)
    if (!rider && phone_number) {
      const normalizedPhone = phone_number.replace(/\D/g, '').slice(-10);
      rider = await Rider.findByPhone(normalizedPhone);
      console.log('[Auth] findByPhone matched:', !!rider);
    }
    
    // 3. If still not found, try finding by email (for native forms + Google Auth)
    if (!rider && email) {
      rider = await Rider.findByEmail(email);
      console.log('[Auth] findByEmail matched:', !!rider);
    }

    if (rider) {
      console.log(`[Auth] Rider found (ID: ${rider.id}), updating UID if needed`);
      if (rider.firebase_uid && rider.firebase_uid !== uid) {
        console.warn(`[Auth] firebaseUidConflict for rider ID: ${rider.id}`);
        return res.status(403).json({ error: 'This phone/email is already linked to another Google account.' });
      }
      if (rider.firebase_uid !== uid) {
        await Rider.updateFirebaseUid(rider.id, uid);
      }
    } else {
      console.log('[Auth] Processing as NEW user');
      return res.status(200).json({ 
        message: 'Registration required', 
        needsRegistration: true,
        firebaseData: { uid, phone: phone_number, email, name }
      });
    }

    const { password_hash: _pw, ...safeRider } = rider;
    // We return our custom JWT alongside successful Firebase login
    const token = jwt.sign({ id: rider.id, role: 'rider' }, JWT_SECRET, { expiresIn: '7d' });
    
    res.cookie('custom_token', token, { 
       httpOnly: true, 
       secure: process.env.NODE_ENV === 'production', 
       sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', 
       maxAge: 7 * 24 * 60 * 60 * 1000 
    });

    res.json({
      message: 'Login successful',
      rider: safeRider,
      token
    });
  } catch (err) {
    console.error('Firebase Auth Error:', err);
    res.status(401).json({ error: 'Invalid Firebase token' });
  }
});

// POST /api/riders/logout
router.post('/logout', (req, res) => {
  res.clearCookie('custom_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' || !!process.env.VERCEL,
    sameSite: (process.env.NODE_ENV === 'production' || !!process.env.VERCEL) ? 'none' : 'lax'
  });
  res.json({ message: 'Logged out successfully' });
});

// GET /api/riders/:id/profile
router.get('/:id/profile', authMiddleware, async (req, res) => {
  const requestedId = parseInt(req.params.id);
  if (req.user.id !== requestedId && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const rider = await Rider.findById(requestedId);
    if (!rider) {
      return res.status(404).json({ error: 'Rider not found' });
    }

    const { password_hash: _pw, ...safeRider } = rider;
    res.json({ rider: safeRider });
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// GET /api/riders/:id/score
router.get('/:id/score', authMiddleware, async (req, res) => {
  const requestedId = parseInt(req.params.id);
  if (req.user.id !== requestedId && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const rider = await Rider.findByIdWithScore(requestedId);
    if (!rider) {
      return res.status(404).json({ error: 'Rider not found' });
    }

    // If no score exists, calculate one from ML service
    if (!rider.total_score) {
      try {
        const claims = await Rider.getClaimsCount(rider.id);
        const scoreRes = await axios.post(`${ML_SERVICE_URL}/ml/score/rider`, {
          rating: parseFloat(rider.lifetime_avg_rating) || 4.0,
          tenure_months: rider.tenure_months || 0,
          weekly_earnings: parseFloat(rider.avg_weekly_earnings) || 3000,
          claims_6m: claims,
          active_days: 5,
          city: rider.city
        }, { timeout: 5000 });

        return res.json({
          rider: {
            id: rider.id,
            name: rider.name,
            city: rider.city,
            zone: rider.zone
          },
          score: scoreRes.data
        });
      } catch (mlErr) {
        console.warn('ML service unavailable:', mlErr.message);
        return res.status(200).json({
          rider: {
            id: rider.id,
            name: rider.name,
            city: rider.city,
            zone: rider.zone
          },
          score: null,
          message: 'ML service unavailable'
        });
      }
    }

    res.json({
      rider: {
        id: rider.id,
        name: rider.name,
        city: rider.city,
        zone: rider.zone
      },
      score: {
        total_score: rider.total_score,
        breakdown: {
          rating: rider.rating_score,
          tenure: rider.tenure_score,
          earnings: rider.earnings_score,
          claims: rider.claims_score,
          consistency: rider.consistency_score,
          city_risk: rider.city_risk_score
        },
        premium_pct: rider.premium_pct
      }
    });
  } catch (err) {
    console.error('Score fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch score' });
  }
});

// GET /api/riders/:id/dashboard-summary
router.get('/:id/dashboard-summary', authMiddleware, async (req, res) => {
  const riderId = parseInt(req.params.id);
  if (req.user.id !== riderId && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const [stats, recentClaims, recentDeliveries] = await Promise.all([
      Rider.getDashboardStats(riderId),
      Claim.findByRiderId(riderId, 3),
      DeliveryLog.getRecentDeliveries(riderId, 5)
    ]);
    
    res.json({
      stats,
      recentClaims,
      recentDeliveries
    });
  } catch (err) {
    console.error('Dashboard summary error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard summary' });
  }
});

// GET /api/riders/:id/policy
router.get('/:id/policy', authMiddleware, async (req, res) => {
  const riderId = parseInt(req.params.id);
  if (req.user.id !== riderId && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const [policy, usage] = await Promise.all([
      Policy.findActiveByRiderId(riderId),
      Policy.getCoverageUsage(riderId)
    ]);
    res.json({ policy, usage });
  } catch (err) {
    console.error('Policy fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch policy info' });
  }
});

// GET /api/riders/:id/claims
router.get('/:id/claims', authMiddleware, async (req, res) => {
  const riderId = parseInt(req.params.id);
  if (req.user.id !== riderId && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const [claims, stats] = await Promise.all([
      Claim.findByRiderId(riderId, 50),
      Claim.getStats(riderId)
    ]);
    res.json({ claims, stats });
  } catch (err) {
    console.error('Claims fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch claims history' });
  }
});

module.exports = router;
