import Vehicle from '../models/Vehicle.js';
import User from '../models/User.js';

const normalize = value => String(value || '').trim().toUpperCase();

function canModify(reqUser, vehicle) {
  return reqUser.role === 'ADMIN' || vehicle.dealer.toString() === reqUser._id.toString();
}

export async function listVehicles(req, res) {
  const filter = req.user.role === 'DEALER' ? {dealer: req.user._id} : {};
  const vehicles = await Vehicle.find(filter).populate('dealer', 'name email phone').sort({createdAt: -1});
  res.json(vehicles);
}

export async function getVehicle(req, res) {
  const vehicle = await Vehicle.findById(req.params.id).populate('dealer', 'name email phone');
  if (!vehicle) return res.status(404).json({message: 'Vehicle not found.'});

  if (req.user.role === 'DEALER' && vehicle.dealer._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({message: 'Not allowed.'});
  }

  res.json(vehicle);
}

export async function createVehicle(req, res) {
  const {
    vehicleNumber, chassisNumber, engineNumber,
    make, model, year, color, status = 'CLEAR', dealerId,
  } = req.body;

  if (!vehicleNumber || !chassisNumber || !engineNumber) {
    return res.status(400).json({message: 'Vehicle, chassis and engine numbers are required.'});
  }

  let dealer = req.user._id;
  if (req.user.role === 'ADMIN' && dealerId) {
    const target = await User.findOne({_id: dealerId, role: 'DEALER', isActive: true});
    if (!target) return res.status(400).json({message: 'Valid Dealer is required.'});
    dealer = target._id;
  } else if (req.user.role === 'ADMIN' && !dealerId) {
    // Sample behavior: admin-created record can be owned by admin, since Admin has full access.
    dealer = req.user._id;
  }

  const vehicle = await Vehicle.create({
    vehicleNumber: normalize(vehicleNumber),
    chassisNumber: normalize(chassisNumber),
    engineNumber: normalize(engineNumber),
    make, model, year, color,
    status: status === 'WANTED' ? 'WANTED' : 'CLEAR',
    dealer,
    createdBy: req.user._id,
  });

  res.status(201).json(vehicle);
}

export async function updateVehicle(req, res) {
  const vehicle = await Vehicle.findById(req.params.id);
  if (!vehicle) return res.status(404).json({message: 'Vehicle not found.'});
  if (!canModify(req.user, vehicle)) return res.status(403).json({message: 'Not allowed.'});

  const fields = ['make', 'model', 'year', 'color'];
  fields.forEach(k => {
    if (req.body[k] !== undefined) vehicle[k] = req.body[k];
  });
  if (req.body.vehicleNumber) vehicle.vehicleNumber = normalize(req.body.vehicleNumber);
  if (req.body.chassisNumber) vehicle.chassisNumber = normalize(req.body.chassisNumber);
  if (req.body.engineNumber) vehicle.engineNumber = normalize(req.body.engineNumber);
  if (req.body.status) vehicle.status = req.body.status === 'WANTED' ? 'WANTED' : 'CLEAR';

  await vehicle.save();
  res.json(vehicle);
}

export async function deleteVehicle(req, res) {
  const vehicle = await Vehicle.findById(req.params.id);
  if (!vehicle) return res.status(404).json({message: 'Vehicle not found.'});
  if (!canModify(req.user, vehicle)) return res.status(403).json({message: 'Not allowed.'});
  await vehicle.deleteOne();
  res.json({message: 'Vehicle deleted.'});
}
