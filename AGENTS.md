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

### Digital Academic Certificate (DAC) — RFC-0015
Unified credential combining 4 verification methodologies:

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

### Dev Commands
```bash
bun dev        # Start dev server
bun build      # Production build
bun run lint   # ESLint
bun run format # Prettier
```
