// ────────────────────────────────────────────────────────────────
// Memory Engine — Cognitive Memory Subsystem
// Almacenamiento estructurado de experiencias, patrones y lecciones
// ────────────────────────────────────────────────────────────────

export type MemoryEntry = {
  id: string;
  type: "lesson" | "pattern" | "incident" | "precedent" | "interaction";
  timestamp: number;
  content: string;
  tags: string[];
  source: string;
  ttl: number;
};

export type MemoryQuery = {
  tags?: string[];
  type?: MemoryEntry["type"];
  since?: number;
  limit?: number;
};

export interface MemoryEngine {
  remember(entry: Omit<MemoryEntry, "id" | "timestamp">): MemoryEntry;
  recall(query: MemoryQuery): MemoryEntry[];
  forget(id: string): boolean;
  consolidate(): number;
  stats(): { total: number; byType: Record<string, number> };
}

const LTM: Map<string, MemoryEntry> = new Map();

function generateId(): string {
  return `mem-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createMemoryEngine(): MemoryEngine {
  return {
    remember(entry): MemoryEntry {
      const stored: MemoryEntry = {
        ...entry,
        id: generateId(),
        timestamp: Date.now(),
      };
      LTM.set(stored.id, stored);
      return stored;
    },

    recall(query: MemoryQuery): MemoryEntry[] {
      let results = Array.from(LTM.values());

      if (query.type) results = results.filter((e) => e.type === query.type);
      if (query.since) results = results.filter((e) => e.timestamp >= query.since!);
      if (query.tags && query.tags.length > 0) {
        results = results.filter((e) => query.tags!.some((t) => e.tags.includes(t)));
      }

      results.sort((a, b) => b.timestamp - a.timestamp);
      if (query.limit) results = results.slice(0, query.limit);
      return results;
    },

    forget(id: string): boolean {
      return LTM.delete(id);
    },

    consolidate(): number {
      const now = Date.now();
      let removed = 0;
      for (const [id, entry] of LTM) {
        if (entry.ttl > 0 && now - entry.timestamp > entry.ttl) {
          LTM.delete(id);
          removed++;
        }
      }
      return removed;
    },

    stats() {
      const byType: Record<string, number> = {};
      for (const entry of LTM.values()) {
        byType[entry.type] = (byType[entry.type] ?? 0) + 1;
      }
      return { total: LTM.size, byType };
    },
  };
}
