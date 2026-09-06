import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({message: 'Authentication required.'});

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.sub).select('-passwordHash');
    if (!user || !user.isActive) return res.status(401).json({message: 'Account is unavailable.'});

    req.user = user;
    next();
  } catch {
    res.status(401).json({message: 'Invalid or expired session.'});
  }
}
