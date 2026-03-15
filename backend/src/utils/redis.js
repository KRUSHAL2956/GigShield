const { createClient } = require('redis');

const redisClient = createClient({
  url: process.env.REDIS_URL || process.env.KV_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('connect', () => console.log('✅ Connected to Redis'));

const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (err) {
    console.error('❌ Failed to connect to Redis:', err.message);
    throw err;
  }
};

module.exports = {
  redisClient,
  connectRedis
};
