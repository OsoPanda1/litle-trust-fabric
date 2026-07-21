// LITLE Standards Council — Request for Comments (RFCs).
// Markdown-flavored plain text; the standards route renders these directly.

export interface Rfc {
  id: string; // e.g. "RFC-0001"
  slug: string; // URL slug
  title: string;
  status: "Draft" | "Proposed" | "Accepted" | "Implemented" | "Stable";
  category:
    | "Identity"
    | "Evidence"
    | "Preservation"
    | "Governance"
    | "Interop"
    | "Observability";
  updated: string; // ISO date
  abstract: string;
  body: string; // plain text with `#` headings + `-` lists
}

export const RFCS: Rfc[] = [
  {
    id: "RFC-0001",
    slug: "0001-litle-id",
    title: "LITLE-ID — Durable Identifier for Preserved Knowledge",
    status: "Implemented",
    category: "Identity",
    updated: "2026-07-20",
    abstract:
      "Defines a self-describing identifier for LITLE works that survives rotation of the underlying cryptographic container.",
    body: `# 1. Motivation
Cryptographic profiles age. A LITLE work must remain citable across decades,
even as its anchor is rotated from L-512.v1 to a post-quantum successor.

# 2. Canonical form
- litle:<year>:<workType>:<cryptoProfile>:<namespace>:<suffix>
- URI form:   litle://<year>/<namespace>/<suffix>
- Human form: LTL-<year>-<workType>-<suffix4>-<suffix4>

# 3. Fields
- year         four-digit publication year
- workType     BK, RQ, DS, PL, AR
- cryptoProfile records the profile of the current anchor (rotatable)
- namespace    lowercase slash-separated discipline path (tech/ia)
- suffix       8..64 uppercase hex characters, derived from the container digest

# 4. Rotation
The suffix and namespace are stable. When the anchor is rotated, only the
cryptoProfile field changes; the ID remains valid and the previous anchor
is preserved in the Evidence Chain (RFC-0008).
`,
  },
  {
    id: "RFC-0008",
    slug: "0008-evidence-chain",
    title: "Evidence Chain — Provenance for AI-Assisted Research",
    status: "Implemented",
    category: "Evidence",
    updated: "2026-07-20",
    abstract:
      "Standardizes how a LITLE work records the sources, prompts, model seeds and revisions it descends from.",
    body: `# 1. Purpose
A LITLE work is only as trustworthy as the trail behind it. The Evidence
Chain records every input that materially shaped the finished text.

# 2. Node types
- SOURCE     an ingested file (PDF, DOCX, MD, TXT, audio transcript)
- PROMPT     an AI prompt used during synthesis
- MODEL      a model + seed + parameters used to generate a passage
- REVISION   a human edit with author, timestamp, diff-hash
- QUOTE      a verbatim quotation with source-node reference

# 3. Structure
Nodes form a Merkle-like DAG rooted at the work's LITLE-ID. Each node stores
a content hash; the root hash is anchored into the L-512 container's Block A.

# 4. Public verification
A public route (/verify/<litleId>) exposes the root hash and node summary
without disclosing raw source contents; owners may selectively disclose.
`,
  },
  {
    id: "RFC-0009",
    slug: "0009-independent-archive",
    title: "Independent Archive — Preservation Beyond the Platform",
    status: "Proposed",
    category: "Preservation",
    updated: "2026-07-20",
    abstract:
      "Commits LITLE to redundant off-platform preservation so works outlive the hosting infrastructure.",
    body: `# 1. Guarantees
- At least three independent copies across two jurisdictions.
- One copy on write-once media refreshed on a 5-year cadence.
- Manifest publication: quarterly signed list of preserved LITLE-IDs.

# 2. Format
Every preserved bundle contains: canonical text, cover art, LITLE-512B
container, Evidence Chain export, and a plain-text README naming the ID
and the specifications required to interpret the bundle.

# 3. Exit policy
If LITLE, the organization, ceases to operate, the preservation manifests
and bundles remain accessible under a permissive license. No work should
depend on a single company to remain citable.
`,
  },
  {
    id: "RFC-0011",
    slug: "0011-standards-council",
    title: "Standards Council — Governance of the LITLE Specifications",
    status: "Draft",
    category: "Governance",
    updated: "2026-07-20",
    abstract:
      "Establishes a lightweight, public process for evolving LITLE's specifications through numbered RFCs.",
    body: `# 1. Principle
Specifications evolve in public. Every material change lands as a numbered
RFC with an accompanying rationale and a review period.

# 2. Lifecycle
Draft → Proposed → Accepted → Implemented → (optionally) Superseded.

# 3. Review
Minimum 30-day public comment window. Objections are addressed in-line in
the RFC's revision history; nothing is silently overridden.
`,
  },
];

export function findRfc(slug: string): Rfc | undefined {
  return RFCS.find((r) => r.slug === slug || r.id.toLowerCase() === slug.toLowerCase());
}
