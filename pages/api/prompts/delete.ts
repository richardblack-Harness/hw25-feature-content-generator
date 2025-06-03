// pages/api/prompts/delete.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { deleteUpdatedPrompt } from "@/lib/prompts";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).end("Method Not Allowed");
  }

  const { id } = req.query;

  if (typeof id !== "string") {
    return res.status(400).json({ error: "Invalid prompt ID" });
  }

  try {
    await deleteUpdatedPrompt(id);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Failed to delete prompt:", error);
    return res.status(500).json({ error: "Failed to delete prompt" });
  }
}