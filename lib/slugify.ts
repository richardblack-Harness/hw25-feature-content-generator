export function generateId(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') // replace non-alphanumeric with dashes
      .replace(/^-+|-+$/g, '');    // remove leading/trailing dashes
  }