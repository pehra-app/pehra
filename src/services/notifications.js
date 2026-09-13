import { Alert } from 'react-native';
import notifee, { AndroidImportance } from '@notifee/react-native';
import {
  getMessaging,
  getToken,
  onMessage,
  registerDeviceForRemoteMessages,
} from '@react-native-firebase/messaging';
import { io } from 'socket.io-client';
import api from '../api/client';
import { SOCKET_BASE_URL } from '../api/client';

let socket;
let configured = false;
let unsubscribeMessage;

async function displayNotification(title, body, data) {
  await notifee.displayNotification({
    title,
    body,
    data,
    android: {
      channelId: 'pehra-alerts',
      pressAction: { id: 'default' },
    },
  });
}

async function configurePushNotifications() {
  if (configured) return;

  await notifee.requestPermission();
  await notifee.createChannel({
    id: 'pehra-alerts',
    name: 'Pehra alerts',
    importance: AndroidImportance.HIGH,
  });
  configured = true;
}

export async function startNotificationSession(accessToken) {
  const messagingInstance = getMessaging();
  await configurePushNotifications();
  await registerDeviceForRemoteMessages(messagingInstance);
  const fcmToken = await getToken(messagingInstance);
  console.log(`[notifications] FCM token received: ${fcmToken.slice(0, 8)}...`);
  api.put('/devices/token', { fcmToken }).catch(error => {
    console.warn('Could not register the push token.', error.message);
  });

  unsubscribeMessage = onMessage(messagingInstance, async remoteMessage => {
    const title = remoteMessage.notification?.title || 'Pehra alert';
    const body =
      remoteMessage.notification?.body || remoteMessage.data?.message;
    if (body) await displayNotification(title, body, remoteMessage.data);
  });

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
    displayNotification('Pehra: Wanted vehicle located', alert.message, alert);
  });
}

export function stopNotificationSession() {
  unsubscribeMessage?.();
  unsubscribeMessage = null;
  socket?.disconnect();
  socket = null;
}
