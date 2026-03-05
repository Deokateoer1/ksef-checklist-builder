import { API_URL } from "../constants";

export async function generateChecklistAI(prompt: string): Promise<string> {
  const res = await fetch(`${API_URL}/api/checklist/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    throw new Error(`AI error: HTTP ${res.status}`);
  }

  const data = await res.json();
  return data.result;
}