<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# LITLE — Open Science Epistemic Platform

## Vision
The first epistemological literature platform for Human-Machine knowledge.  
Filters the best of Open Science across 9 quality dimensions so that both
human scholars and AI agents can discover only the most reliable knowledge.

## Architecture

### Core Stack
- **TanStack Start** (React SSR framework)
- **Tailwind CSS v4** (with `@theme inline`, `@utility`, `@layer base`)
- **Supabase** (auth + database)
- **Vite** (build tool)

### Key Directories
- `src/lib/epistemic/` — Epistemological filtering engine (types, filters, aggregation)
- `src/lib/verify/` — Verification engine (Merkle root, evidence integrity, PKI/OCSP)
- `src/lib/litle/` — LITLE-ID core modules (id.ts → `LitleIdEngine`, sign.ts, canonical.ts)
- `src/lib/evidence.functions.ts` — Server-side evidence chain functions
- `src/lib/pipeline.functions.ts` — Knowledge reconstruction pipeline
- `src/content/rfcs.ts` — RFC specifications (standards)
- `src/routes/` — Application routes
  - `index.tsx` — LATAM-focused institutional landing (Real del Monte, Hidalgo)
  - `library.tsx` — Academic library table with LITLE-ID search/filter
  - `verify.$litleId.tsx` — Datacite-style resolver for LITLE-IDs
  - `governance.tsx` — 7 Federations TAMV governance model
  - `submit.tsx` — Zenodo/Figshare-style public submission form
  - `standard/` — Standards Council pages (RFCs, certification, Open Science)
  - `discovery.tsx` — Curated library browser
  - `certificate.$litleId.tsx` — Digital Academic Certificate display

### CSS Conventions (Tailwind v4)
- All custom colors go in `@theme inline { --color-*: var(--*); }`
- All custom utilities use `@utility` (NO `@apply` inside utilities)
- Component styles use utility classes directly
- The `gilt` accent color is `oklch(0.78 0.14 75)`
- Crystal Glass and Obsidian Dark palettes are in `:root`

### Epistemic Scoring
9 dimensions weighted by importance:
- methodological_rigor (20%), reproducibility (18%), citation_integrity (15%)
- peer_review_status (12%), data_transparency (12%), ai_provenance (10%)
- longevity_potential (8%), epistemological_novelty (5%)
- human_machine_readability (metadata-only)

Tiers: platinum (≥4.0) > gold (≥3.5) > silver (≥2.5) > bronze (≥1.5) > unrated

## Quantum Fortification (PQC Layer)

### Post-Quantum Cryptography Suite
The LITLE platform implements a comprehensive post-quantum security layer:

| Component | Algorithm | Status |
|-----------|-----------|--------|
| **Hash** | SHAKE256 (FIPS 202) | Active — `@noble/hashes/sha3` |
| **PQC Signature** | ML-DSA-87 (CRYSTALS-Dilithium5) | Active — `pqc.ts` |
| **Container Classic** | LITLE-512B (512 bytes) | Backward compatible |
| **Container PQC** | LITLE-8KB (8192 bytes) | New — accommodates ML-DSA key sizes |
| **Key Generation** | ML-DSA.KeyGen() via SHAKE256 KDF | Active |

### Dual-Stack DAC (RFC-0015 v2)
The Digital Academic Certificate now supports three suites:
- **classic**: SHA-256 + HMAC-SHA-512 (backward compatible)
- **pqc**: SHAKE256 hashing + ML-DSA-87 (Dilithium5) signatures
- **dual**: Both classical and PQC signatures emitted simultaneously

### Quantum Epistemic Filter (`src/lib/epistemic/quantum-filter.ts`)
Quantum-inspired scoring engine using simulated annealing:
- **Objective**: Maximize quality / balance dimensions / Pareto frontier
- **Annealing**: 1000-iteration SA with exponential temperature decay
- **Entanglement**: Computes pairwise correlations between epistemic dimensions
- **Confidence**: Entropy-based confidence scoring per work
- **Weight Optimization**: Quantum annealing simulation for optimal dimension weights

### LITLE-ID PQC Profile (`L-PQC.v1`)
- New crypto profile `L-PQC.v1` alongside existing `L-512.v1` / `L-1024.v1`
- `deriveLitleId()` uses SHAKE256 instead of SHA-256 when profile is `L-PQC.v1`
- `LitleIdEngine.verify()` reports `pqcCapable` flag

### Container Migration
- Classic: 512B → Bech32m string (~900 chars)
- PQC: 8192B → Bech32m string (~13K chars)
- `ContainerProfile` type: `"classic" | "pqc"` auto-detected from byte length

### Key Files
- `src/lib/litle/pqc.ts` — PQC Provider (Dilithium5Provider), SHAKE256 utilities, KDF
- `src/lib/litle/sign.ts` — `merkleAstHashPqc()`, `coverArtHashPqc()`, `derivePqcSeedLarge()`
- `src/lib/epistemic/quantum-filter.ts` — `QuantumEpistemicFilter` class
- `src/lib/verify/certificate.ts` — `suite: "classic" | "pqc" | "dual"` support

### Digital Academic Certificate (DAC) — RFC-0015
Unified credential combining 4 verification methodologies + PQC signatures:

1. **CSV Generator** (`src/lib/verify/csv.ts`) — from keensoft/csv-generator
   32-char Secure Verification Code: `LTL` prefix + 21 hash chars (Base36 SHA-256) + 7 ID chars + 1 randomness config
   Character positions shuffled via seeded permutation. Tamper-evident.

2. **Authorship GMM** (`src/lib/verify/authorship.ts`) — from albino-pav/P4 speaker verification
   8-feature statistical writing profile: word length, sentence complexity, vocabulary richness,
   function word ratio, paragraph length, passive voice ratio. Gaussian likelihood scoring.

3. **Data Source Verification** (`src/lib/verify/source-verification.ts`) — from martinszy/verificacion_de_datos
   5-step pipeline: Source Identification → Content Integrity → URL Check → Cross-Reference → Provenance
   Weighted score → verified (≥80) / partial (≥50) / unverified (<50)

4. **Evidence Chain** (`src/lib/verify/engine.ts`) — Merkle-DAG root hash, SHA-256 integrity
   PKI/OCSP-style verification (inspired by firmafiel and gobmx-sfp/firmafiel)

### PKI Verification (from firmafiel)
- Certificate buffer to PEM conversion
- OCSP status verification (good/revoked/unknown)
- RFC validation against certificates
- PKCS#7 signature verification

## Submission & Quarantine Pipeline

### Workflow
1. **Submit** — Author uploads work via `/submit` form
2. **Quarantine** — Document enters `quarantine` status immediately
3. **Triangulation** — Automated cross-reference against:
   - ORCID registry (pub.orcid.org)
   - DOI/CROSSREF (api.crossref.org)
   - ISNI registry (isni.org/api)
   - Web similarity (DuckDuckGo API)
   - LITLE library (existing works)
4. **Decision**:
   - **GREEN** (no matches) → Indexed, LITLE-ID issued, DAC generated
   - **RED** (duplicate found) → Held in quarantine, author notified with references
   - **INCONCLUSIVE** → Escalated to curation federation for manual review

### Key Files
- `src/lib/submission/types.ts` — SubmissionDocument, TriangulationReport, QuarantineDecision, PipelineResult
- `src/lib/submission/quarantine.ts` — Quarantine manager, status transitions
- `src/lib/submission/triangulation.ts` — AI investigation engine (ORCID/DOI/ISNI/Web)
- `src/lib/submission/pipeline.ts` — Orchestration: submit → quarantine → triangulate → index/reject

### Routes Added
- `/submit` — Public submission form with quarantine pipeline integration
- `/_authenticated/submissions` — User dashboard for tracking submissions
- `/admin/quarantine` — Curation Federation admin panel (FED-5)
- `/auth` — Supabase-based email/password auth (signin/signup)

### Security Hardening
- All cryptographic functions use constant-time comparison
- SHAKE256 (FIPS 202) replaces SHA-256 for PQC profiles
- Merkle trees use typed-array concatenation (not string concat)
- Epistemic scoring is deterministic (no `Math.random()`)
- PQC verify() uses key-committing hash construction (not self-deriving)
- Container profiles are validated by magic field, not just length heuristic
- Author secret must be set via environment variable (no predictable fallback)

### Dev Commands
```bash
bun dev        # Start dev server
bun build      # Production build
bun run lint   # ESLint
bun run format # Prettier
```
