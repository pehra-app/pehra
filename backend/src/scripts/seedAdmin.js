import 'dotenv/config';
import bcrypt from 'bcryptjs';
import {connectDB} from '../config/db.js';
import User from '../models/User.js';

await connectDB();

const name = process.env.SEED_ADMIN_NAME || 'Pehra Admin';
const email = (process.env.SEED_ADMIN_EMAIL || 'admin@pehra.local').toLowerCase();
const password = process.env.SEED_ADMIN_PASSWORD || 'Admin123!';

const existing = await User.findOne({email});
if (existing) {
  console.log('Admin already exists:', email);
  process.exit(0);
}

const passwordHash = await bcrypt.hash(password, 12);
await User.create({name, email, passwordHash, role: 'ADMIN', isActive: true});

console.log('Admin created:', email);
process.exit(0);
