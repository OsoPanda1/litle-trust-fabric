// ────────────────────────────────────────────────────────────────
// Isabella.Library — Compile Engine
// Compilación de libros: síntesis narrativa, ensamblaje, exportación
// ────────────────────────────────────────────────────────────────

import type { BookStructure, CompilationJob, Chapter } from "../types";
import { createPersonalityEngine } from "../core/personality";

export interface CompileEngine {
  build(structure: BookStructure): Promise<CompilationJob>;
  synthesizeChapter(chapter: Chapter): Promise<string>;
  assembleChapters(chapters: string[], book: BookStructure): string;
  exportLatex(book: BookStructure, chapters: string[]): string;
}

let jobCounter = 0;

export function createCompileEngine(): CompileEngine {
  const personality = createPersonalityEngine();
  personality.setMode("librarian");

  return {
    async build(structure: BookStructure): Promise<CompilationJob> {
      const id = `job-${Date.now()}-${(jobCounter++).toString(36)}`;
      const job: CompilationJob = { id, status: "compiling", progress: 0 };

      try {
        const chapters: string[] = [];
        for (let i = 0; i < structure.chapters.length; i++) {
          const ch = await this.synthesizeChapter(structure.chapters[i]);
          chapters.push(ch);
          job.progress = Math.round(((i + 1) / structure.chapters.length) * 80);
        }

        const fullText = this.assembleChapters(chapters, structure);
        const latex = this.exportLatex(structure, chapters);

        job.status = "ready";
        job.progress = 100;
        job.book = {
          ...structure,
          chapters: structure.chapters.map((ch, i) => ({ ...ch, content: chapters[i] })),
        };
      } catch (err) {
        job.status = "error";
        job.error = (err as Error).message;
      }

      return job;
    },

    async synthesizeChapter(chapter: Chapter): Promise<string> {
      const sources = chapter.documents.map((d) => `- ${d.title}`).join("\n");
      const raw = `Capítulo ${chapter.number}: ${chapter.title}\n\nFuentes:\n${sources}\n\n`;
      return personality.applyPersonality(raw, "librarian");
    },

    assembleChapters(chapters: string[], book: BookStructure): string {
      const header =
        `# ${book.title}\n\n**Autor:** ${book.author}\n\n` +
        `*${book.abstract}*\n\n---\n\n`;
      return header + chapters.map((ch, i) => `# Capítulo ${i + 1}\n\n${ch}`).join("\n\n---\n\n");
    },

    exportLatex(book: BookStructure, chapters: string[]): string {
      const chs = chapters.map((ch, i) => {
        const clean = ch.replace(/[*_~`]/g, "").replace(/#{1,6}\s?/g, "");
        return `\\chapter{${book.chapters[i]?.title ?? `Capítulo ${i + 1}`}}\n${clean}`;
      }).join("\n\n");

      return (
        `\\documentclass[12pt, a4paper]{book}\n` +
        `\\usepackage[utf8]{inputenc}\n` +
        `\\usepackage{geometry}\n` +
        `\\title{${book.title}}\n` +
        `\\author{${book.author}}\n` +
        `\\date{\\today}\n\n` +
        `\\begin{document}\n` +
        `\\maketitle\n` +
        `\\tableofcontents\n\n` +
        chs + "\n" +
        `\\end{document}`
      );
    },
  };
}
