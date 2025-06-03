import { GoogleAuth } from "google-auth-library";
import axios from "axios";

const API_URL = "https://us-central1-aiplatform.googleapis.com/v1/projects/hackweek-ai-team-temp/locations/us-central1/publishers/google/models/gemini-2.5-flash-preview-05-20:generateContent";

async function generateGeminiResponse(prompt: string) {
  const auth = new GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/cloud-platform"], // ✅ This works with Vertex-based Gemini access
  });

  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();

  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
  };

  try {
    const res = await axios.post(API_URL, payload, {
      headers: {
        Authorization: `Bearer ${accessToken.token}`,
        "Content-Type": "application/json",
      },
    });

    const candidates = res.data.candidates;
    const text = candidates?.[0]?.content?.parts?.[0]?.text ?? "No response content.";
    console.log("✅ Gemini response:\n", text);
  } catch (error: any) {
    console.error("❌ Error from Gemini:", error.response?.data || error.message);
  }
}

generateGeminiResponse("Write a fun product announcement about Hack Week.");