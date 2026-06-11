import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const projectId = import.meta.env.FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
const privateKey = (import.meta.env.FIREBASE_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY)?.replace(/\\n/g, '\n');
const clientEmail = import.meta.env.FIREBASE_CLIENT_EMAIL || process.env.FIREBASE_CLIENT_EMAIL;

const serviceAccount = {
  type: "service_account",
  project_id: projectId,
  private_key_id: "2c5e22e9d3363f1b439f518d6b09c261baffd7f4",
  private_key: privateKey,
  client_email: clientEmail,
  client_id: "105112983104663358711",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40drandco-001.iam.gserviceaccount.com"
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

