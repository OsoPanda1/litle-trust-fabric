// ────────────────────────────────────────────────────────────────
// Isabella.Memory — Librarian Memory Extension
// Memoria especializada para el motor bibliotecario
// ────────────────────────────────────────────────────────────────

import type { DocumentMeta, BookStructure, CompilationJob } from "../types";

export interface LibrarianMemory {
  trackScan(files: DocumentMeta[]): void;
  trackCompilation(job: CompilationJob): void;
  getRecentScans(limit?: number): DocumentMeta[];
  getRecentCompilations(limit?: number): CompilationJob[];
  getStats(): { totalScanned: number; totalCompiled: number; lastScan: Date | null; lastCompilation: Date | null };
}

const RECENT_SCANS: DocumentMeta[] = [];
const RECENT_COMPILATIONS: CompilationJob[] = [];

export function createLibrarianMemory(): LibrarianMemory {
  return {
    trackScan(files: DocumentMeta[]): void {
      RECENT_SCANS.push(...files);
      if (RECENT_SCANS.length > 10000) RECENT_SCANS.splice(0, RECENT_SCANS.length - 10000);
    },

    trackCompilation(job: CompilationJob): void {
      RECENT_COMPILATIONS.push(job);
      if (RECENT_COMPILATIONS.length > 100) RECENT_COMPILATIONS.splice(0, RECENT_COMPILATIONS.length - 100);
    },

    getRecentScans(limit = 50): DocumentMeta[] {
      return RECENT_SCANS.slice(-limit);
    },

    getRecentCompilations(limit = 10): CompilationJob[] {
      return RECENT_COMPILATIONS.slice(-limit);
    },

    getStats() {
      return {
        totalScanned: RECENT_SCANS.length,
        totalCompiled: RECENT_COMPILATIONS.filter((j) => j.status === "ready").length,
        lastScan: RECENT_SCANS.length > 0 ? new Date(RECENT_SCANS[RECENT_SCANS.length - 1].modified) : null,
        lastCompilation: RECENT_COMPILATIONS.length > 0 ? new Date(RECENT_COMPILATIONS[RECENT_COMPILATIONS.length - 1].id.split("-")[1]) : null,
      };
    },
  };
}
