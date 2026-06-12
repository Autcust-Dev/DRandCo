import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const projectId = import.meta.env.FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || import.meta.env.PUBLIC_FIREBASE_PROJECT_ID;
let rawPrivateKey = import.meta.env.FIREBASE_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY;
if (rawPrivateKey && rawPrivateKey.startsWith('"') && rawPrivateKey.endsWith('"')) {
  rawPrivateKey = rawPrivateKey.slice(1, -1);
}
const privateKey = rawPrivateKey?.replace(/\\n/g, '\n');
const clientEmail = import.meta.env.FIREBASE_CLIENT_EMAIL || process.env.FIREBASE_CLIENT_EMAIL;

const serviceAccount = {
  projectId: projectId,
  privateKey: privateKey,
  clientEmail: clientEmail,
};

if (!projectId || !clientEmail || !privateKey) {
  throw new Error('Firebase credentials are missing. Ensure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are set in your environment.');
}

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount as any)
  });
}

export const db = getFirestore();

