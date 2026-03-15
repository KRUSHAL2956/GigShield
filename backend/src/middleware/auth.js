const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("JWT_SECRET environment variable is missing.");
  process.exit(1);
}

function generateToken(rider) {
  return jwt.sign(
    { id: rider.id, role: 'rider' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function generateAdminToken(admin) {
  return jwt.sign(
    { id: admin.id, role: 'admin' },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function adminMiddleware(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ error: 'Admin access required' });
  }
}

module.exports = { generateToken, generateAdminToken, authMiddleware, adminMiddleware };
