import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const projectId = import.meta.env.FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
const privateKey = (import.meta.env.FIREBASE_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY)?.replace(/\\n/g, '\n');
const clientEmail = import.meta.env.FIREBASE_CLIENT_EMAIL || process.env.FIREBASE_CLIENT_EMAIL;

const serviceAccount = {
  projectId: projectId,
  privateKey: privateKey,
  clientEmail: clientEmail,
};

const activeApps = getApps();

if (!activeApps.length && projectId) {
  initializeApp({
    credential: cert(serviceAccount as any)
  });
} else if (!projectId) {
  console.warn("Firebase initialization skipped: FIREBASE_PROJECT_ID is missing.");
}

const dummyDb = {
  collection: () => ({
    doc: () => ({
      get: async () => ({ exists: false, data: () => null }),
      set: async () => {},
      delete: async () => {}
    }),
    get: async () => ({ docs: [] })
  })
};

export const db = projectId ? getFirestore() : (dummyDb as any);

