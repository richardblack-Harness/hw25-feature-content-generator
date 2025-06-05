import type { NextApiRequest, NextApiResponse } from 'next';
import { storage, bucket } from '@/lib/storage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const submission = req.body;

    if(!submission?.feature?.name) {
      return res.status(400).json({ error: 'Missing feature name in submission' });
    }

    const filePath = `teams/${submission.feature.name}` + Math.random() + `/submission.json`;
    const file = bucket.file(filePath);

    await file.save(JSON.stringify(submission, null, 2), {
      contentType: 'application/json',
    });

    return res.status(200).json({ message: 'Saved successfully', path: filePath });
  } catch (err) {
    console.error('Error saving submission:', err);
    return res.status(500).json({ error: 'Failed to save submission' });
  }
}