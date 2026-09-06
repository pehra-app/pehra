import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {type: String, required: true, trim: true},
    email: {type: String, required: true, unique: true, lowercase: true, trim: true},
    phone: {type: String, trim: true},
    passwordHash: {type: String, required: true},
    role: {type: String, enum: ['ADMIN', 'DEALER', 'AGENT'], required: true},
    isActive: {type: Boolean, default: true},
    fcmToken: {type: String, default: null},
  },
  {timestamps: true},
);

export default mongoose.model('User', userSchema);
