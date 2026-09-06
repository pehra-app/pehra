import User from '../models/User.js';

export async function saveDeviceToken(req, res) {
  const { fcmToken } = req.body;
  if (!fcmToken)
    return res.status(400).json({ message: 'FCM token is required.' });
  await User.findByIdAndUpdate(req.user._id, { fcmToken });
  console.log(
    `[fcm] Token saved for ${req.user.role} ${req.user._id}: ${fcmToken.slice(
      0,
      8,
    )}...`,
  );
  res.json({ message: 'Device token saved.' });
}
