const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');

dotenv.config();
console.log('DEBUG: Environment Variables Loaded');
console.log('DEBUG: DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('DEBUG: JWT_SECRET exists:', !!process.env.JWT_SECRET);

const ridersRouter = require('./routes/riders');
const deliveriesRouter = require('./routes/deliveries');
const payoutsRouter = require('./routes/payouts');
const publicRouter = require('./routes/public');
const { pool } = require('./models/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.set('trust proxy', 1); // Required for Vercel/Render proxying

// Home route
app.get('/', (req, res) => {
  res.json({ 
    status: 'online', 
    message: 'GigShield API is running', 
    timestamp: new Date().toISOString() 
  });
});

const allowedOrigins = [
  'http://localhost:3000',
  'http://frontend:3000',
  /\.vercel\.app$/, // Allow all Vercel subdomains
  'https://gig-shield-website.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(pattern => 
      typeof pattern === 'string' ? pattern === origin : pattern.test(origin)
    )) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', async (req, res) => {
  try {
    const dbResult = await pool.query('SELECT NOW()');
    let redisStatus = 'not_connected';
    
    try {
      const { redisClient } = require('./utils/redis');
      if (redisClient.isOpen) {
        await redisClient.ping();
        redisStatus = 'connected';
      }
    } catch (rErr) {
      console.error('Redis health check failed:', rErr);
    }

    res.json({
      status: 'healthy',
      service: 'gigshield-backend',
      database: 'connected',
      redis: redisStatus,
      timestamp: dbResult.rows[0].now,
      uptime: process.uptime()
    });
  } catch (err) {
    console.error('Health check failed:', err);
    res.status(500).json({
      status: 'unhealthy',
      error: 'internal server error'
    });
  }
});

// Routes
app.use('/api/riders', ridersRouter);
app.use('/api/deliveries', deliveriesRouter);
app.use('/api/payouts', payoutsRouter);
app.use('/api/public', publicRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Initialize Redis connection
const { connectRedis } = require('./utils/redis');
connectRedis().catch(err => console.error('Redis startup connection failed:', err));

// VERCEL Support: Export the app instead of listening if not in standalone mode
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🛡️  GigShield Backend running on port ${PORT}`);
  });
}

module.exports = app;
