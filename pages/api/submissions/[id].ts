import type { NextApiRequest, NextApiResponse } from "next";
import { storage, bucket } from "@/lib/storage";

const folderPath = "teams";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Invalid submission ID" });
    }
    const deleteFile = `${folderPath}/${id}/submission.json`;
    try {
        if (req.method === "DELETE") {
          // Encode the deletefile URL
          encodeURIComponent(deleteFile);

          // Delete the delete folder
          await bucket.file(deleteFile).delete({
            ignoreNotFound: true,
          });
        
          return res.status(200).json({ message: "Submission deleted" });
        }
    
        return res.status(405).json({ error: "Method not allowed" });
      } catch (err) {
        console.error("Submission API error:", err);
        return res.status(500).json({ error: "Internal server error" });
      }
}