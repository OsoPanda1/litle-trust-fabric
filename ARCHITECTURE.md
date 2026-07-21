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
