// Lovable AI Gateway helpers (server-only).
// Uses the OpenAI-compatible endpoints exposed by the gateway.

const BASE = "https://ai.gateway.lovable.dev/v1";

function apiKey(): string {
  const k = process.env.LOVABLE_API_KEY;
  if (!k) throw new Error("LOVABLE_API_KEY is not configured");
  return k;
}

export interface EmbedResult {
  embeddings: number[][];
}

export async function embedTexts(
  inputs: string[],
  model = "google/gemini-embedding-001",
): Promise<EmbedResult> {
  if (inputs.length === 0) return { embeddings: [] };
  const res = await fetch(`${BASE}/embeddings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey(),
    },
    body: JSON.stringify({ model, input: inputs, encoding_format: "float" }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Embeddings ${res.status}: ${t}`);
  }
  const json = (await res.json()) as { data: { embedding: number[] }[] };
  return { embeddings: json.data.map((d) => d.embedding) };
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function chatComplete(
  messages: ChatMessage[],
  opts: { model?: string; maxTokens?: number; temperature?: number } = {},
): Promise<string> {
  const model = opts.model ?? "google/gemini-3.5-flash";
  const res = await fetch(`${BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey(),
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: opts.maxTokens ?? 4096,
      temperature: opts.temperature ?? 0.4,
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    if (res.status === 429) throw new Error("AI rate limit hit. Please retry in a moment.");
    if (res.status === 402)
      throw new Error("AI credits exhausted. Add credits in workspace billing.");
    throw new Error(`Chat ${res.status}: ${t}`);
  }
  const json = (await res.json()) as {
    choices: { message: { content: string } }[];
  };
  return json.choices[0]?.message?.content ?? "";
}
