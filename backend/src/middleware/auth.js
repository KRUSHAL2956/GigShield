const admin = require("firebase-admin");
const jwt = require("jsonwebtoken");
const Rider = require("../models/rider");

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET environment variable is missing.");
  process.exit(1);
}

/**
 * Core Authentication Middleware
 * Supports both Firebase ID tokens (for frontend-direct login) 
 * and custom JWTs (for legacy or specialized session handling).
 */
// 🛡️ Core Authentication Middleware
// Unified token extraction from either Header (Bearer) or Cookie (HttpOnly)
async function authMiddleware(req, res, next) {
  try {
    // 1. Unified Token Extraction
    const cookieToken = req.cookies?.custom_token || null;
    const bearerToken = req.headers.authorization?.split(" ")[1] || null;
    const token = bearerToken || cookieToken;

    if (!token) {
      console.warn("[Auth] Rejection: No token discovered in request.");
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    console.log(`[Auth] Handshake - Token Length: ${token.length}`);

    let decodedFirebase = null;
    let isFirebaseToken = false;

    // 2. Token Verification (Firebase first, then custom JWT)
    try {
      if (admin.apps.length > 0) {
        try {
          decodedFirebase = await admin.auth().verifyIdToken(token);
          isFirebaseToken = true;
          console.log("--- Firebase Token Verified ---");
          console.log("UID:", decodedFirebase.uid);
          console.log("-------------------------------");
        } catch (fbErr) {
          console.error("[Auth] Firebase verification failure:", fbErr.message);
          // If Bearer token fails Firebase, we don't fallback unless it's a cookie
          if (!bearerToken) throw fbErr; 
          console.warn("[Auth] Bearer fails Firebase, checking for internal JWT...");
        }
      }
    } catch (fbInitErr) {
      console.warn("[Auth] Firebase verification skipped/failed:", fbInitErr.message);
    }

    let decodedCustom = null;
    if (!isFirebaseToken) {
      try {
        decodedCustom = jwt.verify(token, JWT_SECRET);
        console.log("[Auth] Internal JWT verified for ID:", decodedCustom.id);
      } catch (jwtErr) {
        console.error("[Auth] Token verification failed for both methods.");
        return res.status(401).json({ message: "Your session has expired or is invalid" });
      }
    }

    // 3. Database Synchronization & Auto-Provisioning
    let rider = null;
    try {
      if (isFirebaseToken) {
        const uid = decodedFirebase.uid;
        rider = await Rider.findByFirebaseUid(uid);

        if (!rider) {
          console.log(`[Auth] New user (UID: ${uid}). Auto-provisioning...`);
          rider = await Rider.create({
            name: decodedFirebase.name || "GigShield Member",
            email: decodedFirebase.email,
            firebase_uid: uid,
            city: "Onboarding",
            platform: "Google",
            is_active: true
          });
        }
      } else if (decodedCustom?.id) {
        rider = await Rider.findById(decodedCustom.id);
      }
    } catch (dbErr) {
      console.error("[Auth] Database sync failed:", dbErr.message);
      return res.status(500).json({ message: "Internal Auth Error" });
    }

    if (!rider) {
      return res.status(404).json({ message: "Rider profile not found" });
    }

    // 4. Identity Consolidation
    req.user = {
      id: rider.id,
      uid: isFirebaseToken ? decodedFirebase.uid : rider.firebase_uid,
      role: rider.role || "rider",
    };

    next();
  } catch (err) {
    console.error("Auth middleware crash:", err.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

/**
 * Helper middleware to restrict routes to Admin users only.
 * Must be used AFTER authMiddleware.
 */
function adminMiddleware(req, res, next) {
  if (req.user && req.user.role === "admin") {
    return next();
  }

  return res.status(403).json({ error: "Access Denied: Administrative privileges required" });
}

module.exports = {
  authMiddleware,
  adminMiddleware,
};
