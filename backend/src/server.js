const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { generalLimiter } = require('./middleware/rateLimit');

dotenv.config();

// ── Service Initializations ── 
const admin = require('firebase-admin');
let firebaseInitialized = false;

// We initialize Firebase Admin using either a full service account JSON or individual variables
const fbProjectID = process.env.FIREBASE_PROJECT_ID || process.env.PROJECT_ID;
const fbClientEmail = process.env.FIREBASE_CLIENT_EMAIL || process.env.CLIENT_EMAIL;
const fbPrivateKey = process.env.FIREBASE_PRIVATE_KEY || process.env.PRIVATE_KEY;

// 🛡️ Debug Log Stage 1: Enviroment Checklist
console.log('--- Firebase Admin Auth Debug ---');
console.log('FIREBASE_PROJECT_ID:', fbProjectID || 'MISSING');
console.log('FIREBASE_CLIENT_EMAIL:', fbClientEmail || 'MISSING');
console.log('FIREBASE_PRIVATE_KEY EXISTS:', fbPrivateKey ? 'YES (Length: ' + fbPrivateKey.length + ')' : 'NO');
console.log('FIREBASE_SERVICE_ACCOUNT EXISTS:', process.env.FIREBASE_SERVICE_ACCOUNT ? 'YES' : 'NO');

if (process.env.FIREBASE_SERVICE_ACCOUNT || (fbProjectID && fbClientEmail && fbPrivateKey)) {
  try {
    let serviceAccount;
    
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } else {
      serviceAccount = {
        projectId: fbProjectID,
        clientEmail: fbClientEmail,
        privateKey: fbPrivateKey
      };
    }

    // 🛡️ Debug Log Stage 2: Private Key Sanitization
    // Standard fix for private key newline formatting in environment variables
    if (serviceAccount.privateKey) {
      serviceAccount.privateKey = serviceAccount.privateKey.replace(/\\n/g, '\n');
    } else if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: serviceAccount.projectId || serviceAccount.project_id,
          clientEmail: serviceAccount.clientEmail || serviceAccount.client_email,
          privateKey: serviceAccount.privateKey || serviceAccount.private_key
        })
      });
    }
    
    firebaseInitialized = true;
    console.log('✅ Firebase Admin Initialized Successfully');
    console.log('---------------------------------');
  } catch (err) {
    console.error('❌ Firebase Admin setup failed:', err.message);
  }
} else {
  console.warn('⚠️ Firebase configuration missing. Auth features will be limited.');
}

const app = express();
const PORT = process.env.PORT || 5000;

// Share the firebase initialization status across the app
app.set('firebaseInitialized', firebaseInitialized);
const { pool } = require('./models/db');

// ── Security & Cross-Origin Config ── 
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://gig-shield-website.vercel.app',
  /^https:\/\/gig-shield-.*-krushex\.vercel\.app$/
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// 🛡️ Helmet Security Headers
// Configuring CSP specifically to allow Firebase and Google Fonts to load correctly
const connectSrc = ["'self'", "https://*.firebase.io", "https://*.googleapis.com"];
if (process.env.NODE_ENV !== 'production') {
  connectSrc.push("http://127.0.0.1:5000", "http://localhost:5000");
}

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://www.google.com/recaptcha/", "https://www.gstatic.com/recaptcha/", "https://apis.google.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https://www.gstatic.com", "https://*.googleusercontent.com"],
      connectSrc: connectSrc,
      frameSrc: ["'self'", "https://www.google.com/recaptcha/", "https://recaptcha.google.com/recaptcha/"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
    },
  },
  // Explicitly allowing popups and redirects for Firebase Auth in Production Vercel
  crossOriginOpenerPolicy: { policy: "unsafe-none" }, 
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

app.use(generalLimiter);
app.set('trust proxy', 1); // Enable if behind Vercel, Cloudflare, or Nginx

/**
 * API Route Orchestration
 * Security Fix: Routers must be imported before use to avoid ReferenceErrors
 */
const ridersRouter = require('./routes/riders');
const deliveriesRouter = require('./routes/deliveries');
const payoutsRouter = require('./routes/payouts');
const publicRouter = require('./routes/public');
const pingsRouter = require('./routes/pings');

app.use('/api/riders', ridersRouter);
app.use('/api/deliveries', deliveriesRouter);
app.use('/api/payouts', payoutsRouter);
app.use('/api/public', publicRouter);
app.use('/api/pings', pingsRouter);

// Global Error Handler - catches unhandled rejections and sync errors
app.use((err, req, res, next) => {
  console.error('Global Error:', err.message);
  
  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  
  res.status(status).json({
    error: status === 500 ? 'Internal Server Error' : 'API Error',
    message: process.env.NODE_ENV === 'development' ? message : (status === 500 ? 'An unexpected error occurred.' : message),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Setup shared Redis instance
const { connectRedis } = require('./utils/redis');
connectRedis().catch(err => console.error('Redis initialization failed:', err));

// ── API Root Health-Check ──
app.get('/', (req, res) => {
  res.json({ 
    status: 'GigShield API Active', 
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'production'
  });
});

// ── Server Start ── 
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🛡️  GigShield Core active on port ${PORT}`);
  });
}

module.exports = app;
