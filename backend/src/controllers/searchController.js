import Vehicle from '../models/Vehicle.js';
import SearchLog from '../models/SearchLog.js';
import Alert from '../models/Alert.js';
import { notifyDealer } from '../services/socket.js';

const allowedFields = ['vehicleNumber', 'chassisNumber', 'engineNumber'];

export async function searchVehicle(req, res) {
  const { field, value } = req.query;
  if (!allowedFields.includes(field) || !value?.trim()) {
    return res
      .status(400)
      .json({ message: 'Valid search field and value are required.' });
  }

  const normalized = value.trim().toUpperCase();
  const vehicle = await Vehicle.findOne({ [field]: normalized }).populate(
    'dealer',
    'name email phone fcmToken',
  );

  await SearchLog.create({
    searchedBy: req.user._id,
    field,
    value: normalized,
    vehicle: vehicle?._id,
    found: Boolean(vehicle),
    wanted: vehicle?.status === 'WANTED',
  });

  if (!vehicle) {
    return res.status(404).json({ found: false, searchedValue: normalized });
  }

  if (vehicle.status === 'WANTED') {
    const message = `Vehicle ${vehicle.vehicleNumber} was located by ${req.user.name} using ${field}.`;
    const alert = await Alert.create({
      dealer: vehicle.dealer._id,
      vehicle: vehicle._id,
      agent: req.user._id,
      message,
    });
    console.log(
      `[alert] MongoDB alert ${alert._id} created for dealer ${vehicle.dealer._id} and vehicle ${vehicle._id}.`,
    );

    notifyDealer({
      dealer: vehicle.dealer,
      vehicle,
      agent: req.user,
      message,
    })
      .then(delivery => {
        console.log(
          `[alert] Alert ${alert._id} delivery completed via ${delivery}.`,
        );
      })
      .catch(err => {
        console.error(
          `[alert] Alert ${alert._id} delivery failed: ${err.message}`,
        );
      });
  }

  const safeVehicle = {
    _id: vehicle._id,
    vehicleNumber: vehicle.vehicleNumber,
    chassisNumber: vehicle.chassisNumber,
    engineNumber: vehicle.engineNumber,
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    color: vehicle.color,
    status: vehicle.status,
    dealer: {
      _id: vehicle.dealer._id,
      name: vehicle.dealer.name,
      phone: vehicle.dealer.phone,
    },
  };

  res.json({ found: true, vehicle: safeVehicle });
}
