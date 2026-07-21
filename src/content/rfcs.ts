// LITLE Standards Council — Request for Comments (RFCs).
// Formal specifications for the LITLE standard.
// Status lifecycle: Draft → Proposed → Accepted → Implemented → Stable → Deprecated → Revoked.

export interface Rfc {
  id: string;
  slug: string;
  title: string;
  status: "Draft" | "Proposed" | "Accepted" | "Implemented" | "Stable";
  category:
    | "Identity"
    | "Evidence"
    | "Preservation"
    | "Governance"
    | "Interop"
    | "Observability"
    | "Cryptography"
    | "Submission";
  updated: string;
  abstract: string;
  body: string;
}

export const RFCS: Rfc[] = [
  {
    id: "RFC-0001",
    slug: "0001-litle-id",
    title: "LITLE-ID — Durable Identifier for Preserved Knowledge",
    status: "Implemented",
    category: "Identity",
    updated: "2026-07-21",
    abstract:
      "Defines the LITLE identifier format, encoding rules, and rotation mechanism for cryptographic profile migration.",
    body: `# 1. Specification

## 1.1 Identifier Forms

- **URI:** litle://<year>/<namespace>/<suffix>
- **Human:** LTL-<year>-<workType>-<suffix4>-<suffix4>
- **Canonical (Bech32m):** litle1<hrp><data>

## 1.2 Fields

| Field | Length | Format | Description |
|---|---|---|---|
| year | 4 | \d{4} | Publication year |
| workType | 2 | [A-Z]{2} | BK, RQ, DS, PL, AR, MD, SW, EX, DP |
| namespace | variable | [a-z0-9/.-]+ | Discipline path (e.g., tech/ia) |
| suffix | 8-64 | [0-9A-F]+ | Derived from container digest |

## 1.3 Crypto Profile

The suffix is derived from the container digest using the active crypto profile:
- L-512.v1: SHA-256 (classic)
- L-PQC.v1: SHAKE256 (PQC)

# 2. Rotation

The suffix and namespace are immutable. When the container is rotated to a new
crypto profile, the profile field updates but the identifier remains valid.
Previous anchors are preserved in the Evidence Chain (RFC-0008).

# 3. Compliance

Implementations MUST support at minimum:
- URI form parsing (litle:// scheme)
- Human form formatting and parsing
- Canonical Bech32m encoding (RFC-0001 §1.1)

# 4. Security Considerations

- The suffix is truncated to a minimum of 8 hex characters (32 bits).
  Collision probability must be assessed for large registries.
- Profile rotation MUST preserve the old anchor hash in the Evidence Chain.
`,
  },
  {
    id: "RFC-0008",
    slug: "0008-evidence-chain",
    title: "Evidence Chain — Provenance for AI-Assisted Research",
    status: "Implemented",
    category: "Evidence",
    updated: "2026-07-21",
    abstract:
      "Standardizes the Merkle-DAG provenance graph for recording sources, AI prompts, model parameters, and revisions behind a LITLE work.",
    body: `# 1. Specification

## 1.1 Node Types

| Type | Label | Content |
|---|---|---|
| SOURCE | Source file | Hash of ingested file (PDF, DOCX, MD, TXT) |
| PROMPT | AI prompt | Hash of prompt text + timestamp |
| MODEL | AI model | Model name, seed, parameters, output hash |
| REVISION | Human edit | Author ID, timestamp, diff hash |
| QUOTE | Verbatim quote | Quoted text + reference to source node |

## 1.2 Structure

Nodes form a Merkle-DAG. Each node stores:
- type (enum above)
- content_hash (SHAKE256 for L-PQC.v1, SHA-256 otherwise)
- parents: string[] (referencing parent node hashes)

Root hash = SHAKE256(concat(sorted(nodes[*].content_hash)))

## 1.3 Anchoring

The root hash is written into LITLE container Block A at offset 12-44 (32 bytes).

# 2. Compliance

Implementations MUST:
- Support all 5 node types
- Compute root hash deterministically (sorted node order)
- Expose public verification at /verify/<litleId>

# 3. Security Considerations

- The DAG is append-only. Revisions add nodes; they do not delete.
- Personal data in node payloads may be tombstoned (RFC-0012 §3).
`,
  },
  {
    id: "RFC-0009",
    slug: "0009-independent-archive",
    title: "Independent Archive — Preservation Beyond the Platform",
    status: "Accepted",
    category: "Preservation",
    updated: "2026-07-21",
    abstract:
      "Defines the off-platform preservation requirements: 3 copies, 2 jurisdictions, write-once media, quarterly manifest publication.",
    body: `# 1. Specification

## 1.1 Redundancy Requirements

- Minimum 3 independent copies
- Copies must span at least 2 jurisdictions (legal/physical)
- One copy on write-once media (e.g., Blu-ray M-DISC, S3 Object Lock)

## 1.2 Bundle Format

Each preserved bundle contains:
1. canonical.txt — normalized plain text of the work
2. cover.png — cover art (if applicable)
3. container.bin — LITLE container (512B or 8KB)
4. evidence-chain.json — full Evidence Chain DAG export
5. README.txt — LITLE-ID and specification reference

## 1.3 Manifest Publication

A signed manifest of all preserved LITLE-IDs is published quarterly.
The manifest is signed with the LITLE platform key (ML-DSA-87).

# 2. Compliance

Archival implementations MUST produce bundles conforming to §1.2.
Manifests MUST be publicly accessible and verifiable.

# 3. Security Considerations

- Bundles do not depend on any single platform for readability.
- encryption is NOT applied (works are Open Access by design).
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
      "Formalizes the seven-federation governance model with 5/7 quorum for LIPs (LITLE Improvement Proposals) and 6/7 for revocations.",
    body: `# 1. Federations

| ID | Name | Responsibility |
|---|---|---|
| FED-1 | Crypto & PKI | Cryptographic standards, key management |
| FED-2 | Standards & LIPs | RFC lifecycle, LIP review process |
| FED-3 | Infrastructure & Mesh | Platform infra, observability operators |
| FED-4 | Evidence Chain | Provenance standards, Evidence DAG |
| FED-5 | Curation | Epistemic scoring, quarantine decisions |
| FED-6 | Kernel & DX | Developer experience, SDK, API design |
| FED-7 | Audit & Compliance | Security audits, regulatory compliance |

# 2. Quorum Rules

- **Stable:** 5/7 federations in favor
- **Revocation:** 6/7 federations in favor
- **Draft → Proposed:** 3/7 (simple majority of voting members)

# 3. LIP Lifecycle

Draft → Experimental → Candidate → Stable → Deprecated → Revoked

Each transition requires a formal vote recorded in the RFC revision history.

# 4. Transparency

- All votes and objections are recorded in the RFC revision history.
- No silent overrides.
- Federation members are public entities with disclosed identity.

# 5. Compliance

Governance implementations MUST:
- Maintain a public record of all LIPs
- Enforce quorum rules before status transitions
- Provide a mechanism for federation membership changes
`,
  },
  {
    id: "RFC-0011",
    slug: "0011-standards-council",
    title: "Standards Council — Governance of the LITLE Specifications",
    status: "Proposed",
    category: "Governance",
    updated: "2026-07-21",
    abstract:
      "Establishes the public process for evolving LITLE specifications through numbered RFCs with minimum 30-day review periods.",
    body: `# 1. Specification

## 1.1 RFC Lifecycle

Draft → Proposed → Accepted → Implemented → Stable → Deprecated → Revoked

## 1.2 Review Period

- Minimum 30-day public comment window for Proposed → Accepted
- Objections are addressed in-line in the RFC revision history
- No silent overrides permitted

## 1.3 RFC Requirements

Each RFC MUST include:
1. Title and identifier
2. Status and category
3. Abstract (≤300 characters)
4. Specification (normative)
5. Compliance requirements
6. Security considerations

# 2. Compliance

All LITLE standard changes MUST follow the RFC process defined herein.
Bypassing the RFC process invalidates any specification change.
`,
  },
  {
    id: "RFC-0002",
    slug: "0002-work-types",
    title: "Extended WorkTypes — Beyond Books and Papers",
    status: "Accepted",
    category: "Identity",
    updated: "2026-07-21",
    abstract:
      "Extends LITLE-ID work types to 9 codes: BK, RQ, DS, PL, AR, MD, SW, EX, DP.",
    body: `# 1. Specification

## 1.1 Work Type Codes

| Code | Meaning | Example |
|---|---|---|
| BK | Book / Monograph | LTL-2026-BK-A1B2-C3D4 |
| RQ | Research paper | LTL-2026-RQ-E5F6-G7H8 |
| DS | Dataset | LTL-2026-DS-I9J0-K1L2 |
| PL | Pipeline | LTL-2026-PL-M3N4-O5P6 |
| AR | Article | LTL-2026-AR-Q7R8-S9T0 |
| MD | AI Model | LTL-2026-MD-U1V2-W3X4 |
| SW | Software / Code | LTL-2026-SW-Y5Z6-A7B8 |
| EX | Experiment run | LTL-2026-EX-C9D0-E1F2 |
| DP | Data Package | LTL-2026-DP-G3H4-I5J6 |

# 2. Compatibility

Existing LITLE-IDs (BK, RQ, DS, PL, AR) are unaffected.
New codes use the same URI/Human/Canonical forms (RFC-0001).
`,
  },
  {
    id: "RFC-0012",
    slug: "0012-trust-fabric",
    title: "Trust Fabric — Decoupling Identity, Evidence and Storage",
    status: "Accepted",
    category: "Interop",
    updated: "2026-07-21",
    abstract:
      "Defines the kernel/adapter architecture separating identity, evidence, and governance from pluggable storage backends.",
    body: `# 1. Specification

## 1.1 Kernel vs. Adapters

- **Kernel:** LITLE-ID (RFC-0001), Evidence DAG (RFC-0008), Governance (RFC-0010).
- **Adapters:** PostgreSQL, MySQL, Elasticsearch, S3, MinIO, IPFS, CloudWatch.

## 1.2 Adapter Contract

- No backend is normative
- The kernel is the source of truth
- Adapters MUST NOT leak vendor semantics into evidence payloads
- All evidence payloads MUST be canonicalized per RFC 8785 (JCS) before hashing

## 1.3 Cryptographic Erasure

Personal data may be tombstoned by rotating a per-node key.
The DAG topology and root hash remain valid.
The payload becomes unreadable but the chain integrity is preserved.

# 2. Compliance

Adapters MUST implement the full kernel interface.
Partial implementations are not compliant.
`,
  },
  {
    id: "RFC-0013",
    slug: "0013-observability-fabric",
    title: "Observability Fabric — LITLE-ID as Primary Axis",
    status: "Proposed",
    category: "Observability",
    updated: "2026-07-21",
    abstract:
      "Unifies observability dashboards under LITLE-ID as the primary axis. Reference deployment via Grafana operator on Kubernetes.",
    body: `# 1. Specification

## 1.1 Dashboard Rule

Every institutional dashboard MUST expose LITLE-ID as its first column or first panel.
Metrics, logs, or alerts without a LITLE-ID reference are informational only and
cannot be cited as evidence.

## 1.2 Reference Data Sources

- LITLE-Core Postgres (evidence_records, evidence_nodes)
- Elasticsearch (logs)
- AWS CloudWatch
- Percona PMM (Prometheus)
- Zabbix

## 1.3 Reference Deployment

- grafana-operator via Helm in namespace 'observability'
- Datasources and dashboards as CRDs (GrafanaDatasource, GrafanaDashboard)
- Kustomize overlays for dev/prod separation

# 2. Non-goals

This RFC does not mandate a specific Grafana version, cloud provider, or
cluster topology. It mandates the LITLE-ID-first contract.

# 3. Compliance

Observability implementations MUST use LITLE-ID as the primary query axis.
`,
  },
  {
    id: "RFC-0014",
    slug: "0014-open-science-curation",
    title: "Open Science Curation — Epistemic Filtering for Human-Machine Knowledge",
    status: "Proposed",
    category: "Preservation",
    updated: "2026-07-21",
    abstract:
      "Defines the 9-dimension epistemic scoring engine with weighted scoring, simulated annealing optimization, and machine-readable output.",
    body: `# 1. Specification

## 1.1 The 9 Epistemic Dimensions

| Dimension | Weight | Scale |
|---|---|---|
| methodological_rigor | 20% | 0–5 |
| reproducibility | 18% | 0–5 |
| citation_integrity | 15% | 0–5 |
| peer_review_status | 12% | 0–5 |
| data_transparency | 12% | 0–5 |
| ai_provenance | 10% | 0–5 |
| longevity_potential | 8% | 0–5 |
| epistemological_novelty | 5% | 0–5 |
| human_machine_readability | 0% (metadata) | 0–5 |

## 1.2 Composite Score

composite = sum(dimension_score_i * weight_i) / sum(weight_i)

## 1.3 Tier Thresholds

- Platinum: ≥ 4.0
- Gold: ≥ 3.5
- Silver: ≥ 2.5
- Bronze: ≥ 1.5
- Unrated: < 1.5

## 1.4 Weight Optimization

Weights are optimized via simulated annealing:
- 1000 iterations
- Exponential temperature decay: T_k = T_0 * 0.95^k
- Objective: maximize Pareto frontier of dimension coverage vs. score separation

## 1.5 Machine-Readable Output

Epistemic metadata MUST be exposed via the Evidence Chain (RFC-0008).
AI agents can query with minimum thresholds, domain filters, and methodology
constraints.

# 2. Compliance

Scoring implementations MUST:
- Support all 9 dimensions
- Use the specified tier thresholds (may add additional tiers)
- Expose machine-readable scoring metadata

# 3. Governance

Dimension definitions and weights are governed under RFC-0010.
Changes require a LIP with 5/7 quorum.
`,
  },
  {
    id: "RFC-0015",
    slug: "0015-digital-academic-certification",
    title: "Digital Academic Certificate — DAC Specification v2",
    status: "Proposed",
    category: "Preservation",
    updated: "2026-07-21",
    abstract:
      "Defines the DAC combining CSV, GMM authorship, source verification, Evidence Chain, epistemic scoring, and dual-stack PQC signatures.",
    body: `# 1. Specification

## 1.1 Certificate Contents

A DAC MUST contain:
1. CSV (Código Seguro de Verificación) — 32-char code
2. Evidence Chain root hash
3. Authorship GMM verification score
4. Source verification report (5-step pipeline)
5. Epistemic composite score and tier
6. Cryptographic signatures (one or more suites)

## 1.2 Signature Suites

| Suite | Hash | Signature | Key Size |
|---|---|---|---|
| classic | SHA-256 | HMAC-SHA-512 | 64 bytes |
| pqc | SHAKE256 | ML-DSA-87 | 2592 bytes |
| dual | Both | Both | Both |

## 1.3 CSV Format

LTL (3) + Base36 SHA-256 hash (21) + Base36 ID (7) + randomness byte (1) = 32 chars
Positions shuffled via Fisher-Yates seeded with the randomness byte.
Verification recomputes the hash from content and compares against the CSV.

## 1.4 Authorship GMM

8-feature stylometric profile per author:
- Word length (mean, std)
- Sentence length (mean, std)
- Vocabulary richness (unique/total words)
- Function word ratio
- Paragraph length (mean)
- Passive voice ratio

Scoring: Gaussian likelihood against enrolled profile.
Threshold: tunable FAR (default 0.02).

## 1.5 Source Verification (5-step)

1. Source Identification
2. Content Integrity (SHA-256 vs. stored hash)
3. URL Access Check
4. Cross-Reference (compare against other sources)
5. Provenance Check

Overall score: verified (≥80) / partial (≥50) / unverified (<50)

## 1.6 Certificate Lifecycle

- Issue: on LITLE container seal
- Verify: /certificate/<litleId>
- Renew: every 10 years (CSV root hash is immutable)
- Revoke: disputed content → 'disputed' status (chain topology preserved)

# 2. Compliance

DAC implementations MUST:
- Support at minimum the classic signature suite
- Implement all 4 verification methodologies
- Expose verification results publicly

# 3. Security Considerations

- The PQC suite (ML-DSA-87) uses a key-committing verify() construction
- Dual-suite certificates require BOTH signatures to validate
`,
  },
  {
    id: "RFC-0016",
    slug: "0016-quarantine-pipeline",
    title: "Quarantine Pipeline — Submission Triangulation & Indexing Gateway",
    status: "Proposed",
    category: "Submission",
    updated: "2026-07-21",
    abstract:
      "Defines the quarantine-based submission pipeline with automated triangulation against ORCID, Crossref, ISNI, web sources, and the existing LITLE library.",
    body: `# 1. Specification

## 1.1 States

QUARANTINE → TRIANGULATING → INDEXED | REJECTED | FED-5_REVIEW

## 1.2 Triangulation Sources

| Source | API Endpoint | Check |
|---|---|---|
| ORCID | pub.orcid.org/v3.0 | Author identity match |
| Crossref | api.crossref.org/works | DOI/DOI existence |
| ISNI | isni.org/api | Identifier verification |
| DuckDuckGo | lite.duckduckgo.com/lite | Web text similarity |
| LITLE Library | Internal | Internal deduplication |

## 1.3 Decision Rules

- **GREEN** (no match, all sources clear): Indexed immediately
- **RED** (match found): Held in quarantine, author notified with references
- **INCONCLUSIVE** (mixed results): Escalated to FED-5 for manual curation review

Each source returns:
- sourceHash: SHAKE256 of matched content (or null)
- confidence: 0-1
- url: reference URL (if applicable)

# 2. Compliance

Submission implementations MUST:
- Place all submitted works in QUARANTINE initially
- Execute triangulation against at minimum 3 of the 5 sources
- Support escalation to FED-5 for inconclusive results

# 3. Security Considerations

- Triangulation is automated and may produce false positives/negatives
- FED-5 manual review is final but appealable via governance process
- sourceHash values are non-reversible (SHAKE256 preimage resistance)
`,
  },
  {
    id: "RFC-0017",
    slug: "0017-post-quantum-cryptography",
    title: "Post-Quantum Cryptography — ML-DSA-87 & SHAKE256 Integration",
    status: "Proposed",
    category: "Cryptography",
    updated: "2026-07-21",
    abstract:
      "Specifies the integration of NIST-standardized post-quantum algorithms: ML-DSA-87 (FIPS 204) for signatures and SHAKE256 (FIPS 202) for hashing within the LITLE cryptographic layer.",
    body: `# 1. Specification

## 1.1 Algorithms

| Algorithm | Standard | Usage |
|---|---|---|
| SHAKE256 | FIPS 202 | Hash, KDF, HMAC replacement |
| ML-DSA-87 | FIPS 204 | Digital signatures (Level 5) |

## 1.2 ML-DSA-87 Parameters

- Security Level: NIST Level 5 (≥ AES-256)
- Public Key: 2,592 bytes
- Private Key: 4,864 bytes
- Signature: 4,627 bytes
- Container Size: 8,192 bytes (LITLE-8KB)

## 1.3 Key Derivation

Signing key is derived from LITLE_AUTHOR_SECRET via SHAKE256 KDF:
key_material = SHAKE256(LITLE_AUTHOR_SECRET || domain_separator, 4864)

## 1.4 Key-Committing Verify

The verify() implementation uses a key-committing construction:
- Hash the public key together with the message before signature verification
- Prevents multi-target attacks across different public keys

## 1.5 Container Profiles

| Profile | Hash | Size | Encoding |
|---|---|---|---|
| classic | SHA-256 | 512 B | Bech32m (~900 chars) |
| pqc | SHAKE256 | 8192 B | Bech32m (~13K chars) |

# 2. Compliance

PQC implementations MUST:
- Use SHAKE256 (not SHA-3) for all PQC hashing
- Implement ML-DSA-87 at NIST Level 5
- Use key-committing verify() for ML-DSA-87
- Support both classic and PQC container profiles

# 3. Security Considerations

- ML-DSA-87 is selected for NIST Level 5, exceeding AES-256 equivalence
- Key-committing verify() prevents multi-target attacks
- SHAKE256 provides 256-bit collision resistance (128-bit quantum)
- Reference implementation has NOT undergone external audit
`,
  },
  {
    id: "RFC-0018",
    slug: "0018-quantum-architecture",
    title: "Quantum Architecture — 48-Gate Identity, Hybrid Shield & Double Zero Trust",
    status: "Draft",
    category: "Cryptography",
    updated: "2026-07-21",
    abstract:
      "Specifies the quantum-inspired identity layer: 48-quantum-gate fingerprinting, layered hybrid encryption shield (L-SHIELD-5), double zero-trust verification (L-ZT-DUAL.v1), and quantum data interconnection for authorship corroboration.",
    body: `# 1. Specification

## 1.1 48 Quantum Gates

The LITLE quantum layer defines 48 unitary gate operations for identity generation.
Gates are classically simulated via 2x2 complex matrix operations on a 2-qubit state
vector. Each gate encodes a specific quantum operation:

| Gate Count | Type | Operations |
|---|---|---|
| 7 | Pauli | X, Y, Z, H, S, S†, T, T† |
| 12 | Rotation | RX(π/4, π/2, π), RY(π/4, π/2, π), RZ(π/4, π/2, π) |
| 6 | Special | √X, √Y, SWAP, iSWAP, CS, CT |
| 4 | Universal | U3(θ,φ,λ) with 3 parameter sets |
| 6 | Echo | ECHO-X, ECHO-Y, ECHO-Z, ENTANGLE, MEASURE |
| 13 | Composite | CX, CY, CZ, CRX, CRY, CRZ, QFT-2, QFT-4, H(XZ), H(YZ), P(π/8), P(π/16), Toffoli-phase |

Gate sequence (48 operations) is deterministically derived from SHAKE256(seed).

## 1.2 Quantum Fingerprint

A quantum fingerprint is a 4-component complex vector (2-qubit state) produced by
applying the 48-gate sequence to the |0⟩ state. Represented as:
- Float64Array[4] for computation
- Hex string (64 hex chars) for serialization
- Gate sequence (48 integers) for traceability

## 1.3 Hybrid Shield (L-SHIELD-5)

Layered encryption with 5 independent verification layers:

| Layer | Algorithm | Verification |
|---|---|---|
| classical | HMAC-SHA-256 | Keyed hash recomputation |
| pqc_hash | SHAKE256-512 | Deterministic hash match |
| pqc_sign | SHAKE256 KDF + key material | Key-committing signature |
| quantum_state | 48-gate fingerprint | State vector comparison |
| entanglement | SHAKE256(data + state) | Entanglement hash |

Profiles: L-SHIELD-3 (3 layers), L-SHIELD-4 (4 layers), L-SHIELD-5 (5 layers).

## 1.4 Double Zero Trust (L-ZT-DUAL.v1)

Two independent verification paths that must BOTH pass:

- **Path A (Classical):** content_integrity, crypto_signature, merkle_root, timeline_consistency, federation_endorsement
- **Path B (Quantum):** quantum_fingerprint, gate_sequence, entanglement_energy, shield_integrity, state_coherence

Trust decision requires ≥ 85% confidence on both paths. Escalation to FED-7 at 60%.

## 1.5 Quantum Interconnection

Data sources (ORCID, DOI, Crossref, ISNI, web, LITLE library) are linked via
quantum gate sequence similarity. Each source produces a 48-gate fingerprint.
Links are established when fingerprint similarity > 0.7 AND gate sequence
similarity > 0.65.

## 1.6 Crypto Profile

New LITLE-ID crypto profile: L-48G.v1
- Digest: SHAKE256 (same as L-PQC.v1)
- Fingerprint: 48-gate quantum state vector
- Shield: L-SHIELD-5
- Zero Trust: L-ZT-DUAL.v1

# 2. Compliance

Implementations MUST:
- Support all 48 gate operations (may optimize matrix math)
- Derive gate sequences deterministically from SHAKE256
- Support L-SHIELD-3 at minimum
- Implement double zero-trust with both paths active

# 3. Security Considerations

- Gates are classical simulations — no quantum hardware required
- The 48-gate sequence provides 48! / k! permutation entropy
- Hybrid shield layers are independently verifiable — any layer can be
  validated without decrypting the others
- Double zero-trust prevents single-path compromise
- Quantum interconnection requires ≥ 2 independent sources for authorship verification
`,
  },
];

export function findRfc(slug: string): Rfc | undefined {
  return RFCS.find((r) => r.slug === slug || r.id.toLowerCase() === slug.toLowerCase());
}
