import { Storage } from '@google-cloud/storage';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const credentialsPath = path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS!);

export const BUCKET_NAME = process.env.GCP_BUCKET_NAME!;
export const storage = new Storage({ keyFilename: credentialsPath });