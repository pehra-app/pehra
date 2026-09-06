import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema(
  {
    dealer: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    vehicle: {type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true},
    agent: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    message: {type: String, required: true},
    read: {type: Boolean, default: false},
  },
  {timestamps: true},
);

export default mongoose.model('Alert', alertSchema);
