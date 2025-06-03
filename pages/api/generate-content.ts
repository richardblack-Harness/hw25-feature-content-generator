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
    let response;
    try {
      // Try GPT-4o first
      response = await generateText({
        model: openai('gpt-4.1'),
        prompt,
      });
    } catch (err) {
      if (
        err instanceof Error &&
        err.message.includes('does not have access to model')
      ) {
        // Fallback to GPT-3.5 if GPT-4o fails
        console.warn('Falling back to gpt-3.5-turbo...');
        response = await generateText({
          model: openai('gpt-3.5-turbo'),
          prompt,
        });
      } else {
        throw err; // rethrow other errors
      }
    }

    res.status(200).json({ text: response.text });
  } catch (error) {
    console.error('AI generation failed:', error);
    res.status(500).json({ error: 'AI generation failed' });
  }
}