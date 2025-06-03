import type { NextApiRequest, NextApiResponse } from 'next';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt missing' });
  }

  try {
    const { text } = await generateText({
      model: openai('gpt-4o'),
      prompt,
    });

    res.status(200).json({ text });
  } catch (error) {
    console.error('AI generation failed:', error);
    res.status(500).json({ error: 'AI generation failed' });
  }
}