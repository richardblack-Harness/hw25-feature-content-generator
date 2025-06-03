// scripts/list_bucket_files.ts
import { Storage } from '@google-cloud/storage';

const storage = new Storage({ keyFilename: './secrets/credentials.json' });
const bucketName = 'content-kings2025';
const folderPrefix = 'default/';

async function listFiles() {
  const [files] = await storage.bucket(bucketName).getFiles({ prefix: folderPrefix });
  console.log(`📂 Files in gs://${bucketName}/${folderPrefix}:`);
  files.forEach(file => console.log(`- ${file.name}`));
}

listFiles().catch(console.error);