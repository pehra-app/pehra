import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleAuth } from 'google-auth-library';

let auth;
let credentials;

function loadCredentials() {
  if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    return {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
  }

  try {
    const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
    const filePath = path.join(
      currentDirectory,
      'firebase-service-account.json',
    );
    const serviceAccount = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.warn(
      '[fcm] Using local firebase-service-account.json credentials.',
    );
    return {
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key,
    };
  } catch {
    return null;
  }
}

export function getFirebaseAuth() {
  credentials ??= loadCredentials();
  if (
    !credentials?.projectId ||
    !credentials.clientEmail ||
    !credentials.privateKey
  )
    return null;

  if (!auth) {
    auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
      credentials: {
        project_id: credentials.projectId,
        client_email: credentials.clientEmail,
        private_key: credentials.privateKey,
      },
    });
  }

  return auth;
}

export function getFirebaseProjectId() {
  credentials ??= loadCredentials();
  return credentials?.projectId;
}
