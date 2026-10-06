const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  // Primary: Authorization: Bearer <token>
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Fallback: ?token=<token> (for browser-native file downloads via window.open)
  if (!token && req.query.token) {
    token = req.query.token;
  }

  if (!token) return res.status(401).json({ success: false, message: 'Not authenticated' });

  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'pcas_default_secure_secret_key_2026';
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) return res.status(401).json({ success: false, message: 'User not found' });
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to ${roles.join(', ')}`,
      });
    }
    next();
  };
};

module.exports = protect;
module.exports.protect = protect;
module.exports.authorizeRole = authorizeRole;
