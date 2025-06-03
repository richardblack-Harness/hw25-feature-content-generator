import { Storage } from "@google-cloud/storage";

let storage: Storage;

if (process.env.GCP_SERVICE_ACCOUNT_KEY) {
  const credentials = JSON.parse(
    Buffer.from(process.env.GCP_SERVICE_ACCOUNT_KEY, "base64").toString("utf-8")
  );
  storage = new Storage({ credentials });
} else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  storage = new Storage(); // will use default credentials path
} else {
  throw new Error("❌ GCP credentials not found.");
}
console.log("Using bucket:", process.env.BUCKET_NAME); // or process.env.GCP_BUCKET_NAME
export const bucket = storage.bucket(process.env.BUCKET_NAME || "");

export { storage };