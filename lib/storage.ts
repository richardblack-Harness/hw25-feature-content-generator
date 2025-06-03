import { Storage } from '@google-cloud/storage';

const base64 = process.env.GCP_SERVICE_ACCOUNT_KEY;
const bucketName = process.env.GCP_BUCKET_NAME;

if (!base64 || !bucketName) {
  throw new Error("Missing GCP credentials or bucket name");
}

const credentials = JSON.parse(
  Buffer.from(base64, 'base64').toString('utf-8')
);

const storage = new Storage({ credentials });
const bucket = storage.bucket(bucketName);

export { bucket };