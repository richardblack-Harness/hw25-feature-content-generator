// pages/api/prompts/update.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { savePromptToGCP } from "@/lib/prompts";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).end("Method Not Allowed");
  }

  const { id, prompt } = req.body;

  if (!id || !prompt) {
    return res.status(400).json({ error: "Missing id or prompt" });
  }

  try {
    await savePromptToGCP(id, prompt);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Failed to save prompt:", error);
    return res.status(500).json({ error: "Failed to save prompt" });
  }
}