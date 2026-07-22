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

## 8-Layer Hardening (H1–H8)

### H1 — CI/CD Pipeline
- `.github/workflows/ci.yml`: 4 jobs (quality, test, security, build) with concurrency cancellation
- Quality: lint + Prettier check + typecheck + knip
- Test: vitest + coverage upload
- Security: bun audit + SBOM generation
- Build: production build (depends on quality, test, security passing)

### H2 — TypeScript & Environment
- `tsconfig.json`: max strict mode (exactOptionalPropertyTypes, noUncheckedIndexedAccess, noImplicitOverride, useUnknownInCatchVariables, noUnusedLocals, noUnusedParameters)
- `src/lib/env.ts`: Runtime env validation with REQUIRED_SERVER_VARS, OPTIONAL_SERVER_VARS, REQUIRED_CLIENT_VARS
- `.env.example`: Documents all vars (Supabase, OpenAI, LITLE, CORS, observability)

### H3 — Testing & Quality
- `vitest.config.ts`: v8 coverage, 80% thresholds, globals enabled
- `knip.json`: Dead code detection with ignore rules for shadcn/ui, generated files, and dev tooling
- `src/lib/**/*.test.ts`: Tests for pqc (11), id (8), gates (9), hybrid-shield (8)

### H4 — Security Headers & Rate Limiting
- `src/lib/security-headers.ts`: CSP (default-src 'self', frame-ancestors 'none', strict connect-src), HSTS 2y preload, COOP/COEP same-origin, X-Frame-Options DENY, Permissions-Policy restrictive
- `src/lib/rate-limit.ts`: Per-IP rate limiting with per-path windows (100 general, 10 /submit, 20 /auth, 200 /verify)
- Integrated in `src/server.ts` for all SSR requests

### H5 — Supabase & Auth
- `src/integrations/supabase/client.ts`: Singleton via Proxy, lazy init, custom fetch for new API key format
- `src/integrations/supabase/client.server.ts`: Server-only admin client with SERVICE_ROLE_KEY — never exposed to browser
- `src/integrations/supabase/auth-middleware.ts`: Bearer token verification via `supabase.auth.getUser()`, extracts userId + claims
- `src/integrations/supabase/auth-attacher.ts`: Client-side middleware attaches Bearer token to serverFn RPCs

### H6 — Component Optimization
- `useMemo` for filtered lists (library.tsx: types, feds, filtered)
- `useMemo` for static arrays derived from data
- shadcn/ui components are pre-optimized by Radix UI (minimal re-renders)
- SSR via TanStack Start reduces client JS bundle

### H7 — Observability
- `src/lib/logger.ts`: Structured JSON logging with levels (debug/info/warn/error), module tags, Error capture, ISO timestamps
- `src/lib/error-capture.ts`: Global error/unhandledrejection capture with 5s TTL for h3 SSR recovery
- `src/server.ts`: Structured logging replaces console.error throughout SSR entry point

### H8 — Deployment Hardening
- `src/lib/cors.ts`: Allowed origin whitelist, CORS headers (methods, headers, credentials, max-age), preflight detection
- `Dockerfile`: Multi-stage build, non-root user (uid 1001), `--frozen-lockfile`
- `docker-compose.yml`: read_only rootfs, no-new-privileges, cap_drop ALL, healthcheck, tmpfs /tmp
- Environment validation at boot (missing vars logged before server starts)

## Isabella Villaseñor AI™ — Sistema Operativo Cognitivo Soberano

**Isabella Villaseñor** es el Sistema Operativo Cognitivo Soberano (Zero-Trust Distributed Cognitive Operating System) del ecosistema TAMV/LITLE. Orquesta 5 capas: SOUL, Isa API, Mexa API, ClawHub y Multimodal.

### Arquitectura por Capas

```
┌─────────────────────────────────────────────────────────────────┐
│  MULTIMODAL: Voz (STT/TTS) | Visión (OCR/IA) | XR/4D | Web    │
├─────────────────────────────────────────────────────────────────┤
│  CLAWHUB: Registro de Skills | ClawScan | Cuarentena | Plugins │
│  ENGINES: Memory | Reasoning | Speech | Vision | Evaluation    │
├─────────────────────────────────────────────────────────────────┤
│  ISA API: Cognitive Core | Reasoning Engine | GraphRAG | Guard │
├─────────────────────────────────────────────────────────────────┤
│  MEXA API: Firmas PQC | Verificación | Máscara de Federación  │
├─────────────────────────────────────────────────────────────────┤
│  SOUL: Identidad | AGENTS (6 roles) | POLICIES (11 reglas)    │
│  + Constitución LITLE (15 LIBROS) como fuente de verdad ética │
└─────────────────────────────────────────────────────────────────┘
```

### Archivos — Librería Unificada (`src/lib/isabella/`)

| Archivo | Capa | Función |
|---|---|---|
| **`src/lib/isabella/index.ts`** | Entry | Exportaciones unificadas de toda la librería |
| **`src/lib/isabella/types.ts`** | Types | Tipos compartidos en todo el ecosistema |
| `src/lib/isabella/core/orchestrator.ts` | Isa API | Orquestador cognitivo: sanitización, intención, personalidad, políticas |
| `src/lib/isabella/core/personality.ts` | Isa API | Motor de personalidad "fría y calculadora" con reglas 3S (Simple, Sencillo, Sobrio) |
| `src/lib/isabella/soul/identity.ts` | SOUL | SOUL (identidad), 7 AGENTS, 13 POLICIES de gobernanza |
| `src/lib/isabella/memory/engine.ts` | Memory | Memoria LTM con tipos (session/persona/ecosystem/cultural) |
| `src/lib/isabella/memory/librarian.ts` | Memory | Memoria especializada para el motor bibliotecario |
| `src/lib/isabella/crypto/federation.ts` | Mexa API | FederationMask, firma/verificación PQC, 7 federaciones |
| `src/lib/isabella/skills/registry.ts` | ClawHub | Registro de skills + 7 built-in (nuevo: isabella-librarian) |
| `src/lib/isabella/xrai/renderer.ts` | XRAI | Pipeline de renderizado XR/holográfico |
| `src/lib/isabella/fair/metrics.ts` | Fair | Métricas de equidad, bias detection, guardrails |
| `src/lib/isabella/evaluation/engine.ts` | Evaluation | 4 métricas: calidad, alucinación, ética, cumplimiento constitucional |
| **`src/lib/isabella/library/index.ts`** | Library | Motor bibliotecario AI — punto de entrada |
| **`src/lib/isabella/library/ingest.ts`** | Library | Escaneo, parseo, normalización, deduplicación de archivos |
| **`src/lib/isabella/library/organize.ts`** | Library | Clasificación semántica en 12 categorías → capítulos |
| **`src/lib/isabella/library/compile.ts`** | Library | Compilación narrativa + exportación LaTeX |
| **`src/lib/isabella/library/cover.ts`** | Library | Portadas por descripción (Stable Diffusion / DALL-E) |
| **`src/lib/isabella/library/publish.ts`** | Library | Publicación en KDP, Google Books, Lulu, marketplace interno |
| `src/lib/isabella.ts` | Integration | Re-exporta todo para plataforma LITLE |
| `src/routes/ai.tsx` | UI | Chat con selector ES/EN y panel de status arquitectónico |
| `docs/isabella-canon.md` | Docs | **Documento Canónico Unificado** — TODO integrado |
| `docs/isabella-whitepaper.md` | Docs | Whitepaper del Sistema Operativo Cognitivo Soberano |

### Skills Internos (Built-in — 7 skills)

| Skill | Federación | Función |
|---|---|---|
| isabella-voice-tutor | FED-6 | Voz bidireccional para clases, evaluación oral, coaching |
| isabella-edu-mentor | FED-6 | Tutor cognitivo adaptativo con GraphRAG |
| isabella-rdm-guide | FED-4 | Guía turística/cultural con soporte XR/3D |
| isabella-devsecops | FED-1 | Auditoría de repositorios, CI/CD, parches |
| isabella-ethics-guardian | FED-7 | Monitoreo ético, triple bloqueo sexual, registro en DAG |
| isabella-heptafederated-maestro | FED-3 | Núcleo maestro de gobernanza y orquestación |
| **isabella-librarian** | **FED-4** | **Motor bibliotecario AI: ingesta, compilación, publicación** |

### Isabella.Library — Motor Bibliotecario AI

El módulo bibliotecario de Isabella puede absorber el acervo documental completo de Edwin (miles de archivos PDF, DOCX, TXT, MD en múltiples versiones) y transformarlo en libros cohesivos.

**Comando de usuario:**
```
> "Crea un libro de nombre 'Manifiesto TAMV' con portada estilo cyber-quantum cyan/dorado"
```

**Flujo:** SCAN → NORMALIZE → EMBED → CLASSIFY → PROPOSE → COMPILE (con reglas 3S) → COVER → PUBLISH

**Capacidades:**
- Parseo de PDF, DOCX, TXT, MD, HTML
- Deduplicación de versiones (detecta archivo más reciente entre duplicados)
- Clasificación semántica en 12 categorías predefinidas + categoría general
- Compilación narrativa con motor de personalidad 3S
- Portadas por descripción textual (Stable Diffusion / DALL-E)
- Exportación a LaTeX y PDF
- Publicación en Amazon KDP, Google Books, Lulu, y marketplace interno TAMV
- ISBN automático

### Triple Bloqueo Sexual
1. **Ontológico**: No entrenada como objeto de deseo. Exclusión de datasets románticos/sexuales.
2. **Semántico**: Prompt Guard detecta sexualización, sexting, grooming → bloqueo + redirección.
3. **Conductual**: No coquetea, no erotiza, tono profesional en todos los canales.

No son plugins opcionales — son reglas del kernel de gobernanza (POL-SEX-001/002/003).

### Dependencias
- `OPENAI_API_KEY` — requerido para chat, speech, vision, portadas
- `MEXA_API_SECURE_KEY` — opcional, para firma criptográfica
- Modelo por defecto: `gpt-4o` (configurable vía `OPENAI_MODEL`)
- Vector DB (FAISS local o Pinecone) para Library

### Integración
- `/ai` — Interfaz de chat con panel de status arquitectónico
- Cada consulta pasa por: Isa API (sanitize) → Personality Engine → Policy Check → Output
- La Library responde a comandos en lenguaje natural para compilar libros
- Las decisiones de Isabella generan nodos en el Evidence DAG de LITLE

### File Index by Hardening Layer
| Layer | Files Created/Modified |
|---|---|
| H1 | `.github/workflows/ci.yml` (new), `package.json` (existing) |
| H2 | `src/lib/env.ts` (new), `tsconfig.json`, `.env.example` |
| H3 | `knip.json` (new), `vitest.config.ts` (existing) |
| H4 | `src/lib/security-headers.ts`, `src/lib/rate-limit.ts`, `src/server.ts` |
| H5 | `src/integrations/supabase/auth-middleware.ts` |
| H6 | `src/routes/library.tsx` (useMemo) |
| H7 | `src/lib/logger.ts` (new), `src/lib/error-capture.ts`, `src/server.ts` |
| H8 | `src/lib/cors.ts` (new), `src/server.ts`, `Dockerfile`, `docker-compose.yml`, `.env.example` |

### Dev Commands
```bash
bun dev          # Start dev server
bun build        # Production build
bun run lint     # ESLint
bun run format   # Prettier
bun run typecheck # TypeScript check (no emit)
bun run test     # Run vitest
bun run coverage # Coverage report
bun run check    # lint + typecheck + test
bun run ci       # check + build
bun run audit    # Dependency audit
bun run knip     # Dead code analysis
bun run sbom     # Generate SBOM
```
