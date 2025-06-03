import { NextApiRequest, NextApiResponse } from "next";
import { storage, bucket } from "@/lib/storage";

const DEFAULT_PREFIX = "default";
const UPDATED_PREFIX = "updated";
const LATEST_TEMPLATES_FILE = "latest-templates.json";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // ✅ Try using precompiled latest-templates.json
    const latestFile = bucket.file(LATEST_TEMPLATES_FILE);
    const [exists] = await latestFile.exists();

    if (exists) {
      console.log("✅ Using latest-templates.json");
      const [contents] = await latestFile.download();
      const templates = JSON.parse(contents.toString("utf-8"));
      return res.status(200).json(templates);
    }

    console.log("⚠️ Falling back to runtime file merge...");

    // ❌ Fallback: runtime merge of default + updated
    const [defaultFiles] = await bucket.getFiles({ prefix: DEFAULT_PREFIX });
    const [updatedFiles] = await bucket.getFiles({ prefix: UPDATED_PREFIX });

    const mergedMap: Record<string, any> = {};

    // Prioritize updated files
    for (const file of updatedFiles) {
      const id = extractId(file.name, UPDATED_PREFIX);
      if (!id) continue;

      const [contents] = await file.download();
      mergedMap[id] = { id, ...JSON.parse(contents.toString("utf-8")) };
    }

    // Add default files only if not overridden
    for (const file of defaultFiles) {
      const id = extractId(file.name, DEFAULT_PREFIX);
      if (!id || mergedMap[id]) continue;

      const [contents] = await file.download();
      mergedMap[id] = { id, ...JSON.parse(contents.toString("utf-8")) };
    }

    return res.status(200).json(Object.values(mergedMap));
  } catch (err) {
    console.error("Error loading templates:", err);
    return res.status(500).json({ error: "Failed to load templates" });
  }
}

function extractId(filename: string, prefix: string): string | null {
  const match = filename.match(new RegExp(`^${prefix}/(.+?)\\.json$`));
  return match ? match[1] : null;
}