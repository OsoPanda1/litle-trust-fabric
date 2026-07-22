// ────────────────────────────────────────────────────────────────
// Vision Engine — OCR, Scene Analysis, Image Understanding
// Capa de visión para Isabella RDM Guide y Edu Mentor
// ────────────────────────────────────────────────────────────────

export type VisionTask = "ocr" | "scene_analysis" | "image_caption" | "diagram_understanding" | "whiteboard_analysis";

export type VisionResult = {
  task: VisionTask;
  text?: string;
  description?: string;
  objects?: string[];
  confidence: number;
  duration: number;
};

export interface VisionEngine {
  analyze: (image: ArrayBuffer, task: VisionTask) => Promise<VisionResult>;
  ocr: (image: ArrayBuffer) => Promise<string>;
  caption: (image: ArrayBuffer) => Promise<string>;
  health: () => { ok: boolean; supported: VisionTask[] };
}

export function createVisionEngine(apiKey?: string): VisionEngine {
  const key = apiKey ?? process.env.OPENAI_API_KEY ?? "";
  const SUPPORTED: VisionTask[] = ["ocr", "scene_analysis", "image_caption", "diagram_understanding", "whiteboard_analysis"];

  function base64FromBuffer(buf: ArrayBuffer): string {
    const bytes = new Uint8Array(buf);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }

  return {
    async analyze(image: ArrayBuffer, task: VisionTask): Promise<VisionResult> {
      const start = performance.now();
      if (!key) throw new Error("OPENAI_API_KEY required for vision engine");

      const b64 = base64FromBuffer(image);
      const resp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: `Perform ${task} on this image.` },
                { type: "image_url", image_url: { url: `data:image/png;base64,${b64}`, detail: "auto" } },
              ],
            },
          ],
          max_tokens: 512,
        }),
      });

      if (!resp.ok) throw new Error(`Vision error: ${resp.status}`);
      const data = await resp.json();
      return {
        task,
        description: data.choices[0].message.content,
        confidence: 0.85,
        duration: performance.now() - start,
      };
    },

    async ocr(image: ArrayBuffer): Promise<string> {
      const r = await this.analyze(image, "ocr");
      return r.description ?? "";
    },

    async caption(image: ArrayBuffer): Promise<string> {
      const r = await this.analyze(image, "image_caption");
      return r.description ?? "";
    },

    health: () => ({ ok: !!key, supported: SUPPORTED }),
  };
}
