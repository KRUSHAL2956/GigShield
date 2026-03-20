const rateLimit = require('express-rate-limit');

/**
 * Custom Rate Limiters for GigShield
 */

// General API Limiter: 100 requests per 15 minutes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

// Auth Limiter: 10 requests per minute for login/register
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts, please try again in a minute.' }
});

// OTP Limiter: 5 requests per 10 minutes (prevents SMS spam)
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many OTP requests. Please wait before trying again.' }
});

module.exports = {
  generalLimiter,
  authLimiter,
  otpLimiter
};
