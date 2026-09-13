import { AppRegistry } from 'react-native';
import notifee, { AndroidImportance } from '@notifee/react-native';
import {
  getMessaging,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';

setBackgroundMessageHandler(getMessaging(), async remoteMessage => {
  if (remoteMessage.notification) return;

  const title = remoteMessage.notification?.title || 'Pehra alert';
  const body = remoteMessage.notification?.body || remoteMessage.data?.message;
  if (!body) return;

  const channelId = await notifee.createChannel({
    id: 'pehra-alerts',
    name: 'Pehra alerts',
    importance: AndroidImportance.HIGH,
  });
  await notifee.displayNotification({
    title,
    body,
    data: remoteMessage.data,
    android: {
      channelId,
      pressAction: { id: 'default' },
    },
  });
});

AppRegistry.registerComponent(appName, () => App);
