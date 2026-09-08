# Pehra — React Native MVP

Pehra is a lightweight sample React Native app with one mobile application for three roles:

- Admin: creates Dealer/Agent accounts and has full mobile access.
- Dealer: adds, edits and deletes vehicle records.
- Agent: searches by Vehicle Number, Chassis Number or Engine Number only.
- When an Agent finds a vehicle marked `WANTED`, the Dealer who created it receives an FCM push alert.

This starter intentionally excludes the heavier features from the larger reference document:
OCR, payment/installment tracking, investigations, location tracking, live maps, offline sync, CNIC documents, PDF verification sheets, and web admin.

## 1. Create the React Native shell

```bash
npx @react-native-community/cli@latest init Pehra
cd Pehra
```

Copy the contents of the `mobile-overlay` folder in this starter over the generated React Native project.

## 2. Install mobile packages

```bash
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
npm install axios @react-native-async-storage/async-storage
npm install react-native-vector-icons
npm install react-native-push-notification socket.io-client
npx pod-install ios
```

## 3. Firebase mobile setup

Android:

1. Create a Firebase project.
2. Add Android app with your package name.
3. Download `google-services.json`.
4. Put it in `android/app/google-services.json`.
5. Configure `react-native-push-notification` for Android 13 notification permission and FCM.

iOS:

1. Add an iOS app in Firebase.
2. Download `GoogleService-Info.plist`.
3. Add it to the Xcode project target.
4. Enable Push Notifications and Background Modes > Remote notifications.
5. Run `npx pod-install ios`.

## 4. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run seed:admin
npm run dev
```

MongoDB may be local or MongoDB Atlas.

### Deploy backend to Railway

1. Create a new Railway project and deploy this repository.
2. Set the service Root Directory to `/backend`. If you leave the Root Directory
   at `/`, the repository-root `railway.json` still builds and starts only the
   backend.
3. Add the variables below in the Railway service Variables tab. Do not upload
   `.env` or the Firebase service-account file.

```env
MONGODB_URI=<your MongoDB Atlas connection string>
JWT_SECRET=<long random secret>
JWT_EXPIRES_IN=7d
FIREBASE_PROJECT_ID=<Firebase project id>
FIREBASE_CLIENT_EMAIL=<Firebase service account email>
FIREBASE_PRIVATE_KEY=<private key with \n for line breaks>
```

Railway supplies `PORT` automatically. The included `backend/railway.json`
installs with `npm ci`, starts with `npm start`, and uses `/api/health` as the
health check. After deployment, use the generated Railway domain as the API
base URL, ending in `/api`.

### Example local backend URL

Android emulator:
`http://10.0.2.2:5000/api`

iOS simulator:
`http://localhost:5000/api`

Physical phone:
Use your Mac/PC LAN IP, for example `http://192.168.1.10:5000/api`.

Set the mobile URL in:
`src/api/client.js`

Set the backend FCM HTTP v1 credentials in `backend/.env`. The service account needs
permission to send Firebase Cloud Messaging messages. The backend uses the raw FCM
HTTP v1 API; the mobile app does not install the Firebase JavaScript SDK. Native
Android/iOS push services are still required to receive background messages.

Foreground dealer sessions use Socket.IO. When the dealer socket is not connected,
the backend falls back to FCM. The dealer token is registered automatically after login.

## 5. Seed Admin

Set these in `backend/.env`:

```env
SEED_ADMIN_NAME=Pehra Admin
SEED_ADMIN_EMAIL=admin@pehra.local
SEED_ADMIN_PASSWORD=Admin123!
```

Then:

```bash
npm run seed:admin
```

## 6. Run

Backend:

```bash
cd backend
npm run dev
```

Android:

```bash
npx react-native run-android
```

iOS:

```bash
npx react-native run-ios
```

## MVP test flow

1. Login as seeded Admin.
2. Create one Dealer and one Agent.
3. Logout and login as Dealer.
4. Add a vehicle and set its status to `WANTED`.
5. Logout and login as Agent.
6. Search that vehicle by vehicle/chassis/engine number.
7. The search result should be red/WANTED.
8. Backend creates an alert and attempts FCM push to the Dealer.
9. Login as Dealer and open Alerts to see the stored alert even if Firebase is not configured yet.

## Security notes

This is an MVP starter, not a production security certification. Before production:

- move secrets to a proper secret manager,
- add rate limiting,
- add audit retention rules,
- validate all fields more strictly,
- add refresh tokens / session revocation,
- configure HTTPS only,
- review privacy requirements for vehicle and user data,
- do not store Firebase private keys in Git.
