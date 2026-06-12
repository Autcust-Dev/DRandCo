import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const projectId = import.meta.env.FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || import.meta.env.PUBLIC_FIREBASE_PROJECT_ID;
let rawPrivateKey = import.meta.env.FIREBASE_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY || '';

// Try parsing as JSON string if it's quoted
if (rawPrivateKey.startsWith('"') && rawPrivateKey.endsWith('"')) {
  try {
    rawPrivateKey = JSON.parse(rawPrivateKey);
  } catch (e) {
    rawPrivateKey = rawPrivateKey.slice(1, -1);
  }
}

// Replace literal '\n' strings with actual newlines
let privateKey = rawPrivateKey.replace(/\\n/g, '\n').replace(/\\r/g, '\r');

// Fix common Vercel pasting issue where newlines become spaces
if (!privateKey.includes('\n')) {
  const match = privateKey.match(/-----BEGIN PRIVATE KEY-----\s*(.*?)\s*-----END PRIVATE KEY-----/);
  if (match) {
    privateKey = `-----BEGIN PRIVATE KEY-----\n${match[1].replace(/\s+/g, '')}\n-----END PRIVATE KEY-----\n`;
  }
}

const clientEmail = import.meta.env.FIREBASE_CLIENT_EMAIL || process.env.FIREBASE_CLIENT_EMAIL;

const serviceAccount = {
  projectId: projectId,
  privateKey: privateKey,
  clientEmail: clientEmail,
};

if (!projectId || !clientEmail || !privateKey) {
  throw new Error('Firebase credentials are missing. Ensure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are set in your environment.');
}

try {
  if (!getApps().length) {
    initializeApp({
      credential: cert(serviceAccount as any)
    });
  }
} catch (error: any) {
  // If it fails to parse the key, throw a descriptive error with the key's format shape (without leaking the whole key)
  const keyPreview = {
    length: privateKey.length,
    startsWith: privateKey.substring(0, 30),
    endsWith: privateKey.substring(privateKey.length - 30),
    newlineCount: (privateKey.match(/\n/g) || []).length,
    literalBackslashNCount: (privateKey.match(/\\n/g) || []).length
  };
  throw new Error(`Firebase init failed. Key format info: ${JSON.stringify(keyPreview)}. Original error: ${error.message}`);
}

export const db = getFirestore();

