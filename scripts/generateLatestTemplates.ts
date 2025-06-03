import { Storage } from '@google-cloud/storage';
import path from 'path';
import fs from 'fs/promises';
import { BUCKET_NAME } from '@/lib/storage';

const storage = new Storage();
const DEFAULT_PREFIX = 'default';
const UPDATED_PREFIX = 'updated';
const OUTPUT_FILE = 'latest-templates.json';

interface Template {
  id: string;
  name: string;
  description: string;
  prompt: string;
  isCustom: boolean;
}

async function readJson(filePath: string): Promise<Template> {
  const file = storage.bucket(BUCKET_NAME).file(filePath);
  const [contents] = await file.download();
  const parsed = JSON.parse(contents.toString('utf-8'));
  return parsed;
}

export async function generateLatestTemplates(): Promise<void> {
  const bucket = storage.bucket(BUCKET_NAME);
  const [defaultFiles] = await bucket.getFiles({ prefix: `${DEFAULT_PREFIX}/` });
  const [updatedFiles] = await bucket.getFiles({ prefix: `${UPDATED_PREFIX}/` });

  const defaultMap = new Map<string, Template>();
  const updatedMap = new Map<string, Template>();

  // Read and store all default templates
  for (const file of defaultFiles) {
    if (!file.name.endsWith('.json')) continue;
    const id = path.basename(file.name, '.json');
    const template = await readJson(file.name);
    defaultMap.set(id, { ...template, id, isCustom: false });
  }

  // Read and store updated templates
  for (const file of updatedFiles) {
    if (!file.name.endsWith('.json')) continue;
    const id = path.basename(file.name, '.json');
    const template = await readJson(file.name);
    const isCustom = !defaultMap.has(id); // custom if not overriding a default
    updatedMap.set(id, { ...template, id, isCustom });
  }

  // Merge logic
  const mergedTemplates: Template[] = [];

  // Add all default templates (updated if exists)
  for (const [id, defaultTemplate] of defaultMap.entries()) {
    if (updatedMap.has(id)) {
      const updated = updatedMap.get(id)!;
      mergedTemplates.push({ ...updated, id, isCustom: false }); // preserve default placement
    } else {
      mergedTemplates.push(defaultTemplate);
    }
  }

  // Add pure custom templates (only in updated folder)
  for (const [id, updatedTemplate] of updatedMap.entries()) {
    if (!defaultMap.has(id)) {
      mergedTemplates.push({ ...updatedTemplate, id, isCustom: true });
    }
  }

  // Write final merged file
  const finalPath = path.resolve('/tmp', OUTPUT_FILE);
  await fs.writeFile(finalPath, JSON.stringify(mergedTemplates, null, 2));
  await bucket.upload(finalPath, { destination: OUTPUT_FILE, contentType: 'application/json' });

  console.log(`✅ ${OUTPUT_FILE} generated and uploaded.`);
}

// For CLI execution
if (require.main === module) {
  generateLatestTemplates().catch((err) => {
    console.error('❌ Failed to generate latest templates:', err);
    process.exit(1);
  });
}