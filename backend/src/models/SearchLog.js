import mongoose from 'mongoose';

const searchLogSchema = new mongoose.Schema(
  {
    searchedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    field: {type: String, enum: ['vehicleNumber', 'chassisNumber', 'engineNumber'], required: true},
    value: {type: String, required: true},
    vehicle: {type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle'},
    found: {type: Boolean, default: false},
    wanted: {type: Boolean, default: false},
  },
  {timestamps: true},
);

export default mongoose.model('SearchLog', searchLogSchema);
