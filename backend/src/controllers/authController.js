import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

function sign(user) {
  return jwt.sign(
    {sub: user._id.toString(), role: user.role},
    process.env.JWT_SECRET,
    {expiresIn: process.env.JWT_EXPIRES_IN || '7d'},
  );
}

export async function login(req, res) {
  const {email, password} = req.body;
  if (!email || !password) return res.status(400).json({message: 'Email and password are required.'});

  const user = await User.findOne({email: email.toLowerCase().trim()});
  if (!user || !user.isActive) return res.status(401).json({message: 'Invalid credentials.'});

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({message: 'Invalid credentials.'});

  res.json({
    token: sign(user),
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  });
}
