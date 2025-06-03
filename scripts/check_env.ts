import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

console.log("GOOGLE_APPLICATION_CREDENTIALS:", process.env.GOOGLE_APPLICATION_CREDENTIALS);
console.log("GCP_BUCKET_NAME:", process.env.GCP_BUCKET_NAME);