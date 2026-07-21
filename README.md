# LITLE — Standards for Preserving Knowledge. Verifying Legacy.

LITLE is a proposed standard and platform for the **epistemological curation, cryptographic verification, and digital certification** of Open Access academic knowledge. It combines a 9-dimensional epistemic filter, a post-quantum signature scheme (ML-DSA-87 / SHAKE256), a quarantine-based submission pipeline with AI triangulation, and a federated governance model (7 federations, 5/7 quorum).

> **Status:** Pre-production. RFCs are draft specifications. See `/docs/` for whitepaper, threat model, and benchmarks.

---

## Core Proposal

| Function | Description |
|---|---|
| **Preservation** | Academic works assigned a durable cryptographic identity (LITLE-ID) |
| **Verification** | Content integrity, authorship stylometry, source provenance, evidence chain |
| **Certification** | Dual-stack DAC (classical SHA-256 + PQC ML-DSA-87) |
| **Filtering** | 9 epistemic dimensions scored via simulated annealing optimization |
| **Quarantine** | Triangulation against ORCID, DOI/Crossref, ISNI, web before indexing |
| **Governance** | 7 federations, 5/7 quorum for standard changes (RFC-0010) |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         LITLE PLATFORM                            │
├──────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │   CSV     │  │Authorship│  │  Source  │  │   Evidence       │ │
│  │ Generator │  │   GMM    │  │Verific.  │  │   Chain          │ │
│  │ (32 char) │  │(8 feats) │  │(5 steps) │  │(SHAKE256 Merkle) │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘ │
├──────────────────────────────────────────────────────────────────┤
│  Epistemic Engine: 9-dim scoring · Simulated Annealing (1000 it) │
│  Quantum Correlation: Pairwise entanglement energy per work      │
├──────────────────────────────────────────────────────────────────┤
│  PQC Suite: ML-DSA-87 (Dilithium5) + SHAKE256 (FIPS 202)        │
│  Dual-Stack DAC: classical (HMAC-SHA-512) + PQC (ML-DSA)        │
│  Container: 512B classic / 8KB PQC · Bech32m serialization      │
├──────────────────────────────────────────────────────────────────┤
│  Quarantine Pipeline: Submit → ORCID/DOI/ISNI/Web → Index/Reject │
└──────────────────────────────────────────────────────────────────┘
```

### Stack

| Layer | Technology |
|---|---|
| **Framework** | TanStack Start (React SSR) |
| **Styling** | Tailwind CSS v4 — Obsidian & Crystal Glass palette |
| **Auth/DB** | Supabase (PostgreSQL + RLS + Auth) |
| **Build** | Vite 8 |
| **Classic Crypto** | @noble/hashes (SHA-256, SHA-512, HMAC) |
| **PQC Crypto** | @noble/hashes/sha3 (SHAKE256), ML-DSA-87 reference |
| **Identity** | LITLE-ID (RFC-0001): URI + Human + Canonical |

---

## Verification Methodologies

### 1. CSV — Secure Verification Code (keensoft/csv-generator)
`LTL` prefix + 21-char Base36 SHA-256 hash + 7-char ID + 1-char randomness = 32 chars total. Seeded Fisher-Yates permutation.

### 2. Authorship GMM (albino-pav/P4)
8-feature stylometric profile: word/sentence length, vocabulary richness, function word ratio, passive voice. Gaussian likelihood with FAR-optimized threshold.

### 3. Source Verification (martinszy/verificacion_de_datos)
5-step pipeline: Identify → Hash → URL → Cross-Reference → Provenance. Score: verified (≥80) / partial (≥50) / unverified (<50).

### 4. Evidence Chain (RFC-0008)
SHAKE256 Merkle-DAG: SOURCE, PROMPT, MODEL, REVISION, QUOTE nodes. Root hash anchored in LITLE container Block A.

---

## Post-Quantum Cryptography

| Component | Algorithm | Status |
|---|---|---|
| **Hash** | SHAKE256 (FIPS 202) | Implemented |
| **Signature** | ML-DSA-87 (CRYSTALS-Dilithium5) | Reference implementation |
| **Classic Container** | LITLE-512B (512 bytes) | Compatible |
| **PQC Container** | LITLE-8KB (8192 bytes) | New |
| **DAC Suite** | classic / pqc / dual | Three modes |

See [`docs/threat-model.md`](docs/threat-model.md) for cryptographic threat analysis.

---

## Epistemic Scoring

9 dimensions with weights determined via simulated annealing (1000 iterations, exponential decay, Pareto frontier optimization):

| Dimension | Weight | Description |
|---|---|---|
| Methodological Rigor | 20% | Experimental/analytical design quality |
| Reproducibility | 18% | Pipeline reproducibility score |
| Citation Integrity | 15% | Reference accuracy and relevance |
| Peer Review Status | 12% | Level of peer validation |
| Data Transparency | 12% | Data availability and documentation |
| AI Provenance | 10% | Model/prompt/documentation transparency |
| Longevity Potential | 8% | Format stability and preservation plan |
| Epistemological Novelty | 5% | Contribution to knowledge framework |

Thresholds: Platinum ≥ 4.0 / Gold ≥ 3.5 / Silver ≥ 2.5 / Bronze ≥ 1.5

---

## Quarantine Pipeline

```
Submit → QUARANTINE → Triangulation → GREEN  → Index + LITLE-ID
                                        → RED    → Reject + references
                                        → ?      → Escalate to FED-5
```

**Triangulation sources:** ORCID, Crossref/DOI, ISNI, DuckDuckGo web similarity, LITLE library dedup.

---

## Project Structure

```
src/
├── content/rfcs.ts              # RFC draft specifications
├── lib/
│   ├── epistemic/               # 9-dim scoring, quantum filter
│   ├── verify/                  # CSV, GMM, source, certificate
│   ├── litle/                   # ID, sign, PQC, container, canonical
│   └── submission/              # Quarantine, triangulation, pipeline
├── routes/                      # Landing, library, verify, certificate,
│                                #   submit, governance, standard, admin
└── styles.css                   # Obsidian & Crystal Glass palette
docs/
├── whitepaper.md                # Technical whitepaper (draft)
├── threat-model.md              # Security threat model
└── benchmark.md                 # Comparison vs existing systems
```

---

## Routes

| Route | Description |
|---|---|
| `/` | Landing page |
| `/auth` | Sign in / Sign up |
| `/dashboard` | Author dashboard |
| `/submissions` | Submission tracker |
| `/library` | Academic library |
| `/verify/$litleId` | Resolver |
| `/certificate/$litleId` | DAC view |
| `/submit` | Public submission |
| `/governance` | 7 Federations |
| `/standard` | Standards Council |
| `/admin/quarantine` | FED-5 panel |

---

## Dev

```bash
bun install
# .env: SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, LITLE_AUTHOR_SECRET
bun dev        # Development
bun build      # Production build
bun run lint   # ESLint
```

---

## References

- RFC-0001: LITLE-ID Specification (`src/content/rfcs.ts`)
- RFC-0008: Evidence Chain (`src/content/rfcs.ts`)
- RFC-0010: Federated Governance (`src/content/rfcs.ts`)
- RFC-0014: Open Science Curation (`src/content/rfcs.ts`)
- RFC-0015: Digital Academic Certificate (`src/content/rfcs.ts`)
- Whitepaper: `docs/whitepaper.md`
- Threat Model: `docs/threat-model.md`
- Benchmark: `docs/benchmark.md`

---

## License

Open Source. The LITLE standard is public and versioned in git. RFCs survive any implementation.
