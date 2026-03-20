const { z } = require('zod');

const { registerSchema } = require('../validations/riderSchemas');

describe('Rider Registration Validation', () => {
  it('should validate a correct payload', () => {
    const validData = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '9876543210',
      city: 'Mumbai',
      zone: 'Andheri',
      platform: 'Swiggy',
      avg_weekly_earnings: 5000,
      upi_id: 'john@okaxis',
      password: 'Password123'
    };
    expect(() => registerSchema.parse(validData)).not.toThrow();
  });

  it('should fail on invalid phone number', () => {
    const invalidData = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '12345',
      city: 'Mumbai',
      zone: 'Andheri',
      platform: 'Swiggy',
      avg_weekly_earnings: 5000
    };
    expect(() => registerSchema.parse(invalidData)).toThrow();
  });

  it('should require minimum earnings of 500', () => {
    const lowEarnings = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '9876543210',
      city: 'Mumbai',
      zone: 'Andheri',
      platform: 'Swiggy',
      avg_weekly_earnings: 100
    };
    expect(() => registerSchema.parse(lowEarnings)).toThrow();
  });
});
