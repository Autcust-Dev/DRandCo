import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = {
  type: "service_account",
  project_id: import.meta.env.FIREBASE_PROJECT_ID,
  private_key_id: "2c5e22e9d3363f1b439f518d6b09c261baffd7f4",
  private_key: import.meta.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: import.meta.env.FIREBASE_CLIENT_EMAIL,
  client_id: "105112983104663358711",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40drandco-001.iam.gserviceaccount.com"
};

const activeApps = getApps();

if (!activeApps.length) {
  initializeApp({
    credential: cert(serviceAccount as any)
  });
}

export const db = getFirestore();

