const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

// Mocking required for API test without DB
const app = express();
app.use(express.json());
app.use(cookieParser());

// Simple mock route to test cookie-based auth middleware
const authMiddleware = (req, res, next) => {
  const token = req.cookies.gigshield_token;
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(token, 'test_secret');
    req.user = decoded;
    next();
  } catch (e) {
    res.status(401).json({ error: 'Invalid' });
  }
};

app.get('/api/test-auth', authMiddleware, (req, res) => {
  res.json({ success: true, user: req.user });
});

describe('Cookie Authentication API', () => {
  const secret = 'test_secret';
  
  it('should deny access without cookie', async () => {
    const res = await request(app).get('/api/test-auth');
    expect(res.status).toBe(401);
  });

  it('should allow access with valid token cookie', async () => {
    const token = jwt.sign({ id: 1 }, secret);
    const res = await request(app)
      .get('/api/test-auth')
      .set('Cookie', [`gigshield_token=${token}`]);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should deny access with expired or invalid token', async () => {
    const res = await request(app)
      .get('/api/test-auth')
      .set('Cookie', ['gigshield_token=invalid_token']);
    
    expect(res.status).toBe(401);
  });
});
