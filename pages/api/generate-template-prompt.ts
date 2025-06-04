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
  } = req.body;

  const systemPrompt = `
You are a helpful assistant that creates reusable prompt strings for AI-based content generation tools.

The template is intended to help generate content based on:
- Template name: "${name}"
- Description: "${description}"
${featureName ? `- Feature name: "${featureName}"` : ""}
${keyBenefits ? `- Key benefits: "${keyBenefits}"` : ""}
${audience ? `- Audience: "${audience}"` : ""}
${isBeta ? `- Note: This feature is currently in beta.` : ""}

Return only the reusable prompt string, with no headers or labels. The prompt should guide the AI to create engaging, relevant content based on this context.
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