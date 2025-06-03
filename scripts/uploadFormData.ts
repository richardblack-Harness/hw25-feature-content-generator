import { v4 as uuidv4 } from 'uuid';
import { storage, BUCKET_NAME } from '@/lib/storage';

export async function uploadFormData(formData: Record<string, any>) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const id = uuidv4().slice(0, 8);
  const filename = `submissions/${timestamp}-${id}.json`;
  const contents = JSON.stringify(formData, null, 2);

  await storage.bucket(BUCKET_NAME).file(filename).save(contents, {
    contentType: 'application/json',
  });

  console.log(`✅ Uploaded to gs://${BUCKET_NAME}/${filename}`);
}

// Optional: call the function directly if running as a script
if (require.main === module) {
  uploadFormData({
    feature_title: 'Test Feature Upload',
    key_benefits: ['Easy to test', 'Cloud storage verified'],
    submitted_by: 'richard@harness.io',
  }).catch((err) => {
    console.error('❌ Upload failed:', err);
    process.exit(1);
  });
}