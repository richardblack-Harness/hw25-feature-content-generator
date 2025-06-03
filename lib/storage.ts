import { Storage } from "@google-cloud/storage";
import dotenv from "dotenv";

// Load .env.local for local dev
dotenv.config({ path: '.env.local' });

let storage: Storage;

if (process.env.GCP_SERVICE_ACCOUNT_KEY) {
  try {
    const decoded = Buffer.from(process.env.GCP_SERVICE_ACCOUNT_KEY, "base64").toString("utf-8");
    const credentials = JSON.parse(decoded);
    storage = new Storage({ credentials });
  } catch (err) {
    throw new Error("❌ Failed to parse GCP_SERVICE_ACCOUNT_KEY. Ensure it is base64-encoded JSON.");
  }
} else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  storage = new Storage(); // Will use default credentials path
} else {
  throw new Error("❌ GCP credentials not found. Set GCP_SERVICE_ACCOUNT_KEY or GOOGLE_APPLICATION_CREDENTIALS.");
}

export const bucket = storage.bucket(process.env.BUCKET_NAME || "");

console.log("✅ Storage initialized with bucket:", bucket.name);

export { storage };