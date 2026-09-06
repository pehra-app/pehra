import { Alert } from 'react-native';
import PushNotification from 'react-native-push-notification';
import { io } from 'socket.io-client';
import api from '../api/client';
import { SOCKET_BASE_URL } from '../api/client';

let socket;
let configured = false;
let tokenHandler;

function configurePushNotifications() {
  if (configured) return;

  PushNotification.configure({
    onRegister: device => {
      if (device.token && tokenHandler) tokenHandler(device.token);
    },
    onNotification: notification => {
      console.log(
        '[notifications] Firebase notification received:',
        notification,
      );
      if (notification.foreground && notification.message) {
        PushNotification.localNotification({
          channelId: 'pehra-alerts',
          title: notification.title || 'Pehra alert',
          message: notification.message,
        });
      }
      notification.finish?.(PushNotification.FetchResult?.NoData);
    },
    requestPermissions: true,
    popInitialNotification: true,
  });

  PushNotification.createChannel(
    {
      channelId: 'pehra-alerts',
      channelName: 'Pehra alerts',
      importance: 4,
      vibrate: true,
    },
    () => {},
  );
  configured = true;
}

export async function startNotificationSession(accessToken) {
  tokenHandler = fcmToken => {
    console.log(
      `[notifications] FCM token received: ${fcmToken.slice(0, 8)}...`,
    );
    api.put('/devices/token', { fcmToken }).catch(error => {
      console.warn('Could not register the push token.', error.message);
    });
  };
  configurePushNotifications();

  socket = io(SOCKET_BASE_URL, {
    auth: { token: accessToken },
    transports: ['websocket'],
  });
  socket.on('connect', () => {
    console.log(`[notifications] Socket connected: ${socket.id}`);
  });
  socket.on('connect_error', error => {
    console.error(`[notifications] Socket connection failed: ${error.message}`);
  });
  socket.on('disconnect', reason => {
    console.warn(`[notifications] Socket disconnected: ${reason}`);
  });
  socket.on('new_alert', alert => {
    console.log('[notifications] Socket new_alert received:', alert);
    Alert.alert('Wanted vehicle located', alert.message, [{ text: 'OK' }]);
    PushNotification.localNotification({
      channelId: 'pehra-alerts',
      title: 'Pehra: Wanted vehicle located',
      message: alert.message,
      userInfo: alert,
    });
  });
}

export function stopNotificationSession() {
  socket?.disconnect();
  socket = null;
  tokenHandler = null;
}
