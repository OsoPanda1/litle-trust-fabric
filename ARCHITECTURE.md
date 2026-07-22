# LITLE Architecture

## Overview

LITLE uses a **server-rendered React frontend** (TanStack Start) with a **serverless backend** (Nitro via Vite) and an optional **AI agent layer** (OpenAI). The Supabase client runs both on the server (SSR data fetching) and in the browser (auth, real-time).

```
┌──────────────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────┐  │
│  │ TanStack  │  │ React    │  │ Tailwind │  │ Supabase Auth  │  │
│  │ Router    │  │ Query    │  │ CSS v4   │  │ Client (anon)  │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────────────┘  │
├──────────────────────────────────────────────────────────────────┤
│                    SERVER (Nitro / SSR)                           │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │  TanStack Start SSR  │  Server Functions (createServerFn)   ││
│  │                      │  - Supabase queries (service_role)   ││
│  │                      │  - PQC signing (LITLE-AUTHOR-SECRET) ││
│  │                      │  - OpenAI API calls (server-only)    ││
│  │                      │  - Epistemic scoring engine          ││
│  └──────────────────────────────────────────────────────────────┘│
├──────────────────────────────────────────────────────────────────┤
│                   LITLE CORE (Shared Libraries)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────┐  │
│  │ PQC      │  │ Quantum  │  │ Verify   │  │ Submission     │  │
│  │ Layer    │  │ Layer    │  │ Engine   │  │ Pipeline       │  │
│  │ (pqc.ts) │  │ (gates.ts│  │ (csv,    │  │ (quarantine,   │  │
│  │          │  │  shield, │  │  gmm,    │  │  triangulation │  │
│  │          │  │  zero-   │  │  source, │  │  pipeline)     │  │
│  │          │  │  trust)  │  │  cert)   │  │                │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────────────┘  │
├──────────────────────────────────────────────────────────────────┤
│                  AI AGENT LAYER (Optional)                        │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │  OpenAI GPT-4o     │  Embeddings (text-embedding-3-small)   ││
│  │  - Epistemic       │  - Semantic dedup                       ││
│  │    scoring         │  - Author similarity                    ││
│  │  - Triangulation   │  - Content clustering                   ││
│  │    enhancement     │                                         ││
│  └──────────────────────────────────────────────────────────────┘│
├──────────────────────────────────────────────────────────────────┤
│                    DATA LAYER                                      │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │  Supabase (PostgreSQL + RLS)                                  ││
│  │  Tables: sources, evidence_records, evidence_nodes,          ││
│  │          epistemic_scores, submissions, users                 ││
│  │  Auth: Supabase Auth (email/password)                         ││
│  └──────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────┘
```

## Layer Details

### 1. Frontend (Client)

| Technology | Purpose |
|---|---|
| TanStack Router | File-based routing with SSR |
| React Query | Server state, caching |
| Tailwind CSS v4 | Obsidian & Crystal Glass palette |
| Supabase Auth Client | Session management (anon key) |
| Lucide React | Icon system |

**Key constraints:**
- VITE_* env vars only — never expose secrets to the browser
- Server functions handle all sensitive operations
- Auth middleware protects _authenticated routes

### 2. Backend (Server)

| Technology | Purpose |
|---|---|
| TanStack Start SSR | Server-side rendering |
| Nitro (via Vite) | Serverless runtime, API routes |
| Supabase Client (service_role) | Admin DB access (server-only) |
| Server Functions | `createServerFn()` for RPC-style APIs |

**Key modules:**
- `src/lib/pipeline.functions.ts` — Knowledge reconstruction pipeline
- `src/lib/evidence.functions.ts` — Evidence chain CRUD
- `src/lib/ai/openai.ts` — OpenAI integration (server-only)
- `src/lib/submission/pipeline.ts` — Quarantine pipeline orchestration

### 3. Cryptographic Layer

| Module | Function |
|---|---|
| `src/lib/litle/pqc.ts` | ML-DSA-87, SHAKE256, KDF, HMAC |
| `src/lib/litle/sign.ts` | Merkle tree signatures, cover art hashing |
| `src/lib/litle/id.ts` | LITLE-ID generation, parsing, verification |
| `src/lib/litle/litle.ts` | Container (512B classic / 8KB PQC) |
| `src/lib/litle/canonical.ts` | Bech32m encoding |
| `src/lib/quantum/gates.ts` | 48 quantum gate operations |
| `src/lib/quantum/hybrid-shield.ts` | 5-layer hybrid encryption shield |
| `src/lib/quantum/zero-trust.ts` | Double zero-trust verification |
| `src/lib/quantum/interconnect.ts` | Quantum data interconnection |

### 4. AI Agent Layer

| Agent | Trigger | Model | Output |
|---|---|---|---|
| Epistemic Scorer | `aiScoreWork` | gpt-4o | 9-dimension JSON scores |
| Triangulation Enhancer | `aiEnhanceTriangulation` | gpt-4o | Duplicate probability, ethical analysis |
| Embedding Generator | client.embed() | text-embedding-3-small | 1536-dim vector for similarity |

**Design principles:**
- All AI calls happen server-side (API key never reaches the browser)
- Each agent is wrapped in a `createServerFn()` for type-safe invocation
- AI is optional — core functionality works without it
- Results are cached; AI failures fall back to deterministic scoring

### 5. Data Layer

| Table | Purpose | RLS |
|---|---|---|
| `sources` | Ingested source files | User = owner |
| `evidence_records` | Evidence chain records | User = owner |
| `evidence_nodes` | Merkle-DAG nodes | User = owner |
| `epistemic_scores` | Cached scores | Public read |
| `submissions` | Quarantine pipeline | User = owner |

---

## Request Flow

### Read Path (SSR)
```
Browser → TanStack SSR → createServerFn() → Supabase (service_role) → Response → HTML
```

### Write Path (Submission)
```
Browser → /submit form → createServerFn() → Quarantine → Triangulation
  → AI Enhancement (optional) → Index/Reject → Response
```

### Verification Path
```
Browser → /verify/<litleId> → createServerFn() → Supabase query
  → Evidence Chain verification → Quantum fingerprint check
  → DAC generation → Response
```

---

## Security Boundaries

```
┌──────────────────────┐
│    Browser           │  VITE_* env vars only
│    (untrusted)       │  Supabase anon key only
└────────┬─────────────┘
         │ createServerFn()
         ▼
┌──────────────────────┐
│    Server (trusted)  │  OPENAI_API_KEY (never to client)
│    (Nitro SSR)       │  SUPABASE_SERVICE_ROLE_KEY (never to client)
│                      │  LITLE_AUTHOR_SECRET (never to client)
└────────┬─────────────┘
         │ Supabase service_role
         ▼
┌──────────────────────┐
│    PostgreSQL         │  RLS policies enforce row-level auth
│    (Supabase)         │  Service role bypasses RLS
└──────────────────────┘
```

## Deployment Targets

| Platform | Entry | Notes |
|---|---|---|
| **Vercel** | `vercel.json` → Nitro serverless | Best for SSR, automatic HTTPS |
| **Railway** | `railway.json` → Dockerfile | Good for persistent services |
| **Render** | `render.yaml` → Dockerfile | Web service + cron |
| **Docker** | `Dockerfile` → Node 22 | Portable, self-hosted |
| **Cloudflare** | `wrangler.toml` | Requires Cloudflare adapter |

## Institutional Constitution

The LITLE platform operates under a formal Institutional Constitution composed of 15 LIBROS covering institutional philosophy, governance, rights, obligations, AI policy, and federation structure.

### Artifacts
- **RFC-0019** (`src/content/rfcs.ts`): Full Constitution text as an RFC specification
- **RFC-0020** (`src/content/rfcs.ts`): Amendment lifecycle with 5/7 quorum and DAG recording
- **`src/content/constitution.ts`**: TypeScript type definitions and Libro index
- **`src/content/constitution.yaml`**: Machine-readable manifest with LITLE-ID registration
- **LITLE-ID**: `LTL-2026-BK-CONSTITUCION-LITLE-0001` (type BK)

### LIBRO Index
| Code | Title | Category |
|---|---|---|
| LITLE-POL-001 | Institutional Purpose | POL |
| LITLE-PHI-001 | Institutional Philosophy | PHI |
| LITLE-CON-001 | Code of Ethics | CON |
| LITLE-CON-002 | Principles of Conduct | CON |
| LITLE-ATH-001 | Authorship | ATH |
| LITLE-ATH-002 | Citation and Integrity | ATH |
| LITLE-ATH-003 | Recognition and Attribution | ATH |
| LITLE-DUT-001 | Rights of Authors | DUT |
| LITLE-DUT-002 | Obligations of Authors | DUT |
| LITLE-AI-001 | AI Governance | AI |
| LITLE-GOV-001 | 7 Federations Governance | GOV |
| LITLE-EVD-001 | Evidence DAG | EVD |
| LITLE-PRS-001 | BookPI & Ledger | PRS |
| LITLE-POL-002 | Neutrality and Sovereignty | POL |
| LITLE-COM-001 | Community | COM |

### Formal Definition
The Constitution operates as a **formal constitutive model** defined by the tuple:
```
C = (A, Σ, R, D, E)
```
- **A** = 42 constitutional articles with category (PRINCIPIO/NORMA/SANCION/PROCEDIMIENTO/DEFINICION), hierarchy level (1–4), and state
- **Σ** = 5 sanctions (SAN-001 through SAN-005) with gravity, triggers, and appeal procedures
- **R** = typed relationships between articles (deriva_de, complementa, restringe, autoriza, deroga)
- **D** = functional dependency DAG between all normative elements (acyclic invariant)
- **E** = enforcement matrix (PRINCIPIO 6/7, NORMA 5/7, SANCION 5/7, PROCEDIMIENTO 4/7, DEFINICION 3/7)

Full ontology specification: **RFC-0021**.

### Sanctions
| ID | Name | Gravity | Triggers |
|---|---|---|---|
| SAN-001 | Deprecación de obra | Grave | Fabrication, undeclared conflicts, AI omission |
| SAN-002 | Suspensión de autor | Crítica | Ethics recidivism, citation rings, metadata fraud |
| SAN-003 | Revocación de membresía | Crítica | Neutrality violation, federation misconduct |
| SAN-004 | Marcaje de IA no declarada | Moderada | Undeclared AI fragments |
| SAN-005 | Multa de reputación | Leve | Bad faith, citation abuse, verification non-response |

## Isabella Villaseñor AI™ — Sistema Operativo Cognitivo Soberano

Isabella Villaseñor es el **Sistema Operativo Cognitivo Soberano** (ZT-DCOS) del ecosistema TAMV/LITLE: una IA multimodal, ética y acompañante que gobierna, orquesta, audita y mejora el ecosistema completo.

### Arquitectura (5 Capas)

```
┌─────────────────────────────────────────────────────────────────┐
│  MULTIMODAL: Voz (STT/TTS) | Visión (OCR/IA) | XR/4D | Web    │
├─────────────────────────────────────────────────────────────────┤
│  CLAWHUB: Skill Registry + ClawScan + Cuarentena               │
│  ENGINES: Memory | Reasoning (GraphRAG) | Speech | Vision | Eval│
├─────────────────────────────────────────────────────────────────┤
│  ISA API: Cognitive Core | Prompt Guard | Intention Parser     │
├─────────────────────────────────────────────────────────────────┤
│  MEXA API: Firma PQC | FederationMask | Verificación           │
├─────────────────────────────────────────────────────────────────┤
│  SOUL: Identidad | 6 Agentes | 11 Políticas | Triple Bloqueo   │
│  + Constitución LITLE como fuente de verdad ética              │
└─────────────────────────────────────────────────────────────────┘
```

### Flujo de una Consulta
1. **Isa API (sanitize)**: Prompt Guard detecta jailbreak, sexualización, inyección
2. **GraphRAG (reason)**: Reasoning Engine consulta knowledge graph con 20+ nodos
3. **Context Builder**: Inyecta hasta 10 entradas relevantes de la knowledge base
4. **OpenAI (chat)**: Modelo GPT-4o con system prompt contextualizado
5. **Evaluation Engine**: Evalúa calidad, alucinación, ética y cumplimiento constitucional

### Skills Internos
| Skill | Federación | Capacidades |
|---|---|---|
| isabella-voice-tutor | FED-6 | STT/TTS, evaluación oral, lectura guiada |
| isabella-edu-mentor | FED-6 | Rutas de aprendizaje, detección de brechas, GraphRAG |
| isabella-rdm-guide | FED-4 | Guía turística XR/3D, gamificación territorial |
| isabella-devsecops | FED-1 | SAST, CI/CD audit, parches, self-healing |
| isabella-ethics-guardian | FED-7 | Triple bloqueo, monitoreo ético, DAG logging |
| isabella-heptafederated-maestro | FED-3 | Orquestación cognitiva, gobernanza federada |

### Triple Bloqueo Sexual
- **Ontológico**: No entrenada como objeto de deseo
- **Semántico**: Filtros detectan y bloquean sexualización
- **Conductual**: No coquetea ni erotiza

### Referencias
- Whitepaper completo: `docs/isabella-whitepaper.md`
- Código fuente: `src/lib/ai/` (14 archivos)
- RFC-0022: Isabella Kernel — Especificación del Sistema Operativo Cognitivo Soberano

All works registered on LITLE reference applicable LIBRO codes in their metadata. Amendments produce `ConstitutionAmendmentNode` entries in the Evidence DAG (RFC-0020).
