// scripts/test_gcp.ts
import { Storage } from '@google-cloud/storage';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const credentialsPath = path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS!);
const bucketName = process.env.GCP_BUCKET_NAME!;

const storage = new Storage({ keyFilename: credentialsPath });

async function test() {
  try {
    const [files] = await storage.bucket(bucketName).getFiles();
    console.log('✅ Success:', files.map(f => f.name));
  } catch (err) {
    console.error('❌ GCS error:', err);
  }
}

test();