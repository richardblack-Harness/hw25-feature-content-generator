// /pages/api/generate-template-prompt.ts
import { OpenAI } from "openai";
import type { NextApiRequest, NextApiResponse } from 'next';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const {
    name,
    description,
    featureName,
    keyBenefits,
    audience,
    isBeta,
    releaseDate,
  } = req.body;

  const systemPrompt = `
You are a helpful assistant that creates reusable AI prompt templates for content generation tools.

The user has filled out a form to describe a new feature and wants to generate content using the following context:

- Template type: ${name}
- Purpose: ${description}
${featureName ? `- Feature name: ${featureName}` : ""}
${keyBenefits ? `- Key benefits: ${keyBenefits}` : ""}
${audience ? `- Intended audience: ${audience}` : ""}
${releaseDate ? `- Expected release date: ${releaseDate}` : ""}
${isBeta ? `- Note: This feature is currently in beta.` : ""}

Write a single reusable prompt that guides an AI model to generate appropriate content based on this context. 
Do not include any headers, labels, or metadata — return only the raw prompt string itself.
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