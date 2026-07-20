
## Context

The current project is a blank template. You've uploaded `litle-archive-main.zip`, which is the existing LITLE codebase (TanStack Start + Supabase + L-512 crypto engine, books, pipeline, landing page). The conceptual update reframes LITLE from "a 512-byte crypto container" into a full trust infrastructure with three new pillars:

1. **LITLE-ID** — a durable, self-describing identifier decoupled from the L-512 binary format.
2. **Evidence Chain** — a structured record of the research pipeline (sources, versions, AI models, prompts, seeds, checksums).
3. **Governance / RFCs** — an explicit standards layer (10 RFCs, LIP process, Independent Archive) that separates the standard from the implementation.

The new slogan becomes: **"The Standard for Preserving Knowledge. Verifying Legacy."**

## Phase 1 — Restore the codebase

- Copy the archive contents into the project root, excluding `.git`, `.lovable/`, `.env`, and any file that would clobber Lovable-managed integration files. Preserve the existing template's `src/routeTree.gen.ts` (auto-generated).
- Re-enable Lovable Cloud so Supabase auth + tables work (`_authenticated` routes, `books.functions.ts`, `pipeline.functions.ts`).
- Verify build passes; fix any drift from template conventions.

## Phase 2 — Rebrand to the new positioning

- Update `src/routes/__root.tsx` head defaults and the landing page hero/meta with:
  - Name: **LITLE**
  - Slogan: **"The Standard for Preserving Knowledge. Verifying Legacy."**
  - Sub-positioning copy: "Infrastructure for identity, lineage and verification of independent research."
- Refresh the landing sections to talk about LITLE-ID, Evidence Chain, and Governance — not just the L-512 container.

## Phase 3 — LITLE-ID (RFC-0001)

- New module `src/lib/litle/id.ts` with:
  - Types: `LitleId { namespace, year, workType, cryptoProfile, suffix }`.
  - Work types enum: `BK` (Book), `RQ` (Research), `DS` (Dataset), `PL` (Pipeline), `AR` (Article).
  - Parser + formatter for both forms:
    - URI form: `litle://2026/tech/IA/8F4A29D...`
    - Human form: `LTL-2026-RQ-8F4A-29D3`
  - Version tag for the crypto profile (`L-512.v1`, extensible to `L-1024`).
  - Round-trip tests via a small validator.
- Bridge to existing `sign.ts` / `canonical.ts`: derive LITLE-ID from container digest but keep them independent (container can be re-signed with a new profile without changing the ID).

## Phase 4 — Evidence Chain (RFC-0008)

- New Supabase migration adding tables (all under `public`, with grants + RLS):
  - `evidence_records` (id, litle_id, work_type, created_at, owner)
  - `evidence_nodes` (id, record_id, node_type, parent_id, payload jsonb, hash, created_at)
  - Node types: `Source`, `Version`, `Author`, `Signature`, `PipelineStep`, `ModelUsage`, `Prompt`, `Seed`, `Checksum`, `Config`.
- Server functions in `src/lib/evidence.functions.ts`:
  - `createEvidenceRecord`, `appendEvidenceNode`, `getEvidenceChain(litleId)`.
- UI: new route `src/routes/_authenticated/evidence.$litleId.tsx` rendering the chain as a typed tree with hashes + timestamps.
- Hook into existing `pipeline.functions.ts` so each pipeline step auto-appends an `Evidence Node`.

## Phase 5 — Public verification + Evidence Preservation view

- New public route `src/routes/verify.$litleId.tsx`:
  - Resolves a LITLE-ID → shows work metadata, cryptographic profile, Evidence Chain summary, verification status.
  - Reads via a public server function (no auth), backed by anon-safe SELECT policies limited to published records.
- Adds "Evidence Preservation" as a distinct badge alongside "Zero-Trust Verification".

## Phase 6 — Governance & RFC surface (RFC-0010)

- New route tree `src/routes/standard/` (public, indexed):
  - `standard/index.tsx` — overview of the LITLE Standards Council, LIP process, core vs experimental.
  - `standard/rfcs.tsx` — index of RFC-0001…RFC-0010 with status (Draft / Stable / Experimental).
  - `standard/rfcs.$rfcId.tsx` — dynamic route rendering each RFC from MDX/markdown files in `src/content/rfcs/`.
- Seed content: full drafts for **RFC-0001 (LITLE-ID)** and **RFC-0008 (Evidence Chain)**; stub abstracts + status for the other eight.
- Add each RFC to `sitemap.xml.ts` entries.

## Phase 7 — Independent Archive placeholder (RFC-0009)

- `standard/archive.tsx` page documenting where the RFCs are (or will be) mirrored — arXiv, Zenodo, Internet Archive — and the reproducibility guarantees. No live mirroring yet; the page is the promise + status.

## Phase 8 — Wire-through & polish

- Update top nav: `Library`, `Verify`, `Standard`, `Governance`, `Submit Work`.
- Update footer with new slogan + links to `/standard` and `/standard/rfcs`.
- Regenerate sitemap entries for all new public routes.
- Run typecheck; fix any breakage from the ID/Evidence integration.

## Technical notes

- L-512 stays exactly as-is; it becomes `Profile L-512 v1` referenced from RFC-0003/0005/0006 but no longer the identity itself.
- The LITLE-ID module has zero dependencies on Supabase — it's pure TS so future implementers can port it.
- Evidence Chain nodes store `hash` (SHA-256 of canonical payload) so the chain itself is Merkle-verifiable, independent of L-512.
- All new tables get explicit `GRANT` + RLS policies per project rules.
- RFC content lives as plain markdown in the repo, so the "standard" is versionable via git even if the app is torn down.

## Out of scope for this pass

- Actual PQC (ML-DSA) swap-in — stays as the current HMAC stand-in per RFC-0005 v1.
- Live external archive mirroring (arXiv/Zenodo push).
- Multi-tenant governance (Standards Council remains "one-person council + manifesto" for now).
- Quantum lab surface (kept as experimental, unchanged).

Shall I proceed with all eight phases, or would you like me to start with Phases 1–4 (restore + rebrand + LITLE-ID + Evidence Chain) and land Governance/RFC pages in a follow-up?
