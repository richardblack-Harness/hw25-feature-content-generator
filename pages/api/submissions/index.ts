import type { NextApiRequest, NextApiResponse } from "next";
import { storage, BUCKET_NAME } from "@/lib/storage";

const folderPath = "teams/";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const [files] = await storage.bucket(BUCKET_NAME).getFiles({ prefix: folderPath });

    const submissionFiles = files.filter(file => file.name.endsWith("submission.json"));

    const submissions = await Promise.all(
      submissionFiles.map(async (file) => {
        const [contents] = await file.download();
        const json = JSON.parse(contents.toString());
        const id = file.name.split("/")[1];
        return { id, ...json };
      })
    );

    res.status(200).json(submissions);
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
}