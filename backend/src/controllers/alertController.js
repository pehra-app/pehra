import Alert from '../models/Alert.js';

export async function listAlerts(req, res) {
  const filter = req.user.role === 'DEALER' ? { dealer: req.user._id } : {};
  const alerts = await Alert.find(filter)
    .populate('vehicle', 'vehicleNumber chassisNumber engineNumber status')
    .populate('agent', 'name')
    .sort({ createdAt: -1 })
    .limit(100);
  res.json(alerts);
}

export async function deleteAlert(req, res) {
  const filter = { _id: req.params.id };
  if (req.user.role === 'DEALER') filter.dealer = req.user._id;

  const alert = await Alert.findOne(filter);
  if (!alert) return res.status(404).json({ message: 'Alert not found.' });

  await alert.deleteOne();
  res.json({ message: 'Alert deleted.' });
}
