// ────────────────────────────────────────────────────────────────
// Isabella.Library — Ingest Engine
// Escaneo, parseo, normalización y deduplicación de archivos
// ────────────────────────────────────────────────────────────────

import { createHash } from "crypto";
import type { DocumentMeta, FileFormat } from "../types";

export interface IngestEngine {
  scan(paths: string[]): Promise<DocumentMeta[]>;
  process(files: DocumentMeta[]): Promise<DocumentMeta[]>;
  normalize(meta: DocumentMeta): DocumentMeta;
  deduplicate(files: DocumentMeta[]): DocumentMeta[];
  stats(): { scanned: number; duplicates: number; errors: number };
}

const FORMAT_MAP: Record<string, FileFormat> = {
  ".pdf": "pdf", ".docx": "docx", ".txt": "txt",
  ".md": "md", ".markdown": "md", ".html": "html", ".htm": "html",
};

let scanCount = 0;
let dupCount = 0;
let errCount = 0;

export function createIngestEngine(): IngestEngine {
  return {
    async scan(paths: string[]): Promise<DocumentMeta[]> {
      const files: DocumentMeta[] = [];
      for (const p of paths) {
        scanCount++;
        const ext = "." + p.split(".").pop()?.toLowerCase();
        const format = FORMAT_MAP[ext] ?? "txt";
        files.push({
          path: p, format, size: 0,
          created: new Date(), modified: new Date(),
          title: p.split("/").pop()?.replace(/\.[^.]+$/, ""),
          checksum: createHash("md5").update(p).digest("hex"),
        });
      }
      return files;
    },

    async process(files: DocumentMeta[]): Promise<DocumentMeta[]> {
      let normalized = files.map((f) => this.normalize(f));
      normalized = this.deduplicate(normalized);
      return normalized;
    },

    normalize(meta: DocumentMeta): DocumentMeta {
      return {
        ...meta,
        title: meta.title?.replace(/[_-]/g, " ").replace(/\s+/g, " ").trim() ?? "untitled",
        checksum: createHash("sha256").update(meta.path + meta.size + meta.modified.toISOString()).digest("hex").slice(0, 16),
      };
    },

    deduplicate(files: DocumentMeta[]): DocumentMeta[] {
      const seen = new Map<string, DocumentMeta>();
      for (const f of files) {
        const key = f.title?.toLowerCase().replace(/\s+/g, "") ?? f.path;
        const existing = seen.get(key);
        if (!existing || f.modified > existing.modified) {
          if (existing) dupCount++;
          seen.set(key, f);
        } else {
          dupCount++;
        }
      }
      return Array.from(seen.values());
    },

    stats: () => ({ scanned: scanCount, duplicates: dupCount, errors: errCount }),
  };
}
