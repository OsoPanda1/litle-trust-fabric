// ────────────────────────────────────────────────────────────────
// Isabella.Library — Cover Engine
// Generación de portadas por descripción textual + Stable Diffusion
// ────────────────────────────────────────────────────────────────

export interface CoverEngine {
  generate(description: string, title: string): Promise<string>;
  compose(imageUrl: string, title: string, author: string): Promise<string>;
  styles(): CoverStyle[];
}

export type CoverStyle = {
  id: string;
  name: string;
  promptSuffix: string;
};

const STYLES: CoverStyle[] = [
  { id: "cyber-quantum", name: "Cyber-Quantum", promptSuffix: "cyber-quantum aesthetic, cyan and gold neon, glassmorphism, holographic particles, dark background" },
  { id: "ceremonial", name: "Ceremonial", promptSuffix: "ceremonial, sacred geometry, gold embossing, dark blue and gold, mexican baroque, dignity" },
  { id: "academic", name: "Academic", promptSuffix: "academic, clean typography, minimalist, white background, blue accents, professional" },
  { id: "territorial", name: "Territorial", promptSuffix: "real del monte hidalgo mexico, mountain landscape, mining town, magic realism, warm golden hour" },
];

function detectStyle(description: string): string {
  for (const style of STYLES) {
    if (description.toLowerCase().includes(style.id) || description.toLowerCase().includes(style.name.toLowerCase())) {
      return style.promptSuffix;
    }
  }
  return STYLES[0].promptSuffix;
}

export function createCoverEngine(apiKey?: string): CoverEngine {
  const key = apiKey ?? process.env.OPENAI_API_KEY ?? "";

  return {
    async generate(description: string, title: string): Promise<string> {
      const styleSuffix = detectStyle(description);
      const prompt = `Book cover: "${title}". ${description}. ${styleSuffix}. High quality, 2048x2048`;

      if (!key) {
        return `[Cover description]: ${prompt}`;
      }

      const resp = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt,
          n: 1,
          size: "1792x1024",
          quality: "hd",
        }),
      });

      if (!resp.ok) throw new Error(`Cover generation error: ${resp.status}`);
      const data = await resp.json();
      return data.data[0].url;
    },

    async compose(imageUrl: string, title: string, author: string): Promise<string> {
      return imageUrl; // Placeholder — in production, composite with PIL
    },

    styles: () => STYLES,
  };
}
