// Browser-side extractors. We keep PDF/DOCX parsing on the client so the
// Cloudflare Worker runtime does not have to ship native/Node-only libraries.

export interface ExtractedFile {
  filename: string;
  mime: string;
  size: number;
  text: string;
}

export async function extractFile(file: File): Promise<ExtractedFile> {
  const name = file.name;
  const lower = name.toLowerCase();
  const size = file.size;
  const mime = file.type || guessMime(lower);

  let text = "";
  if (lower.endsWith(".pdf") || mime === "application/pdf") {
    text = await extractPdf(file);
  } else if (
    lower.endsWith(".docx") ||
    mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    text = await extractDocx(file);
  } else {
    text = await file.text();
  }
  return { filename: name, mime, size, text: normalize(text) };
}

function guessMime(lower: string): string {
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".docx"))
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (lower.endsWith(".md")) return "text/markdown";
  return "text/plain";
}

function normalize(t: string): string {
  return t
    .replace(/\r\n/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function extractPdf(file: File): Promise<string> {
  // Dynamic import so SSR never touches pdfjs
  const pdfjs = await import("pdfjs-dist");
  const worker = await import("pdfjs-dist/build/pdf.worker.mjs?url");
  (pdfjs.GlobalWorkerOptions as { workerSrc: string }).workerSrc = (
    worker as unknown as { default: string }
  ).default;

  const buf = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buf }).promise;
  const parts: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const line = content.items
      .map((it: unknown) => (it as { str?: string }).str ?? "")
      .join(" ");
    parts.push(line);
  }
  return parts.join("\n\n");
}

async function extractDocx(file: File): Promise<string> {
  const mammoth = await import("mammoth/mammoth.browser");
  const buf = await file.arrayBuffer();
  const res = await mammoth.extractRawText({ arrayBuffer: buf });
  return res.value;
}
