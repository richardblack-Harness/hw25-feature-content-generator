// /pages/api/generate-template-prompt.ts
import { OpenAI } from "openai";
import type { NextApiRequest, NextApiResponse } from 'next';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { name, description } = req.body;
  const systemPrompt = `
You are a helpful assistant that creates prompt templates for AI-based content generation tools.

Generate a reusable prompt string based on the following:
- Template name: "${name}"
- Description: "${description}"

The prompt should include instructions for the AI to generate useful content of that type, define tone/style if applicable, and guide structure if helpful.
  `.trim();

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Create the prompt template now.` },
      ],
    });

    const prompt = completion.choices[0]?.message?.content ?? "";
    return res.status(200).json({ prompt });
  } catch (error) {
    console.error("Error generating template prompt:", error);
    return res.status(500).json({ error: "Failed to generate prompt" });
  }
}