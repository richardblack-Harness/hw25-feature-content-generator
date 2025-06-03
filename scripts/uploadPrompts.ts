import path from 'path';
import fs from 'fs/promises';
import { storage, BUCKET_NAME } from '@/lib/storage';

const PROMPT_DIR = path.resolve(__dirname, '../prompts/default');

async function uploadPrompts() {
  try {
    const files = await fs.readdir(PROMPT_DIR);

    for (const file of files) {
      const filePath = path.join(PROMPT_DIR, file);
      const destPath = `default/${file}`;

      await storage.bucket(BUCKET_NAME).upload(filePath, {
        destination: destPath,
        contentType: 'application/json',
      });

      console.log(`✅ Uploaded: ${file} → gs://${BUCKET_NAME}/${destPath}`);
    }
  } catch (err) {
    console.error('❌ Upload failed:', err);
  }
}

uploadPrompts();