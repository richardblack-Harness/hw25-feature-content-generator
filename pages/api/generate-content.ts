// pages/api/generate-content.ts
import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Template {
  id: string;
  name: string;
  description: string;
  // Add other template properties if needed by the prompt
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    featureName,
    featureDescription,
    keyBenefits,
    featureFlag, // This will be the string or ""
    releaseVersion,
    releaseDate,
    realWorldUseCase,
    competitorResources,
    knownLimitations,
    demoVideoName,
    contextPrompt,
    templates, // This is your array of selected templates
  } = req.body;

  // Basic validation (you might want more)
  if (!featureName || !featureDescription || !templates || !Array.isArray(templates) || templates.length === 0) {
    return res.status(400).json({ error: "Missing required feature details or templates" });
  }

  try {
    const outputs: Record<string, string> = {};

    for (const template of templates as Template[]) {
      // Construct a specific prompt for each template
      const individualPrompt = `
        Generate content for the "${template.name}" template for a new Harness feature with the following details:

        Feature Name: ${featureName}
        Feature Description: ${featureDescription}
        Key Benefits: ${keyBenefits || "Not specified"}
        Feature Flag: ${featureFlag || "Not specified"}
        Release Version: ${releaseVersion || "Not specified"}
        Release Date: ${releaseDate || "Not specified"}
        Real-world Use Case: ${realWorldUseCase || "Not specified"}
        Competitor Resources: ${competitorResources || "Not specified"}
        Known Limitations: ${knownLimitations || "None provided"}
        Demo Video: ${demoVideoName || "No video uploaded"}
        Template-specific instructions: ${template.description}
        Additional Context: ${contextPrompt || "None provided"}

        Please generate only the content for the "${template.name}" template.
      `;

      const completion = await openai.chat.completions.create({
        model: "gpt-4.1", // Or your preferred model
        messages: [{ role: "user", content: individualPrompt }],
        temperature: 0.7,
      });

      outputs[template.name] = completion.choices?.[0]?.message?.content?.trim() ?? `Failed to generate content for ${template.name}`;
    }

    return res.status(200).json({ outputs }); // Send back a structured response
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