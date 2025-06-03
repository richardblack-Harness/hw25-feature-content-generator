// pages/api/generate-content.ts
import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt missing" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1", // adjust if you're limited to "gpt-4.0" or "gpt-4.1-mini"
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const text = completion.choices?.[0]?.message?.content ?? "";
    return res.status(200).json({ text });
  } catch (error: any) {
    console.error("❌ AI generation failed:", {
      name: error?.name,
      message: error?.message,
      code: error?.code,
      response: error?.response?.data ?? error?.response ?? "No response",
    });

    return res.status(500).json({ error: "AI generation failed" });
  }
}