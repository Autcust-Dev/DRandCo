import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: "2c5e22e9d3363f1b439f518d6b09c261baffd7f4",
  private_key: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : '',
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: "105112983104663358711",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40drandco-001.iam.gserviceaccount.com"
};

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function migrate() {
    console.log("Migrating home content...");
    await db.collection("site_content").doc("home").set({
        headline: "DineshReddy&Co",
        description: "Managing apps like MileMint and TorrentX with a secure, maintenance-free infrastructure."
    });

    console.log("Migrating policies...");
    const policiesDir = path.join(__dirname, '../src/content/policies');
    if (fs.existsSync(policiesDir)) {
        const files = fs.readdirSync(policiesDir);
        for (const file of files) {
            if (file.endsWith('.md')) {
                const content = fs.readFileSync(path.join(policiesDir, file), 'utf-8');
                const parsed = matter(content);
                const slug = file.replace('.md', '');
                
                await db.collection("policies").doc(slug).set({
                    title: parsed.data.title,
                    date: parsed.data.date ? parsed.data.date.toString() : new Date().toISOString(),
                    content: parsed.content,
                    slug: slug
                });
                console.log(`Migrated ${slug}`);
            }
        }
    }
    console.log("Migration complete.");
}

migrate().catch(console.error);

