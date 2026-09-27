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
  const includeDeleted = req.query.includeDeleted === 'true';
  const filter = {
    ...(req.query.status
      ? { status: req.query.status }
      : req.user.role !== 'ADMIN'
      ? { status: 'WANTED' }
      : {}),
    ...(req.user.role === 'DEALER' ? { dealer: req.user._id } : {}),
    ...(req.query.dealerId ? { dealer: req.query.dealerId } : {}),
  };
  const vehicles = await Vehicle.find(filter, null, { includeDeleted })
    .populate('dealer', 'name email phone')
    .sort({ createdAt: -1 });
  res.json(vehicles);
}

export async function listWantedCustomers(req, res) {
  const vehicles = await Vehicle.find({
    status: { $in: ['WANTED', 'CLEAR'] },
  })
    .populate('dealer', 'name email phone')
    .sort({ createdAt: -1 });
  res.json(vehicles);
}

export async function getVehicle(req, res) {
  const vehicle = await Vehicle.findById(req.params.id).populate(
    'dealer',
    'name email phone',
  );
  if (!vehicle || !['WANTED', 'CLEAR'].includes(vehicle.status))
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
  const customerCnic = normalize(req.query.customerCnic);
  const excludeId = req.query.excludeId;

  if (!customerCnic) {
    return res.json({ matches: [] });
  }

  const filter = {
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
    dealerId,
  } = req.body;

  const hasVehicleIdentifier = Boolean(
    vehicleNumber || chassisNumber || engineNumber,
  );
  if (!hasVehicleIdentifier) {
    return res.status(400).json({
      message:
        'At least one of vehicle number, chassis number, or engine number is required.',
    });
  }

  const normVehicleNum = vehicleNumber ? normalize(vehicleNumber) : null;
  const normChassisNum = chassisNumber ? normalize(chassisNumber) : null;
  const normEngineNum = engineNumber ? normalize(engineNumber) : null;

  if (normVehicleNum) {
    const existing = await Vehicle.findOne({
      vehicleNumber: normVehicleNum,
    });
    if (existing) {
      return res.status(409).json({
        message: `Vehicle number "${normVehicleNum}" is already registered.`,
        field: 'vehicleNumber',
      });
    }
  }

  if (normChassisNum) {
    const existing = await Vehicle.findOne({
      chassisNumber: normChassisNum,
    });
    if (existing) {
      return res.status(409).json({
        message: `Chassis number "${normChassisNum}" is already registered.`,
        field: 'chassisNumber',
      });
    }
  }

  if (normEngineNum) {
    const existing = await Vehicle.findOne({
      engineNumber: normEngineNum,
    });
    if (existing) {
      return res.status(409).json({
        message: `Engine number "${normEngineNum}" is already registered.`,
        field: 'engineNumber',
      });
    }
  }

  if (req.user.role === 'DEALER' && customerName && customerCnic) {
    const wantedCustomer = await Vehicle.findOne({
      customerName: normalize(customerName),
      customerCnic: normalize(customerCnic),
      status: { $in: ['WANTED', 'CLEAR'] },
    });
    if (wantedCustomer) {
      return res.status(409).json({
        message: 'This customer already has a wanted vehicle record.',
        isCustomerBlocked: true,
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
    dealer = req.user._id;
  }

  const payload = {
    customerName: normalize(customerName),
    customerCnic: normalize(customerCnic),
    make,
    model,
    year,
    color,
    status: 'WANTED',
    isDeleted: false,
    dealer,
    createdBy: req.user._id,
  };

  if (normVehicleNum) payload.vehicleNumber = normVehicleNum;
  if (normChassisNum) payload.chassisNumber = normChassisNum;
  if (normEngineNum) payload.engineNumber = normEngineNum;

  const vehicle = await Vehicle.create(payload);

  res.status(201).json(vehicle);
}

export async function updateVehicle(req, res) {
  const vehicle = await Vehicle.findById(req.params.id);
  if (!vehicle) return res.status(404).json({ message: 'Vehicle not found.' });
  if (vehicle.status !== 'WANTED')
    return res.status(404).json({ message: 'Vehicle not found.' });
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
      status: { $in: ['WANTED', 'CLEAR'] },
    });
    if (wantedCustomer) {
      return res.status(409).json({
        message: 'This customer already has a wanted vehicle record.',
        isCustomerBlocked: true,
      });
    }
  }

  if (req.body.vehicleNumber) {
    const normVehicleNum = normalize(req.body.vehicleNumber);
    const existing = await Vehicle.findOne({
      _id: { $ne: vehicle._id },
      vehicleNumber: normVehicleNum,
    });
    if (existing) {
      return res.status(409).json({
        message: `Vehicle number "${normVehicleNum}" is already registered.`,
        field: 'vehicleNumber',
      });
    }
    vehicle.vehicleNumber = normVehicleNum;
  }

  if (req.body.chassisNumber) {
    const normChassisNum = normalize(req.body.chassisNumber);
    const existing = await Vehicle.findOne({
      _id: { $ne: vehicle._id },
      chassisNumber: normChassisNum,
    });
    if (existing) {
      return res.status(409).json({
        message: `Chassis number "${normChassisNum}" is already registered.`,
        field: 'chassisNumber',
      });
    }
    vehicle.chassisNumber = normChassisNum;
  }

  if (req.body.engineNumber) {
    const normEngineNum = normalize(req.body.engineNumber);
    const existing = await Vehicle.findOne({
      _id: { $ne: vehicle._id },
      engineNumber: normEngineNum,
    });
    if (existing) {
      return res.status(409).json({
        message: `Engine number "${normEngineNum}" is already registered.`,
        field: 'engineNumber',
      });
    }
    vehicle.engineNumber = normEngineNum;
  }

  const fields = ['make', 'model', 'year', 'color'];
  fields.forEach(k => {
    if (req.body[k] !== undefined) vehicle[k] = req.body[k];
  });

  if (req.body.status) {
    const allowedStatuses = ['WANTED', 'CLEAR', 'DELETED'];
    if (req.body.status === 'DELETED' && req.user.role !== 'ADMIN') {
      return res
        .status(403)
        .json({ message: 'Only admins can delete records.' });
    }
    vehicle.status = allowedStatuses.includes(req.body.status)
      ? req.body.status
      : 'WANTED';
    if (vehicle.status === 'DELETED') {
      vehicle.isDeleted = true;
      vehicle.deletedAt = new Date();
      vehicle.deletedBy = req.user._id;
    }
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

  vehicle.isDeleted = true;
  vehicle.status = 'DELETED';
  vehicle.deletedAt = new Date();
  vehicle.deletedBy = req.user._id;
  await vehicle.save();
  res.json({ message: 'Vehicle marked as deleted.' });
}
