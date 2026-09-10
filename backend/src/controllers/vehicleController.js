import Vehicle from '../models/Vehicle.js';
import User from '../models/User.js';

const normalize = value =>
  String(value || '')
    .trim()
    .toUpperCase();

const customerProjection = {
  customerName: 1,
  customerCnic: 1,
  vehicleNumber: 1,
  chassisNumber: 1,
  engineNumber: 1,
  make: 1,
  model: 1,
  status: 1,
  dealer: 1,
};

function canModify(reqUser, vehicle) {
  return (
    reqUser.role === 'ADMIN' ||
    vehicle.dealer.toString() === reqUser._id.toString()
  );
}

export async function listVehicles(req, res) {
  const filter = {
    ...(req.user.role === 'ADMIN' && req.query.includeDeleted === 'true'
      ? {}
      : { status: { $ne: 'DELETED' } }),
    ...(req.user.role === 'DEALER' ? { dealer: req.user._id } : {}),
  };
  const vehicles = await Vehicle.find(filter)
    .populate('dealer', 'name email phone')
    .sort({ createdAt: -1 });
  res.json(vehicles);
}

export async function getVehicle(req, res) {
  const vehicle = await Vehicle.findById(req.params.id).populate(
    'dealer',
    'name email phone',
  );
  if (!vehicle || vehicle.status === 'DELETED')
    return res.status(404).json({ message: 'Vehicle not found.' });

  if (
    req.user.role === 'DEALER' &&
    vehicle.dealer._id.toString() !== req.user._id.toString()
  ) {
    return res.status(403).json({ message: 'Not allowed.' });
  }

  res.json(vehicle);
}

export async function findCustomerMatches(req, res) {
  const customerName = normalize(req.query.customerName);
  const customerCnic = normalize(req.query.customerCnic);
  const excludeId = req.query.excludeId;

  if (!customerName || !customerCnic) {
    return res.json({ matches: [] });
  }

  const filter = {
    customerName,
    customerCnic,
    status: 'WANTED',
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  };
  const matches = await Vehicle.find(filter, customerProjection)
    .populate('dealer', 'name phone')
    .sort({ createdAt: -1 });

  res.json({ matches });
}

export async function createVehicle(req, res) {
  const {
    customerName,
    customerCnic,
    vehicleNumber,
    chassisNumber,
    engineNumber,
    make,
    model,
    year,
    color,
    status = 'CLEAR',
    dealerId,
  } = req.body;

  if (
    !customerName ||
    !customerCnic ||
    !vehicleNumber ||
    !chassisNumber ||
    !engineNumber
  ) {
    return res.status(400).json({
      message:
        'Customer name, CNIC, vehicle, chassis and engine numbers are required.',
    });
  }

  if (req.user.role === 'DEALER') {
    const wantedCustomer = await Vehicle.findOne({
      customerName: normalize(customerName),
      customerCnic: normalize(customerCnic),
      status: 'WANTED',
    });
    if (wantedCustomer) {
      return res.status(409).json({
        message: 'This customer already has a wanted vehicle record.',
      });
    }
  }

  let dealer = req.user._id;
  if (req.user.role === 'ADMIN' && dealerId) {
    const target = await User.findOne({
      _id: dealerId,
      role: 'DEALER',
      isActive: true,
    });
    if (!target)
      return res.status(400).json({ message: 'Valid Dealer is required.' });
    dealer = target._id;
  } else if (req.user.role === 'ADMIN' && !dealerId) {
    // Sample behavior: admin-created record can be owned by admin, since Admin has full access.
    dealer = req.user._id;
  }

  const vehicle = await Vehicle.create({
    customerName: normalize(customerName),
    customerCnic: normalize(customerCnic),
    vehicleNumber: normalize(vehicleNumber),
    chassisNumber: normalize(chassisNumber),
    engineNumber: normalize(engineNumber),
    make,
    model,
    year,
    color,
    status: status === 'WANTED' ? 'WANTED' : 'CLEAR',
    dealer,
    createdBy: req.user._id,
  });

  res.status(201).json(vehicle);
}

export async function updateVehicle(req, res) {
  const vehicle = await Vehicle.findById(req.params.id);
  if (!vehicle) return res.status(404).json({ message: 'Vehicle not found.' });
  if (!canModify(req.user, vehicle))
    return res.status(403).json({ message: 'Not allowed.' });

  if (
    req.user.role === 'DEALER' &&
    (req.body.customerName !== undefined || req.body.customerCnic !== undefined)
  ) {
    const customerName = normalize(
      req.body.customerName ?? vehicle.customerName,
    );
    const customerCnic = normalize(
      req.body.customerCnic ?? vehicle.customerCnic,
    );
    const wantedCustomer = await Vehicle.findOne({
      _id: { $ne: vehicle._id },
      customerName,
      customerCnic,
      status: 'WANTED',
    });
    if (wantedCustomer) {
      return res.status(409).json({
        message: 'This customer already has a wanted vehicle record.',
      });
    }
  }

  const fields = ['make', 'model', 'year', 'color'];
  fields.forEach(k => {
    if (req.body[k] !== undefined) vehicle[k] = req.body[k];
  });
  if (req.body.vehicleNumber)
    vehicle.vehicleNumber = normalize(req.body.vehicleNumber);
  if (req.body.chassisNumber)
    vehicle.chassisNumber = normalize(req.body.chassisNumber);
  if (req.body.engineNumber)
    vehicle.engineNumber = normalize(req.body.engineNumber);
  if (req.body.status) {
    if (req.body.status === 'DELETED' && req.user.role !== 'ADMIN') {
      return res
        .status(403)
        .json({ message: 'Only admins can delete records.' });
    }
    vehicle.status = ['CLEAR', 'WANTED', 'DELETED'].includes(req.body.status)
      ? req.body.status
      : 'CLEAR';
  }
  if (req.body.customerName !== undefined)
    vehicle.customerName = normalize(req.body.customerName);
  if (req.body.customerCnic !== undefined)
    vehicle.customerCnic = normalize(req.body.customerCnic);

  await vehicle.save();
  res.json(vehicle);
}

export async function deleteVehicle(req, res) {
  const vehicle = await Vehicle.findById(req.params.id);
  if (!vehicle) return res.status(404).json({ message: 'Vehicle not found.' });
  if (!canModify(req.user, vehicle))
    return res.status(403).json({ message: 'Not allowed.' });
  vehicle.status = 'DELETED';
  await vehicle.save();
  res.json({ message: 'Vehicle marked as deleted.' });
}
