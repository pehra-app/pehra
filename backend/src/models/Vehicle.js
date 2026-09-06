import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
  {
    vehicleNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    chassisNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    engineNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    make: { type: String, trim: true },
    model: { type: String, trim: true },
    year: { type: Number },
    color: { type: String, trim: true },
    status: { type: String, enum: ['CLEAR', 'WANTED'], default: 'CLEAR' },
    dealer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true },
);

// vehicleSchema.index({vehicleNumber: 1});
// vehicleSchema.index({chassisNumber: 1});
// vehicleSchema.index({engineNumber: 1});

export default mongoose.model('Vehicle', vehicleSchema);
