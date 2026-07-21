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

// Appended in v2.0-HARDENED: extended work types, federated governance,
// and the observability fabric (Grafana / K8s / multi-DB adapters).
RFCS.push(
  {
    id: "RFC-0002",
    slug: "0002-work-types",
    title: "Extended WorkTypes — Beyond Books and Papers",
    status: "Proposed",
    category: "Identity",
    updated: "2026-07-21",
    abstract:
      "Extends LITLE-ID work types to cover AI models, software, experiments and versioned data packages.",
    body: `# 1. Motivation
Academic and industrial output is no longer just books and papers. Models,
pipelines, code and datasets must be citable as first-class artifacts.

# 2. Codes
- BK  Book / Monograph
- RQ  Research paper
- DS  Dataset
- PL  Pipeline
- AR  Article
- MD  AI Model (weights + card + eval)
- SW  Software / Code release
- EX  Experiment run
- DP  Data Package (multi-version bundle)

# 3. Compatibility
Existing LITLE-IDs are unaffected. New codes participate in the same
URI / Human / Canonical forms defined by RFC-0001.
`,
  },
  {
    id: "RFC-0010",
    slug: "0010-federated-governance",
    title: "Federated Governance — Seven Federations & 5/7 Quorum",
    status: "Proposed",
    category: "Governance",
    updated: "2026-07-21",
    abstract:
      "Formalizes the seven-federation model that governs the LITLE Trust Fabric and defines the 5/7 quorum for stable changes.",
    body: `# 1. Federations
- FED-1  Crypto & PKI
- FED-2  Standards & LIPs
- FED-3  Infrastructure & Mesh (incl. observability operators)
- FED-4  Evidence Chain
- FED-5  Curation
- FED-6  Kernel & Developer Experience
- FED-7  Audit & Compliance

# 2. Quorum
A LIP (LITLE Improvement Proposal) reaches Stable only with 5 of 7
federations in favor. Revocation requires 6 of 7.

# 3. LIP lifecycle
Draft → Experimental → Candidate → Stable → Deprecated → Revoked.

# 4. Transparency
Every vote and objection is recorded in the RFC revision history. No
silent overrides, no unilateral maintainer decisions.
`,
  },
  {
    id: "RFC-0012",
    slug: "0012-trust-fabric",
    title: "Trust Fabric — Decoupling Identity, Evidence and Storage",
    status: "Proposed",
    category: "Interop",
    updated: "2026-07-21",
    abstract:
      "Defines the LITLE Trust Fabric: a kernel of identity + evidence + governance, connected to arbitrary storage and observability backends via typed adapters.",
    body: `# 1. Kernel vs. Adapters
The Fabric separates:
- Kernel: LITLE-ID (RFC-0001), Evidence DAG (RFC-0008), Governance (RFC-0010).
- Adapters: PostgreSQL, MySQL, Elasticsearch, S3, MinIO, IPFS, CloudWatch.

No backend is normative. The kernel is the source of truth; adapters are
swappable and MUST NOT leak vendor semantics into evidence payloads.

# 2. Canonicalization
All evidence payloads are canonicalized per RFC 8785 (JCS) before hashing.
Merkle-DAG nodes may reference multiple parents (multi-parent DAG) to
model corrections, retractions and merges.

# 3. Cryptographic Erasure
Personal data may be tombstoned by rotating a per-node key; the DAG
topology and root hash remain valid, but the payload becomes unreadable.
`,
  },
  {
    id: "RFC-0013",
    slug: "0013-observability-fabric",
    title: "Observability Fabric — Grafana as the Official Lineage Viewer",
    status: "Draft",
    category: "Observability",
    updated: "2026-07-21",
    abstract:
      "Unifies Grafana, Kubernetes operators, PMM, Zabbix, CloudWatch and multi-DB dashboards under LITLE-ID as the primary axis of every panel.",
    body: `# 1. Principle
Observability is not the source of truth — LITLE is. Grafana is the
official viewer of the Trust Fabric's operational state.

# 2. Data sources (reference set)
- LITLE-Core Postgres (evidence_records, evidence_nodes)
- Legacy MySQL
- Elasticsearch (logs)
- AWS CloudWatch
- Percona PMM (Prometheus)
- Zabbix

# 3. Dashboard rule
Every institutional dashboard MUST expose LITLE-ID as its first column or
first panel. Any metric, log or alert without a LITLE-ID reference is
informational only; it cannot be cited as evidence.

# 4. Deployment (reference)
- grafana-operator via Helm in namespace 'observability'.
- Datasources and dashboards declared as CRDs (GrafanaDatasource,
  GrafanaDashboard) so the fabric is reproducible from Git.
- Kustomize overlays separate dev / prod without divergence.

# 5. Non-goals
This RFC does not mandate a specific Grafana version, cloud provider or
cluster topology. It mandates the LITLE-ID-first contract.
`,
  },
);

export function findRfc(slug: string): Rfc | undefined {
  return RFCS.find((r) => r.slug === slug || r.id.toLowerCase() === slug.toLowerCase());
}
