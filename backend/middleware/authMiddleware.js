const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Bearer <token>
  if (!token) return res.status(401).json({ msg: 'No token, access denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ msg: 'User not found' });
    next();
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // req.user = decoded; // Make sure JWT contains the user ID
    // next();
  } catch (err) {
    res.status(401).json({ msg: 'Invalid token' });
  }
};


module.exports = authMiddleware;
