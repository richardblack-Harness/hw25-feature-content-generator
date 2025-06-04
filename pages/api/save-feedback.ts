import type { NextApiRequest, NextApiResponse } from "next";
import { google } from "googleapis";

// Initialize Google Sheets API
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS || "{}"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;
const SHEET_NAME = "Feedback";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { contentId, featureName, isPositive } = req.body;

    if (!contentId || !featureName || isPositive === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Prepare the data row
    const feedbackScore = isPositive ? 1 : 0;
    const timestamp = new Date().toISOString();
    const values = [[contentId, featureName, feedbackScore, timestamp]];

    // Append to Google Sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:D`, // Columns: ContentID, FeatureName, FeedbackScore, Timestamp
      valueInputOption: "RAW",
      requestBody: {
        values,
      },
    });

    return res.status(200).json({ message: "Feedback saved successfully" });
  } catch (error) {
    console.error("Error saving feedback:", error);
    return res.status(500).json({ error: "Failed to save feedback" });
  }
} 