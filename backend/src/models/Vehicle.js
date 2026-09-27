import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
  {
    customerName: { type: String, trim: true },
    customerCnic: { type: String, trim: true },
    vehicleNumber: {
      type: String,
      uppercase: true,
      trim: true,
    },
    chassisNumber: {
      type: String,
      uppercase: true,
      trim: true,
    },
    engineNumber: {
      type: String,
      uppercase: true,
      trim: true,
    },
    make: { type: String, trim: true },
    model: { type: String, trim: true },
    year: { type: Number },
    color: { type: String, trim: true },
    status: {
      type: String,
      enum: ['CLEAR', 'WANTED', 'DELETED'],
      default: 'WANTED',
    },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
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

// ✅ Partial unique indexes — ignore soft-deleted records (isDeleted: true)
vehicleSchema.index(
  { vehicleNumber: 1 },
  {
    unique: true,
    partialFilterExpression: { isDeleted: false },
    name: 'vehicleNumber_active_unique',
  },
);

vehicleSchema.index(
  { chassisNumber: 1 },
  {
    unique: true,
    partialFilterExpression: { isDeleted: false },
    name: 'chassisNumber_active_unique',
  },
);

vehicleSchema.index(
  { engineNumber: 1 },
  {
    unique: true,
    partialFilterExpression: { isDeleted: false },
    name: 'engineNumber_active_unique',
  },
);

vehicleSchema.index({ customerCnic: 1, customerName: 1, status: 1 });

// ✅ Query middleware: hide deleted records unless includeDeleted is set
vehicleSchema.pre(/^find/, async function () {
  if (!this.getOptions().includeDeleted) {
    this.where({ isDeleted: { $ne: true } });
  }
});

export default mongoose.model('Vehicle', vehicleSchema);