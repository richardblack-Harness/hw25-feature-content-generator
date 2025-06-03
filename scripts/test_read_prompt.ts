// scripts/test_read_prompt.ts
import { Storage } from '@google-cloud/storage';
const storage = new Storage({ keyFilename: './secrets/credentials.json' });

async function run() {
  const file = storage.bucket('content-kings2025').file('default/se_handover.json');
  const [exists] = await file.exists();

  if (!exists) return console.log('❌ File does not exist');

  const [contents] = await file.download();
  console.log('✅ File contents:', contents.toString());
}

run().catch(console.error);