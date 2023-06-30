import * as dotenv from 'dotenv';
import admin from 'firebase-admin';

dotenv.config();

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  storageBucket: 'cierusi.appspot.com'
});

export const db = admin.firestore();
export const storage = admin.storage();
