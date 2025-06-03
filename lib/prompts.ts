// Fetch a prompt (prefers updated if exists)
export async function fetchPrompt(id: string): Promise<string> {
  const res = await fetch(`/api/prompts/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch prompt for ${id}`);
  const data = await res.json();
  return data.prompt;
}

// Save (or update) a prompt to GCP updated folder
export async function savePromptToGCP(id: string, prompt: string) {
  const res = await fetch(`/api/prompts/${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) throw new Error(`Failed to save prompt for ${id}`);
}

// Delete an updated prompt to revert to default
export async function deleteUpdatedPrompt(id: string) {
  const res = await fetch(`/api/prompts/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to delete updated prompt for ${id}`);
}

// Fetch metadata and prompt content for all templates
export async function getAllTemplates(): Promise<{
  id: string;
  name: string;
  description: string;
  color: string;
  prompt: string;
}[]> {
  const res = await fetch('/api/prompts');
  if (!res.ok) throw new Error('Failed to fetch templates');
  return await res.json();
}