// pages/api/prompts/[id].ts
import { NextApiRequest, NextApiResponse } from "next";
import { storage, bucket } from "@/lib/storage";
import { generateLatestTemplates } from "@/scripts/generateLatestTemplates";

const DEFAULT_PREFIX = "default";
const UPDATED_PREFIX = "updated";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid prompt ID" });
  }

  const updatedFile = `${UPDATED_PREFIX}/${id}.json`;
  const defaultFile = `${DEFAULT_PREFIX}/${id}.json`;

  try {
    if (req.method === "GET") {
      const fileToRead = await fileExists(updatedFile) ? updatedFile : defaultFile;
      const json = await readJson(fileToRead);
      return res.status(200).json({ id, ...json });
    }

    if (req.method === "POST") {
      const { name, description = "", prompt } = req.body;

      if (!name || !prompt) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const content = JSON.stringify({ name, description, prompt }, null, 2);

      await bucket.file(updatedFile).save(content, {
        contentType: "application/json",
      });

      await generateLatestTemplates();

      return res.status(200).json({ message: "Prompt saved", id, name, description, prompt });
    }

    if (req.method === "DELETE") {
      await bucket.file(updatedFile).delete({ ignoreNotFound: true });

      await generateLatestTemplates();

      return res.status(200).json({ message: "Prompt reverted to default" });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("Prompt API error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function readJson(filePath: string): Promise<{ name: string; description?: string; prompt: string }> {
  const file = bucket.file(filePath);
  const [contents] = await file.download();
  return JSON.parse(contents.toString("utf-8"));
}

async function fileExists(filePath: string): Promise<boolean> {
  const file = bucket.file(filePath);
  const [exists] = await file.exists();
  return exists;
}