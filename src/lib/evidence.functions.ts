// Evidence Chain server functions (RFC-0008).
// Public read endpoints for /verify/$litleId; owner-scoped mutations live behind auth.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const IdSchema = z.object({ litleId: z.string().min(4).max(200) });

export type EvidenceNodeKind = "SOURCE" | "PROMPT" | "MODEL" | "REVISION" | "QUOTE";

export interface PublicEvidenceSummary {
  litleId: string;
  found: boolean;
  rootHash: string | null;
  workTitle: string | null;
  workType: string | null;
  cryptoProfile: string | null;
  createdAt: string | null;
  nodeCounts: Record<EvidenceNodeKind, number>;
  nodes: Array<{
    id: string;
    kind: EvidenceNodeKind;
    label: string;
    contentHash: string;
    createdAt: string;
  }>;
}

const EMPTY_COUNTS: Record<EvidenceNodeKind, number> = {
  SOURCE: 0,
  PROMPT: 0,
  MODEL: 0,
  REVISION: 0,
  QUOTE: 0,
};

/**
 * Public, read-only summary of an Evidence Chain. Uses a publishable-key
 * client so it can serve during SSR/prerender without a bearer token.
 * Rows are exposed only when the record is marked public in the DB via
 * a narrow `TO anon` SELECT policy.
 */
export const getPublicEvidence = createServerFn({ method: "GET" })
  .inputValidator((input) => IdSchema.parse(input))
  .handler(async ({ data }): Promise<PublicEvidenceSummary> => {
    const { createClient } = await import("@supabase/supabase-js");
    const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
    const url = process.env.SUPABASE_URL!;
    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
            h.delete("Authorization");
          }
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });

    const { data: record } = await supabase
      .from("evidence_records")
      .select("litle_id, root_hash, work_title, work_type, crypto_profile, created_at, is_public")
      .eq("litle_id", data.litleId)
      .eq("is_public", true)
      .maybeSingle();

    if (!record) {
      return {
        litleId: data.litleId,
        found: false,
        rootHash: null,
        workTitle: null,
        workType: null,
        cryptoProfile: null,
        createdAt: null,
        nodeCounts: { ...EMPTY_COUNTS },
        nodes: [],
      };
    }

    const { data: nodes } = await supabase
      .from("evidence_nodes")
      .select("id, kind, label, content_hash, created_at")
      .eq("litle_id", data.litleId)
      .order("created_at", { ascending: true })
      .limit(200);

    const counts = { ...EMPTY_COUNTS };
    const nodeList = (nodes ?? []).map((n) => {
      const kind = (n.kind as EvidenceNodeKind) ?? "SOURCE";
      counts[kind] = (counts[kind] ?? 0) + 1;
      return {
        id: String(n.id),
        kind,
        label: n.label ?? "",
        contentHash: n.content_hash ?? "",
        createdAt: n.created_at ?? "",
      };
    });

    return {
      litleId: record.litle_id,
      found: true,
      rootHash: record.root_hash ?? null,
      workTitle: record.work_title ?? null,
      workType: record.work_type ?? null,
      cryptoProfile: record.crypto_profile ?? null,
      createdAt: record.created_at ?? null,
      nodeCounts: counts,
      nodes: nodeList,
    };
  });
