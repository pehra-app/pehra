import User from '../models/User.js';
import Vehicle from '../models/Vehicle.js';
import Alert from '../models/Alert.js';

export async function adminStats(req, res) {
  const [dealers, agents, vehicles, wanted] = await Promise.all([
    User.countDocuments({role: 'DEALER'}),
    User.countDocuments({role: 'AGENT'}),
    Vehicle.countDocuments(),
    Vehicle.countDocuments({status: 'WANTED'}),
  ]);
  res.json({dealers, agents, vehicles, wanted});
}

export async function dealerStats(req, res) {
  const filter = {dealer: req.user._id};
  const [total, clear, wanted, alerts] = await Promise.all([
    Vehicle.countDocuments(filter),
    Vehicle.countDocuments({...filter, status: 'CLEAR'}),
    Vehicle.countDocuments({...filter, status: 'WANTED'}),
    Alert.countDocuments({dealer: req.user._id}),
  ]);
  res.json({total, clear, wanted, alerts});
}
