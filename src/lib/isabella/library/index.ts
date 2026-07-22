// ────────────────────────────────────────────────────────────────
// Isabella.Library — Motor Bibliotecario AI
// Punto de entrada: ingesta, organización, compilación, portada, publicación
// ────────────────────────────────────────────────────────────────

import type { BookStructure, CompilationJob, DocumentMeta } from "../types";
import { createIngestEngine } from "./ingest";
import type { IngestEngine } from "./ingest";
import { createOrganizeEngine } from "./organize";
import type { OrganizeEngine } from "./organize";
import { createCompileEngine } from "./compile";
import type { CompileEngine } from "./compile";
import { createCoverEngine } from "./cover";
import type { CoverEngine } from "./cover";
import { createPublishEngine } from "./publish";
import type { PublishEngine } from "./publish";

export interface LibraryEngine {
  scanDirectories(paths: string[]): Promise<DocumentMeta[]>;
  ingestFiles(files: DocumentMeta[]): Promise<string>;
  organizeDocuments(files: DocumentMeta[], bookTitle: string): Promise<BookStructure>;
  compileBook(structure: BookStructure): Promise<CompilationJob>;
  generateCover(description: string, title: string): Promise<string>;
  publishBook(book: BookStructure, pdfPath: string, destination: string): Promise<boolean>;
  status(): { scanned: number; organized: boolean; compiled: boolean };
}

export function createLibraryEngine(): LibraryEngine {
  const ingest = createIngestEngine();
  const organize = createOrganizeEngine();
  const compile = createCompileEngine();
  const cover = createCoverEngine();
  const publish = createPublishEngine();

  let scannedDocs: DocumentMeta[] = [];
  let currentBook: BookStructure | null = null;

  return {
    async scanDirectories(paths: string[]): Promise<DocumentMeta[]> {
      scannedDocs = await ingest.scan(paths);
      return scannedDocs;
    },

    async ingestFiles(files: DocumentMeta[]): Promise<string> {
      const results = await ingest.process(files);
      scannedDocs = results;
      return `Ingested ${results.length} files successfully`;
    },

    async organizeDocuments(files: DocumentMeta[], bookTitle: string): Promise<BookStructure> {
      const structure = await organize.classify(files, bookTitle);
      currentBook = structure;
      return structure;
    },

    async compileBook(structure: BookStructure): Promise<CompilationJob> {
      return await compile.build(structure);
    },

    async generateCover(description: string, title: string): Promise<string> {
      return await cover.generate(description, title);
    },

    async publishBook(book: BookStructure, pdfPath: string, destination: string): Promise<boolean> {
      return await publish.submit(book, pdfPath, destination);
    },

    status: () => ({
      scanned: scannedDocs.length,
      organized: currentBook !== null,
      compiled: false,
    }),
  };
}
