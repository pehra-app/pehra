import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import User from '../models/User.js';
import { sendDealerPush } from './notifications.js';

let io;

export function attachSocketServer(httpServer) {
  io = new Server(httpServer, { cors: { origin: '*' } });
  console.log('[socket] Socket.IO server attached.');

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      console.log(
        `[socket] Authenticating connection ${
          socket.id
        }. Token present: ${Boolean(token)}`,
      );
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.sub).select('_id role isActive');
      if (!user) {
        console.error(
          `[socket] Authentication failed for ${socket.id}: account ${decoded.sub} was not found.`,
        );
        return next(new Error('Unauthorized socket connection.'));
      }
      if (!user.isActive) {
        console.error(
          `[socket] Authentication failed for ${socket.id}: account ${user._id} is inactive.`,
        );
        return next(new Error('Unauthorized socket connection.'));
      }
      socket.user = user;
      console.log(
        `[socket] Authenticated ${socket.id} as ${user.role} ${user._id}.`,
      );
      next();
    } catch (error) {
      console.error(
        `[socket] Authentication failed for ${socket.id}: ${error.message}`,
      );
      next(new Error('Unauthorized socket connection.'));
    }
  });

  io.on('connection', socket => {
    const room = `user:${socket.user._id}`;
    socket.join(room);
    console.log(`[socket] ${socket.id} joined ${room}.`);
    socket.on('disconnect', reason => {
      console.log(`[socket] ${socket.id} disconnected: ${reason}.`);
    });
  });

  return io;
}

export async function notifyDealer({ dealer, vehicle, agent, message }) {
  const payload = {
    type: 'WANTED_VEHICLE_FOUND',
    message,
    vehicleId: vehicle._id.toString(),
    agentId: agent._id.toString(),
  };
  const room = `user:${dealer._id}`;
  const connectedSockets = io?.sockets.adapter.rooms.get(room)?.size || 0;
  console.log(
    `[alert] Delivering ${payload.type} for vehicle ${payload.vehicleId} to dealer ${dealer._id}. ` +
      `Socket room ${room}: ${connectedSockets} client(s). FCM token present: ${Boolean(
        dealer.fcmToken,
      )}.`,
  );

  if (connectedSockets) {
    io.to(room).emit('new_alert', payload);
    console.log(`[alert] Socket new_alert emitted to ${room}.`);
    return 'socket';
  }

  try {
    const sent = await sendDealerPush({
      token: dealer.fcmToken,
      title: 'Pehra: Wanted vehicle located',
      body: message,
      data: {
        type: payload.type,
        vehicleId: payload.vehicleId,
        agentId: payload.agentId,
      },
    });
    console.log(
      `[alert] FCM delivery result for dealer ${dealer._id}: ${
        sent ? 'sent' : 'skipped'
      }.`,
    );
  } catch (error) {
    console.error(
      `[alert] FCM delivery failed for dealer ${dealer._id}: ${error.message}`,
    );
    throw error;
  }
  return 'fcm';
}
