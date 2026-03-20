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

// We initialize Firebase Admin using a service account JSON string stored in env.
// This allows the backend to verify Firebase auth tokens and manage users.
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    // Standard fix for private key newline formatting in environment variables
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    firebaseInitialized = true;
    console.log('✅ Firebase Admin ready');
  } catch (err) {
    console.error('❌ Firebase Admin setup failed:', err);
  }
} else {
  console.warn('⚠️ FIREBASE_SERVICE_ACCOUNT missing. Auth features will be limited.');
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
  'http://frontend:3000',
  /^https:\/\/gig-shield-.*-krushex\.vercel\.app$/, // Tight regex for project preview URLs
  'https://gig-shield-website.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server or local requests with no origin
    if (!origin) return callback(null, true);
    
    // Check if the requesting origin matches our whitelist or Vercel patterns
    const isAllowed = allowedOrigins.some(pattern => 
      pattern instanceof RegExp ? pattern.test(origin) : pattern === origin
    );

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('CORS Policy: Origin not allowed'));
    }
  },
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
  // In dev, we relax COOP and CEEP to allow easier debugging
  crossOriginOpenerPolicy: process.env.NODE_ENV === 'production' ? { policy: "same-origin" } : false,
  crossOriginEmbedderPolicy: process.env.NODE_ENV === 'production' ? { policy: "require-corp" } : false,
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

// ── Server Start ── 
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🛡️  GigShield Core active on port ${PORT}`);
  });
}

module.exports = app;
