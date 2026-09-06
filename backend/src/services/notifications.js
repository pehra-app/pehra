import axios from 'axios';
import { getFirebaseAuth, getFirebaseProjectId } from '../config/firebase.js';

export async function sendDealerPush({ token, title, body, data }) {
  const auth = getFirebaseAuth();
  const projectId = getFirebaseProjectId();
  if (!auth || !projectId || !token) {
    console.warn(
      `[fcm] Push skipped. Firebase auth: ${Boolean(
        auth,
      )}, project ID: ${Boolean(projectId)}, token: ${Boolean(token)}.`,
    );
    return false;
  }

  const client = await auth.getClient();
  const { token: accessToken } = await client.getAccessToken();
  console.log(`[fcm] Sending push "${title}" to token ${token.slice(0, 8)}...`);
  try {
    await axios.post(
      `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
      {
        message: {
          token,
          notification: { title, body },
          data,
          android: {
            priority: 'HIGH',
            notification: {
              channel_id: 'pehra-alerts',
            },
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    console.error(
      '[fcm] Firebase rejected the push:',
      error.response?.data?.error?.message || error.message,
    );
    throw error;
  }

  console.log('[fcm] Push request accepted by Firebase.');
  return true;
}
