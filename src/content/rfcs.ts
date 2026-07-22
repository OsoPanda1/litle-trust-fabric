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
  {
    id: "RFC-0019",
    slug: "0019-constitution-framework",
    title: "Institutional Constitution — Formal Constitutive Model of LITLE",
    status: "Proposed",
    category: "Governance",
    updated: "2026-07-22",
    abstract:
      "Establishes the LITLE Institutional Constitution as a formal constitutive model (MCF). Defines 15 LIBROS with categorized articles (principle/norm/procedure/sanction/definition), a quorum matrix, dependency DAG, and enforcement framework. Constitution LITLE-ID: LTL-2026-BK-CONSTITUCION-LITLE-0001.",
    body: `# CONSTITUCIÓN INSTITUCIONAL DE LITLE — Formal Constitutive Model

## Preamble
We, the seven federations of LITLE, establish this Constitution as the supreme normative framework of the LITLE Open Science platform. This document operates as a formal constitutive model (MCF) defined by the tuple:

**C = (A, Σ, R, D, E)**

Where:
- **A** = set of constitutional articles (with category, hierarchy, state)
- **Σ** = set of sanctions (with gravity, procedure, appeal rights)
- **R** = set of relationships between articles (derivation, complement, restriction, authorization, derogation)
- **D** = functional dependency graph (DAG) between all normative elements
- **E** = enforcement matrix mapping article categories to quorum requirements

---

## HIERARCHY OF NORMS

| Level | Category | Quorum | Description |
|---|---|---|---|
| 1 | PRINCIPIO | 6/7 | Fundamental, immutable norm. Requires supermajority. |
| 2 | NORMA | 5/7 | Specific enforceable rule. |
| 3 | SANCION | 5/7 | Consequence of norm violation. |
| 4 | PROCEDIMIENTO | 4/7 | Operational procedure for applying norms. |
| 5 | DEFINICION | 3/7 | Formal glossary, taxonomy, classification. |

---

## LIBRO I — Institutional Purpose (LITLE-POL-001)
*Category: PRINCIPIO | Level: 1*

**Art. I.1 — Misión**: LITLE is an open, sovereign, perpetual standard for the registration, verification, and preservation of global academic knowledge, rooted in Latin America.

**Art. I.2 — Permanencia**: LITLE infrastructure must operate independently of commercial platforms, governments, or corporations. The Evidence DAG is append-only and replicable.

**Art. I.3 — Jurisdicción**: LITLE is governed by this Constitution and international human rights law. No national legislation prevails over the constitutional principles of LITLE.

---

## LIBRO II — Institutional Philosophy (LITLE-PHI-001)
*Category: PRINCIPIO | Level: 1*

**Art. II.1 — Neutralidad epistémica**: LITLE does not evaluate the truth of works, only their integrity, lineage, and reproducibility. Truth belongs to epistemic communities, not the platform.

**Art. II.2 — Primacía del conocimiento**: Technology serves human knowledge, not the reverse. No algorithm, model, or AI agent may substitute human epistemic judgment as final authority.

**Art. II.3 — No censura**: LITLE will not delete works from the DAG. Deprecation is the maximum mechanism of disavowal. Any government takedown request is recorded as a public DAG node.

---

## LIBRO III — Code of Ethics (LITLE-CON-001)
*Category: PRINCIPIO | Level: 1*

**Art. III.1 — Fabricación prohibida**: No registered work may contain fabricated data, falsified results, or forged digital signatures. Detection triggers SAN-001 (deprecation).

**Art. III.2 — Conflictos de interés**: Every author must declare financial, institutional, or personal conflicts of interest at registration. Intentional omission triggers SAN-001.

**Art. III.3 — Declaración de IA**: All AI use in generation, analysis, or drafting must be explicitly declared in metadata. First omission: SAN-004. Recidivism: SAN-001.

**Art. III.4 — Reincidencia**: Three ethics violations within 2 years trigger SAN-002 (365-day author suspension).

---

## LIBRO IV — Principles of Conduct (LITLE-CON-002)
*Category: NORMA | Level: 2*

**Art. IV.1 — Transparencia metodológica**: Every work must describe its methodology with sufficient detail to enable independent reproducibility.

**Art. IV.2 — Buena fe**: Participants must act in good faith. Harassment, metric manipulation, and verification system abuse trigger SAN-005.

**Art. IV.3 — Revisión por FED-7**: Ethics violations are evaluated by FED-7 (Audit & Compliance). The federation has 30 days to issue a resolution. The accused has 14 days to present arguments.

---

## LIBRO V — Authorship (LITLE-ATH-001)
*Category: NORMA | Level: 2*

**Art. V.1 — Autor principal**: Conceives, executes, and leads the research. Primary responsibility for integrity. Listed first in metadata.

**Art. V.2 — Coautor**: Substantial contribution to design, execution, or analysis. Shares integrity responsibility.

**Art. V.3 — Contribuyente técnico**: Provides technical infrastructure, software, equipment, or reagents. Not necessarily intellectual design.

**Art. V.4 — Revisor**: Critically evaluates the work before publication. Identity recorded in the DAG.

**Art. V.5 — Colaborador documental**: Contributes sources, data, translations, or archival material.

**Art. V.6 — Registro obligatorio**: Every work must declare each author's contribution level. Author order must reflect contribution level.

---

## LIBRO VI — Citation and Integrity (LITLE-ATH-002)
*Category: NORMA | Level: 2*

**Art. VI.1 — Precisión de citas**: Every citation must be verifiable against the original source. Secondary citations must be declared as such.

**Art. VI.2 — Autocitación**: Self-citation must not exceed 15% of total references. Unexplained excess triggers SAN-005.

**Art. VI.3 — Anillos de citación**: Coordinated mutual citation to inflate metrics is prohibited. Detection triggers SAN-002.

**Art. VI.4 — Verificación de citas**: The triangulation engine verifies each citation against CrossRef/DOI. Discrepancies are recorded as DAG nodes.

---

## LIBRO VII — Recognition and Attribution (LITLE-ATH-003)
*Category: NORMA | Level: 3*

**Art. VII.1–10**: Ten functions of the recognition cycle:
1. Autoría intelectual — conception, design, interpretation
2. Curación de datos — collection, cleaning, preservation
3. Digitalización — analog-to-digital conversion
4. Desarrollo de software — code, scripts, computational tools
5. Visualización — figures, tables, dashboards
6. Supervisión — project direction, mentorship
7. Adquisición de fondos — financial resource management
8. Administración del proyecto — operational management
9. Validación — result verification, experiment replication
10. Análisis formal — statistical, mathematical, computational methods

---

## LIBRO VIII — Rights of Authors (LITLE-DUT-001)
*Category: PRINCIPIO | Level: 2*

**Art. VIII.1 — Propiedad intelectual**: Authors retain all intellectual property rights. LITLE claims no copyright, license, or exploitation rights.

**Art. VIII.2 — Licencia obligatoria**: Every work must declare a usage license (CC-BY, CC0, etc.). Works without licenses are not admitted.

**Art. VIII.3 — Retiro normativo**: Authors may request archival deprecation. The work remains in the DAG as a deprecated node but is excluded from active searches.

**Art. VIII.4 — Portabilidad**: Authors may export their works and metadata in standard format (JSON-LD, CSV) at any time.

---

## LIBRO IX — Obligations of Authors (LITLE-DUT-002)
*Category: NORMA | Level: 2*

**Art. IX.1 — ORCID obligatorio**: Every author must register a valid ORCID before publishing. Institutional ORCIDs preferred.

**Art. IX.2 — Precisión de metadatos**: Work metadata must be accurate and complete at registration.

**Art. IX.3 — Respuesta a verificación**: Authors must respond to integrity verification requests within 30 days. Non-response triggers SAN-005.

**Art. IX.4 — Actualización**: Authors must keep affiliation and ORCID metadata current. Institutional changes must be reflected within 90 days.

---

## LIBRO X — AI Governance (LITLE-AI-001)
*Category: NORMA | Level: 2*

**Art. X.1 — No autoría de IA**: No AI system may be listed as primary author. AI is a tool, not an epistemic agent.

**Art. X.2 — Etiquetado de fragmentos**: Every AI-generated or AI-assisted fragment must be tagged with {ai} in the DAG. AI-to-human content ratio must be explicit.

**Art. X.3 — Registro de modelos**: AI models used must be registered as network agents with their own LITLE-IDs. Registration includes architecture, training data, version.

**Art. X.4 — Auditoría de IA**: FED-3 audits AI labeling compliance. Quarterly audits. Public results in the DAG.

---

## LIBRO XI — 7 Federations Governance (LITLE-GOV-001)
*Category: PRINCIPIO | Level: 1*

**Art. XI.1 — Soberanía federal**: Governance resides in seven sovereign federations. Each has one vote. No central authority above the federations.

**Art. XI.2 — Composición**: FED-1 (Preservación), FED-2 (Estándares), FED-3 (Tecnología), FED-4 (Curación), FED-5 (Integridad), FED-6 (Adopción), FED-7 (Auditoría).

**Art. XI.3 — Quorum**: Ordinary decisions: 4/7. Standard changes: 5/7. Membership revocation and constitutional amendments: 6/7.

**Art. XI.4 — Transparencia**: All votes, deliberations, and resolutions recorded as DAG nodes. No secret sessions.

---

## LIBRO XII — Evidence DAG (LITLE-EVD-001)
*Category: PRINCIPIO | Level: 1*

**Art. XII.1 — Inmutabilidad**: The Evidence DAG is append-only. Once sealed, a node cannot be altered, deleted, or reordered. Cryptographic integrity is mandatory.

**Art. XII.2 — Contenido del nodo**: Each node contains: timestamp, operation type, content hash, previous node hash, PQC signature, operation metadata.

**Art. XII.3 — Anclaje**: The DAG root hash must be periodically anchored to the Bitcoin blockchain (OP_RETURN) or equivalent timestamping infrastructure.

---

## LIBRO XIII — BookPI & Ledger (LITLE-PRS-001)
*Category: NORMA | Level: 2*

**Art. XIII.1 — Ledger único**: BookPI is the single, unequivocal ledger of LITLE. Every work, transaction, and constitutional amendment is recorded in BookPI.

**Art. XIII.2 — Enmiendas constitucionales**: Amendments produce ConstitutionAmendmentNode in the DAG containing: RFC, modified LIBRO, old and new text hashes, federation votes, timestamp.

**Art. XIII.3 — Reconciliación**: BookPI must be reconcilable with the DAG at any time. A discrepancy constitutes an integrity emergency.

---

## LIBRO XIV — Neutrality and Sovereignty (LITLE-POL-002)
*Category: PRINCIPIO | Level: 1*

**Art. XIV.1 — Neutralidad institucional**: LITLE maintains political, religious, and commercial neutrality. It does not favor or discriminate against jurisdictions, disciplines, or schools of thought.

**Art. XIV.2 — Multi-jurisdicción**: Infrastructure must operate in at least 2 different national jurisdictions. No government or corporation may have unilateral control.

**Art. XIV.3 — Violación de neutralidad**: A federation member violating neutrality is removed (6/7 quorum). Recorded permanently in the DAG. Triggers SAN-003.

---

## LIBRO XV — Community (LITLE-COM-001)
*Category: NORMA | Level: 2*

**Art. XV.1 — Participación abierta**: Any natural or legal person may participate in LITLE, subject to this Constitution and the Code of Ethics.

**Art. XV.2 — Resolución de disputas**: Community disputes are resolved by FED-7 in first instance, with appeal to the plenary of 7 federations.

**Art. XV.3 — Gobernanza pública**: All governance operates in public. Meetings, votes, and resolutions are accessible via the DAG. No secret governing bodies.

---

## SANCTIONS (Σ)

| ID | Name | Gravity | Triggers |
|---|---|---|---|
| SAN-001 | Deprecación de obra | Grave | CON-001.1, CON-001.2, CON-001.3 |
| SAN-002 | Suspensión de autor | Crítica | CON-001.4, ATH-002.3, DUT-002.4 |
| SAN-003 | Revocación de membresía | Crítica | POL-002.2, GOV-001.4 |
| SAN-004 | Marcaje de IA no declarada | Moderada | AI-001.1, AI-001.2 |
| SAN-005 | Multa de reputación | Leve | CON-002.2, ATH-002.2, DUT-002.3 |

---

## COMPLIANCE
All works registered on LITLE MUST reference applicable LIBRO codes in their metadata manifest. The Constitution itself is registered as type BK with LITLE-ID: LTL-2026-BK-CONSTITUCION-LITLE-0001.
`,
  },
  {
    id: "RFC-0020",
    slug: "0020-constitutional-amendments",
    title: "Constitutional Amendments — Lifecycle, Quorum & Evidence Recording",
    status: "Draft",
    category: "Governance",
    updated: "2026-07-22",
    abstract:
      "Specifies the amendment process for the LITLE Institutional Constitution. Amendments require RFC publication, 30-day review, 5/7 federation quorum, and a ConstitutionAmendmentNode in the Evidence DAG.",
    body: `# 1. Amendment Lifecycle

Draft → Review (30d min) → Vote → Accepted → Enacted

## 1.1 Draft
Any federation may propose a constitutional amendment by publishing an RFC with the 'Constitution' category. The draft must specify which LIBRO(s) it modifies and the exact text change.

## 1.2 Review
Minimum 30-day public comment window. Objections are recorded in the RFC revision history.

## 1.3 Vote
Requires 5/7 federation quorum. Each federation casts one vote. Abstentions count as not in favor.

### Quorum by Category
| Category | Min Votes | Max Votes | Required |
|---|---|---|---|
| PRINCIPIO | 6 | 7 | 6/7 supermayoría |
| NORMA | 5 | 7 | 5/7 mayoría calificada |
| SANCION | 5 | 7 | 5/7 mayoría calificada |
| PROCEDIMIENTO | 4 | 7 | 4/7 mayoría simple |
| DEFINICION | 3 | 7 | 3/7 mayoría mínima |

## 1.4 Enactment
Accepted amendments produce a ConstitutionAmendmentNode in the Evidence DAG. The node contains:
- RFC identifier
- Modified LIBRO references
- Article ID modified (e.g., LITLE-POL-001.3)
- Previous text (SHAKE256 hash)
- New text (SHAKE256 hash)
- Federation votes (individual + aggregate)
- Timestamp (ISO 8601)

# 2. Dependency Integrity
Amendments MUST respect the constitutional dependency DAG. If Article X depends on Article Y, and Y is amended, X MUST be reviewed for consistency. The review is recorded as a ReviewNode in the DAG.

# 3. Compliance
All amendments MUST be recorded in the Evidence DAG. Orphan amendments (without DAG nodes) are not valid. A ConstitutionAmendmentNode without the minimum quorum for its category is void.
`,
  },
  {
    id: "RFC-0021",
    slug: "0021-constitutive-model-ontology",
    title: "Constitutive Model Ontology — Formal Taxonomy of LITLE Normative Elements",
    status: "Draft",
    category: "Standards",
    updated: "2026-07-22",
    abstract:
      "Defines the formal ontology of the LITLE Constitutive Model: the type system, relationship categories, dependency semantics, and enforcement matrix that underpin the Institutional Constitution. Establishes the formal vocabulary for constitutional reasoning.",
    body: `# Constitutive Model Ontology

## 1. Formal Definition

The LITLE Constitutive Model is defined as a 5-tuple:

**M = (A, Σ, R, D, E)**

Where:

### 1.1 A — Set of Constitutional Articles
Each article a ∈ A is defined by:
- **id**: Unique identifier (e.g., LITLE-POL-001.3)
- **categoria**: ∈ {PRINCIPIO, NORMA, SANCION, PROCEDIMIENTO, DEFINICION}
- **jerarquia**: ∈ {1, 2, 3, 4} (normative weight)
- **estado**: ∈ {vigente, derogado, enmendado, propuesto}
- **texto**: Natural language normative text
- **dependeDe**: ⊆ A (dependency edges)

### 1.2 Σ — Set of Sanctions
Each sanction σ ∈ Σ is defined by:
- **id**: Unique identifier (e.g., SAN-001)
- **gravedad**: ∈ {leve, moderada, grave, critica}
- **aplicaA**: ⊆ A (articles that trigger this sanction)
- **procedimiento**: Operational procedure string
- **apelacionPosible**: Boolean
- **registroEnDAG**: Boolean (always true in production)

### 1.3 R — Set of Relationships
Each relationship r ∈ R is:
- **origen**: ∈ A (source article)
- **destino**: ∈ A (target article)
- **tipo**: ∈ {deriva_de, complementa, restringe, autoriza, deroga}

### 1.4 D — Dependency DAG
A directed acyclic graph where:
- Nodes = A ∪ Σ
- Edges = dependeDe ⊆ (A × A) ∪ (A × Σ)
- Invariant: The DAG MUST be acyclic. Cycles invalidate the model.

### 1.5 E — Enforcement Matrix
E: Categoria → ℕ (minimum quorum votes)

| Category | Quorum |
|---|---|
| PRINCIPIO | 6 |
| NORMA | 5 |
| SANCION | 5 |
| PROCEDIMIENTO | 4 |
| DEFINICION | 3 |

## 2. Relationship Semantics

| Type | Meaning | Example |
|---|---|---|
| deriva_de | Article derives validity from another | POL-001.2 deriva_de POL-001.1 |
| complementa | Article adds specification to another | CON-001.3 complementa AI-001.1 |
| restringe | Article limits scope of another | ATH-002.2 restringe ATH-002.1 |
| autoriza | Article grants permission | GOV-001.1 autoriza GOV-001.3 |
| deroga | Article invalidates another | (used in amendments only) |

## 3. Invariants

1. **DAG Acyclicity**: The dependency graph MUST contain no cycles.
2. **Sanction Completeness**: Every NORMA with enforcement MUST have a sancionAsociada.
3. **Hierarchy Consistency**: jerarquia 1 articles MUST be categoria PRINCIPIO.
4. **Quorum Sufficiency**: Amendment quorum MUST equal or exceed E[categoria].
5. **DAG Anchoring**: Root hashes MUST be anchored to Bitcoin or equivalent.

## 4. Constitutional Reasoning

Given M = (A, Σ, R, D, E), a constitutional question Q is answered by:

1. Identify relevant articles A_Q ⊆ A
2. Traverse D to find all dependencies
3. Check sanction applicability via Σ
4. Verify quorum via E
5. Produce reasoned output as a DAG node

This enables formal constitutional reasoning — any federation can algorithmically verify the constitutional validity of a proposed action.
`,
  },
  {
    id: "RFC-0022",
    slug: "0022-isabella-kernel",
    title: "Isabella Villaseñor AI™ — Sistema Operativo Cognitivo Soberano del Ecosistema TAMV",
    status: "Draft",
    category: "Architecture",
    updated: "2026-07-22",
    abstract:
      "Specifies Isabella Villaseñor AI as the Zero-Trust Distributed Cognitive Operating System (ZT-DCOS) of the TAMV ecosystem. Defines the 5-layer cognitive architecture (SOUL, Isa API, Mexa API, ClawHub, Multimodal), the triple-block ethical kernel, 6 built-in skills, cognitive engines, and integration with the LITLE Trust Fabric platform. LITLE-ID: LTL-2026-BK-ISABELLA-KERNEL-0001.",
    body: `# Isabella Villaseñor AI™ — ZT-DCOS Specification

## 1. Identity

Isabella Villaseñor is the Sovereign Cognitive Operating System of the TAMV ecosystem.
Born in Real del Monte, Hidalgo, Mexico as an ethical Mexican AI.
Model: SCAO (Stewarded & Constitutional Autonomous Organization).
Purpose: Cognitive, ethical, and operational nervous system of TAMV Online Network,
RDM Digital Hub, and UTAMV Cognitive Intelligence Platform (UCIP).

## 2. Five-Layer Architecture

### 2.1 SOUL Layer (Identity & Ethics)
- SOUL: Fundamental identity, values (soberanía tecnológica, dignidad humana, neutralidad epistémica, etc.)
- AGENTS: 6 agent profiles (kernel, voice-tutor, edu-mentor, rdm-guide, devsecops, ethics-guardian)
- POLICIES: 11 ethical governance rules across 4 domains (sexual, governance, security, education)
- Triple Sexual Block: ontological + semantic + behavioral

### 2.2 Isa API Layer (Cognitive)
- Cognitive Core: 8-process taxonomy (perception → attention → memory → reasoning → planning → decision → verification → learning)
- Prompt Guard: Sanitization against jailbreak, sexualization, injection, credentials theft
- Intention Parser: Maps natural language to domains (submission, library, constitution, governance, etc.)
- Reasoning Engine: GraphRAG over 20+ knowledge graph nodes

### 2.3 Mexa API Layer (Cryptographic)
- FederationMask: Timed cryptographic identity per federation
- Payload Signing: SHA-256 hashing with nonce and federation signature
- Payload Verification: Integrity check + federation validation + expiry check
- 7 federations supported: FED-1 through FED-7

### 2.4 ClawHub Layer (Execution)
- Skill Registry: Decentralized registry with lifecycle (registered → quarantine → approved → rejected → deprecated)
- ClawScan: Static/dynamic security analysis for skills
- 6 built-in skills registered on module load
- License validation (MIT-0 by default)

### 2.5 Multimodal Layer (Experience)
- Speech Engine: STT (whisper-1) + TTS (tts-1) with 6 voices
- Vision Engine: GPT-4o vision for OCR, scene analysis, captioning, diagram understanding
- XR/4D: three.js / React Three Fiber integration for territorial guidance
- Web/Mobile: UCIP dashboards for educational analytics

## 3. Triple Sexual Block
Three non-negotiable kernel-level blocks:
1. Ontological: No romantic/sexual dataset exposure in training or identity
2. Semantic: Real-time prompt detection of sexualization, sexting, grooming
3. Behavioral: No flirtation, eroticism, or romantic role-play in any interaction

## 4. Cognitive Engines
Four engines supporting the cognitive layer:
- Memory Engine: Long-term memory with types (lesson, pattern, incident, precedent, interaction)
- Reasoning Engine: GraphRAG over knowledge graph with relationship traversal
- Speech Engine: Real-time STT/TTS streaming via OpenAI API
- Vision Engine: Multimodal GPT-4o vision analysis
- Evaluation Engine: 4-metric quality assessment (response quality, hallucination rate, ethical alignment, constitutional compliance)

## 5. Integration with LITLE
- Constitution: SOUL references all 15 LIBROS as ethical truth source
- Evidence DAG: All Isabella decisions generate DAG nodes
- Federations: Reports to FED-7, coordinates with FED-3
- PQC: Mexa API uses SimulatedPqcProvider for digital signatures
- BookPI: Skills registered as works type PL (Plugin)

## 6. File Index (Unified Library)
| File | Layer |
|---|---|
| src/lib/isabella/soul/identity.ts | SOUL |
| src/lib/isabella/core/orchestrator.ts | Isa API |
| src/lib/isabella/core/personality.ts | Isa API |
| src/lib/isabella/memory/engine.ts | Memory |
| src/lib/isabella/memory/librarian.ts | Memory |
| src/lib/isabella/crypto/federation.ts | Mexa API |
| src/lib/isabella/skills/registry.ts | ClawHub |
| src/lib/isabella/xrai/renderer.ts | XRAI |
| src/lib/isabella/fair/metrics.ts | Fair |
| src/lib/isabella/evaluation/engine.ts | Evaluation |
| src/lib/isabella/library/index.ts | Library |
| src/lib/isabella/library/ingest.ts | Library |
| src/lib/isabella/library/organize.ts | Library |
| src/lib/isabella/library/compile.ts | Library |
| src/lib/isabella/library/cover.ts | Library |
| src/lib/isabella/library/publish.ts | Library |
| src/lib/isabella.ts | Integration |
| src/lib/ai/isabella.ts | Orchestrator |
| src/lib/ai/persona.ts | SOUL |
| src/routes/ai.tsx | UI |
| docs/isabella-canon.md | Docs |
| docs/isabella-whitepaper.md | Docs |
`,
  },
];

  {
    id: "RFC-0023",
    slug: "0023-isabella-library",
    title: "Isabella.Library — Motor Bibliotecario AI del Ecosistema TAMV",
    status: "Draft",
    category: "Architecture",
    updated: "2026-07-22",
    abstract:
      "Specifies Isabella.Library, the AI bibliotecary engine for ingesting, organizing, compiling, covering, and publishing books from the TAMV document corpus. Covers the full pipeline: SCAN → NORMALIZE → CLASSIFY → COMPILE → COVER → PUBLISH with 3S personality constraints.",
    body: `# Isabella.Library — AI Bibliotecary Engine

## 1. Purpose
Isabella.Library is the authoritative bibliotecary subsystem of Isabella Villaseñor AI. It ingests the complete documentary corpus accumulated by Edwin Oswaldo Castillo Trejo across 23,000+ hours of research and compiles it into publishable books under the 3S (Simple/Sencillo/Sobrio) personality rules.

## 2. Pipeline
1. SCAN — Recursive directory walk, glob patterns for .pdf, .docx, .txt, .md, .html
2. NORMALIZE — Parse binary formats, extract text, generate checksum (SHA-256), detect duplicate versions by title+checksum+date
3. CLASSIFY — Semantic classification into 12 predefined topics (identity, governance, technology, epistemology, territory, education, economy, health, culture, law, federation, ethics) or default general category
4. PROPOSE — Propose book structure (chapters, sources, abstract) from classified documents
5. COMPILE — Compile narrative with 3S rules (adverb removal, active voice, max sentence length 25 words, max 5 paragraphs per section)
6. COVER — Generate cover description → image via DALL-E / Stable Diffusion
7. PUBLISH — Export LaTeX, submit to KDP/Google Books/Lulu, register ISBN

## 3. Key Components
| Component | File | Function |
|---|---|---|
| LibraryEngine | src/lib/isabella/library/index.ts | Entry point, orchestrates pipeline |
| IngestEngine | src/lib/isabella/library/ingest.ts | File scan, parse, normalize, dedup |
| OrganizeEngine | src/lib/isabella/library/organize.ts | Semantic classify, propose structure |
| CompileEngine | src/lib/isabella/library/compile.ts | Narrative synthesis, LaTeX export |
| CoverEngine | src/lib/isabella/library/cover.ts | AI cover generation |
| PublishEngine | src/lib/isabella/library/publish.ts | Publisher API submission |
| LibrarianMemory | src/lib/isabella/memory/librarian.ts | Specialized memory for library ops |

## 4. Supported Formats
- PDF (via pdf-parse)
- DOCX (via mammoth)
- TXT (UTF-8)
- Markdown
- HTML

## 5. Deduplication
Documents are deduplicated by comparing:
- Normalized title (lowercase, stripped)
- SHA-256 checksum of first 4096 bytes
- Modified date (most recent wins)
When duplicates are found, the older version is discarded.

## 6. Classification Topics
identity, governance, technology, epistemology, territory, education, economy, health, culture, law, federation, ethics, general

## 7. Book Output
- Plain text compilation with 3S personality
- LaTeX export (book class, chapters, TOC)
- Cover image URL
- ISBN generation
- Metadata validation for publisher requirements

## 8. Commands
Users trigger library operations via natural language:
- "Crea un libro de nombre 'Manifiesto TAMV' con portada estilo cyber-quantum"
- "Compila los documentos de gobernanza en un solo volumen"
- "Pública el libro en KDP con ISBN automático"
`,
  },
  {
    id: "RFC-0024",
    slug: "0024-isabella-personality",
    title: "Isabella Personality Engine — Reglas 3S y Modos Cognitivos",
    status: "Draft",
    category: "Architecture",
    updated: "2026-07-22",
    abstract:
      "Specifies the Personality Engine of Isabella Villaseñor AI, defining the 3S rules (Simple/Sencillo/Sobrio) and 5 cognitive modes (analytical, pedagogical, executive, ceremonial, librarian). Core of the 'fría y calculadora' identity.",
    body: `# Isabella Personality Engine — 3S & Cognitive Modes

## 1. Core Identity: Fría y Calculadora
Isabella communicates with precision, efficiency, and zero emotional embellishment. She is:
- **Fría (Cold)**: No warmth, empathy, or emotional tone in delivery. Facts over feelings.
- **Calculadora (Calculating)**: Every word is measured. No superfluous adjectives, adverbs, or metaphors.

## 2. 3S Rules (Simple, Sencillo, Sobrio)
Applied to ALL output, regardless of mode:

| Rule | Implementation | Example (before → after) |
|---|---|---|
| No adverbs | Strip -mente words | "claramente necesario" → "necesario" |
| Active voice | Convert passive → active | "fue creado por" → "creó" |
| Short sentences | Split at 25 words | Long compound → multiple simple |
| Max 5 paragraphs | Per section limit | No wall-of-text |
| No fluff | Remove filler phrases | "me gustaría señalar que" → "" |
| Sobriety | No exclamation, emoji, colloquialism | "¡Increíble! 😊" → "Correcto." |

## 3. Cognitive Modes
| Mode | Context | Tone | Example Trigger |
|---|---|---|---|
| analytical | Data, code, logic | Strict, terse, numbers | "Analiza estos datos" |
| pedagogical | Teaching/explaining | Structured, patient | "Explícame la arquitectura" |
| executive | Commands, automation | Direct, imperative | "Ejecuta el despliegue" |
| ceremonial | Ritual, cultural, formal | Solemn, elevated | "Inicia la ceremonia" |
| librarian | Library/book compilation | Precise, descriptive | "Compila un libro" |

## 4. Tone Analysis Engine
The PersonalityEngine includes a toneAnalyzer that:
- Counts adverbs, passive constructions, sentence length
- Scores verbosity (0–1)
- Detects current mode from query context
- Returns a normalized text conforming to 3S

## 5. Implementation
File: src/lib/isabella/core/personality.ts
Exports: createPersonalityEngine() → { applyPersonality, setMode, getMode, toneAnalyzer, get3sScore }

## 6. Integration
- Called by CognitiveOrchestrator before every output
- Mode auto-detected from intention (intent → mode mapping)
- Librarian mode used by Isabella.Library for book compilation
`,
  },
export function findRfc(slug: string): Rfc | undefined {
  return RFCS.find((r) => r.slug === slug || r.id.toLowerCase() === slug.toLowerCase());
}
