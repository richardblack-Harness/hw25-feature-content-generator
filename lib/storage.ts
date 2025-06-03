import { Storage } from '@google-cloud/storage';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load .env.github if present and not in GitHub Actions
if (!process.env.GITHUB_ACTIONS) {
  dotenv.config({ path: '.env.github' });
}

export const BUCKET_NAME = process.env.GCP_BUCKET_NAME!;

let storage: Storage;

if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
  const credentialsPath = path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS);
  storage = new Storage({ keyFilename: credentialsPath });
} else if (process.env.GCP_SERVICE_ACCOUNT_KEY) {
  const credentials = JSON.parse(process.env.GCP_SERVICE_ACCOUNT_KEY);
  storage = new Storage({ credentials });
} else {
  throw new Error("❌ GCP credentials not found. Set either GOOGLE_APPLICATION_CREDENTIALS or GCP_SERVICE_ACCOUNT_KEY.");
}

console.log("ENV:", {
    GCP_KEY_PRESENT: !!process.env.GCP_SERVICE_ACCOUNT_KEY,
    BUCKET_NAME: process.env.GCP_BUCKET_NAME,
  });

export { storage };