import * as dotenv from 'dotenv'
dotenv.config()

import admin from 'firebase-admin';


admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    storageBucket: 'cierusi.appspot.com'
});

export const db = admin.firestore()
export const storage = admin.storage()
