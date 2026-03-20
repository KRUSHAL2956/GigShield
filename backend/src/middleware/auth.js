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
async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies && req.cookies.custom_token;

    // Prioritize explicit Authorization header (Bearer token)
    let token = null;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else {
      token = cookieToken;
    }

    if (!token) {
      return res.status(401).json({ error: "No authentication token provided" });
    }

    /**
     * CSRF Protection for Cookie-sourced tokens:
     * If the token is coming from a cookie (not the Authorization header), 
     * and the method is state-changing (POST, PUT, DELETE),
     * we MUST verify a custom header to ensure the request is not cross-site.
     */
    const isCookieSourced = (!authHeader || !authHeader.startsWith("Bearer ")) && req.cookies && req.cookies.custom_token === token;
    const isStateChanging = ["POST", "PUT", "DELETE", "PATCH"].includes(req.method);
    
    if (isCookieSourced && isStateChanging) {
      if (!req.headers["x-requested-with"] && !req.headers["x-csrf-token"]) {
        return res.status(403).json({ 
          error: "Security Check Failed: CSRF protection requires a custom header for state-changing requests." 
        });
      }
    }

    let rider = null;
    let decodedUid = null;
    let isFirebaseToken = false;
    let decodedFirebase = null;
    let decodedCustom = null;

    // Attempt to verify with Firebase Admin (Primary for Auth header)
    try {
      if (admin.apps.length > 0) {
        try {
          decodedFirebase = await admin.auth().verifyIdToken(token);
          isFirebaseToken = true;
          console.log("[Auth] Firebase token verified for UID:", decodedFirebase.uid);
        } catch (fbErr) {
          // If we have a Bearer token but it fails Firebase verification, we don't fallback to JWT 
          // unless a cookie also exists. This avoids signature collisions.
          if (authHeader && authHeader.startsWith("Bearer ")) {
             console.warn("[Auth] Firebase verification failed:", fbErr.code || fbErr.message);
             // We fallback to JWT below
          }
        }
      } else {
        console.error("[Auth] Firebase Admin NOT initialized. Falling back to internal JWT.");
      }

      // If Firebase failed or wasn't tried, attempt custom JWT (internal sessions)
      if (!isFirebaseToken) {
        try {
          decodedCustom = jwt.verify(token, JWT_SECRET);
          console.log("[Auth] Custom JWT verified for ID:", decodedCustom.id);
        } catch (jwtErr) {
          console.error("[Auth] Token verification failed for both Firebase and JWT.");
          return res.status(401).json({ 
            error: "Your session has expired or is invalid",
            details: process.env.NODE_ENV === 'production' ? undefined : (isFirebaseToken ? "Firebase failure" : "JWT failure")
          });
        }
      }
    } catch (crash) {
      console.error("[Auth] verification crash:", crash);
      return res.status(500).json({ error: "Auth tunnel failure" });
    }

    // Attempt to resolve the Actual Rider profile from our database
    try {
      if (isFirebaseToken) {
        decodedUid = decodedFirebase.uid;
        rider = await Rider.findByFirebaseUid(decodedUid);
      } else {
        // Security Fix: Validate decodedCustom and id exist before lookup
        if (!decodedCustom || !decodedCustom.id) {
          return res.status(401).json({ error: "Invalid custom token payload" });
        }
        rider = await Rider.findById(decodedCustom.id);
      }
    } catch (dbError) {
      console.error("Database connection failure during auth:", dbError.message);
      return res.status(500).json({ error: "Internal Auth Error" });
    }

    // Even with a valid token, the rider must exist in our local database
    if (!rider) {
      return res.status(404).json({ error: "Account not found or registration incomplete" });
    }

    /**
     * Consolidate identity information:
     * Firebase tokens store roles directly on the decoded object (via custom claims).
     */
    const tokenRole = isFirebaseToken 
       ? (decodedFirebase.role || "rider")
       : (decodedCustom && decodedCustom.role);

    req.user = {
      id: rider.id,
      uid: decodedUid || rider.firebase_uid,
      role: rider.role || tokenRole || "rider",
    };

    next();
  } catch (error) {
    console.error("Authentication crash:", error.message);
    return res.status(500).json({ error: "Secure authentication tunnel failed" });
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
