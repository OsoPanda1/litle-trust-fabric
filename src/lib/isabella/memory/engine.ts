// ────────────────────────────────────────────────────────────────
// Isabella.Memory — Cognitive Memory Subsystem
// Memoria multiescala con RAG, retención/olvido y trazabilidad
// ────────────────────────────────────────────────────────────────

export type MemoryType = "session" | "persona" | "ecosystem" | "cultural" | "lesson" | "pattern" | "incident";

export interface MemoryEntry {
  id: string;
  type: MemoryType;
  timestamp: number;
  content: string;
  tags: string[];
  source: string;
  ttl: number;
  confidence: number;
}

export interface MemoryQuery {
  types?: MemoryType[];
  tags?: string[];
  since?: number;
  limit?: number;
  minConfidence?: number;
}

export interface MemoryEngine {
  store(entry: Omit<MemoryEntry, "id" | "timestamp">): MemoryEntry;
  recall(query: MemoryQuery): MemoryEntry[];
  forget(id: string): boolean;
  consolidate(): number;
  searchByContent(query: string, limit?: number): MemoryEntry[];
  stats(): { total: number; byType: Record<string, number> };
}

const STORE: Map<string, MemoryEntry> = new Map();

let counter = 0;
function genId(): string {
  return `mem-${Date.now()}-${(counter++).toString(36)}`;
}

export function createMemoryEngine(): MemoryEngine {
  return {
    store(entry): MemoryEntry {
      const stored: MemoryEntry = {
        ...entry,
        id: genId(),
        timestamp: Date.now(),
      };
      STORE.set(stored.id, stored);
      return stored;
    },

    recall(query: MemoryQuery): MemoryEntry[] {
      let results = Array.from(STORE.values());
      if (query.types?.length) results = results.filter((e) => query.types!.includes(e.type));
      if (query.tags?.length) results = results.filter((e) => query.tags!.some((t) => e.tags.includes(t)));
      if (query.since) results = results.filter((e) => e.timestamp >= query.since!);
      if (query.minConfidence) results = results.filter((e) => e.confidence >= query.minConfidence!);

      results.sort((a, b) => b.timestamp - a.timestamp);
      return query.limit ? results.slice(0, query.limit) : results;
    },

    forget(id: string): boolean {
      return STORE.delete(id);
    },

    consolidate(): number {
      const now = Date.now();
      let removed = 0;
      for (const [id, entry] of STORE) {
        if (entry.ttl > 0 && now - entry.timestamp > entry.ttl) {
          STORE.delete(id);
          removed++;
        }
      }
      return removed;
    },

    searchByContent(query: string, limit = 10): MemoryEntry[] {
      const q = query.toLowerCase();
      const scored = Array.from(STORE.values()).map((e) => ({
        entry: e,
        score: e.content.toLowerCase().includes(q) ? 1 : e.tags.some((t) => t.includes(q)) ? 0.5 : 0,
      }));
      return scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score).slice(0, limit).map((s) => s.entry);
    },

    stats() {
      const byType: Record<string, number> = {};
      for (const entry of STORE.values()) byType[entry.type] = (byType[entry.type] ?? 0) + 1;
      return { total: STORE.size, byType };
    },
  };
}
