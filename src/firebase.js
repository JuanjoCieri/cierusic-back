import * as dotenv from 'dotenv';
import admin from 'firebase-admin';

dotenv.config();

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_CONFIG)),
  storageBucket: 'cierusi.appspot.com'
});

export const db = admin.firestore();
export const storage = admin.storage();
