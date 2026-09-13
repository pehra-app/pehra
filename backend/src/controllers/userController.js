import bcrypt from 'bcryptjs';
import User from '../models/User.js';

export async function listUsers(req, res) {
  const roleFilter =
    req.user.role === 'AGENT' ? ['DEALER'] : ['DEALER', 'AGENT'];
  const users = await User.find({ role: { $in: roleFilter } })
    .select('-passwordHash -fcmToken')
    .sort({ createdAt: -1 });
  res.json(users);
}

export async function createUser(req, res) {
  const { name, email, phone, password, role } = req.body;
  if (!name || !email || !password || !['DEALER', 'AGENT'].includes(role)) {
    return res
      .status(400)
      .json({
        message: 'Name, email, password and Dealer/Agent role are required.',
      });
  }

  const exists = await User.exists({ email: email.toLowerCase().trim() });
  if (exists) return res.status(409).json({ message: 'Email already exists.' });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    name,
    email: email.toLowerCase().trim(),
    phone,
    passwordHash,
    role,
  });

  res
    .status(201)
    .json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    });
}

export async function setUserStatus(req, res) {
  const user = await User.findOne({
    _id: req.params.id,
    role: { $in: ['DEALER', 'AGENT'] },
  });
  if (!user) return res.status(404).json({ message: 'User not found.' });
  user.isActive = Boolean(req.body.isActive);
  await user.save();
  res.json({ message: 'Account status updated.', isActive: user.isActive });
}

export async function resetPassword(req, res) {
  const { password } = req.body;
  if (!password || password.length < 8)
    return res
      .status(400)
      .json({ message: 'Password must be at least 8 characters.' });
  const user = await User.findOne({
    _id: req.params.id,
    role: { $in: ['DEALER', 'AGENT'] },
  });
  if (!user) return res.status(404).json({ message: 'User not found.' });
  user.passwordHash = await bcrypt.hash(password, 12);
  await user.save();
  res.json({ message: 'Password reset.' });
}
