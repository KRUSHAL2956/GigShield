const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number'),
  city: z.enum(['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Pune', 'Hyderabad']),
  zone: z.string().min(2).max(100),
  platform: z.enum(['Swiggy', 'Zomato']),
  avg_weekly_earnings: z.number().min(500).max(20000),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(100)
    .optional(),
  firebase_uid: z.string().min(1).max(128).optional()
});

const loginSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/),
  password: z.string().optional(),
  otp: z.string().length(6).optional()
});

module.exports = {
  registerSchema,
  loginSchema
};
