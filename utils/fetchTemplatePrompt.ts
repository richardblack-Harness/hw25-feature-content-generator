// utils/fetchTemplatePrompt.ts
export async function fetchTemplatePrompt(id: string): Promise<string> {
    const bucketBaseUrl = "https://storage.googleapis.com/content-kings2025";
    const updatedUrl = `${bucketBaseUrl}/updated_prompts/${id}.json`;
    const defaultUrl = `${bucketBaseUrl}/default/${id}.json`;
  
    try {
      const updatedRes = await fetch(updatedUrl);
      if (updatedRes.ok) {
        const updatedData = await updatedRes.json();
        return updatedData.prompt;
      }
      throw new Error("No updated prompt found, falling back.");
    } catch {
      const defaultRes = await fetch(defaultUrl);
      if (!defaultRes.ok) {
        console.error(`Failed to load prompt for ${id}`);
        return "";
      }
      const defaultData = await defaultRes.json();
      return defaultData.prompt;
    }
  }