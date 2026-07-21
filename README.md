# LITLE — Trust Fabric & Standard

LITLE is a proposed standard and platform for **epistemological curation, cryptographic verification, and digital certification** of Open Access academic knowledge. It combines a 9-dimensional epistemic filter, post-quantum signatures (ML-DSA-87 / SHAKE256), a 48-gate quantum-inspired identity layer, a quarantine-based submission pipeline with AI triangulation, and a federated governance model.

> **Status:** Pre-production. RFCs are draft specifications. [`ARCHITECTURE.md`](ARCHITECTURE.md) for system design.

---

## Features

| Layer | Capability |
|---|---|
| **Cryptographic** | ML-DSA-87 (Dilithium5), SHAKE256, HMAC, dual-stack DAC (classic + PQC) |
| **Quantum** | 48-gate identity fingerprint, 5-layer hybrid shield (L-SHIELD-5), double zero trust (L-ZT-DUAL.v1), data interconnection |
| **Epistemic** | 9-dimension scoring, simulated annealing weight optimization, quantum-inspired correlation |
| **Verification** | CSV generator, authorship GMM (8-feature), source verification (5-step), SHAKE256 Merkle-DAG evidence chain |
| **Quarantine** | 6-source triangulation (ORCID, Crossref/DOI, ISNI, web, LITLE library, quantum fingerprint) |
| **AI** | OpenAI GPT-4o epistemic scoring, triangulation enhancement, text embeddings for semantic dedup |
| **Governance** | 7 federations (TAMV), 5/7 quorum for stable changes, 6/7 for revocation |
| **Identity** | LITLE-ID (L-512.v1 / L-PQC.v1 / L-48G.v1), Bech32m canonical, URI + Human + Canonical forms |

---

## Quick Start

```bash
cp .env.example .env
# Edit .env with your Supabase credentials and LITLE_AUTHOR_SECRET
bun install
bun dev
```

### Environment

See [`.env.example`](.env.example) for all required variables:
- `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` — Supabase project
- `LITLE_AUTHOR_SECRET` — 64+ char hex for PQC key derivation
- `OPENAI_API_KEY` — Optional, for AI-enhanced scoring and triangulation

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│  Frontend (TanStack Start SSR)  ←→  Backend (Nitro Serverless)  │
│                                       │                          │
│  Tailwind CSS v4                    Supabase (PostgreSQL + RLS) │
│  Obsidian & Crystal Glass           OpenAI (GPT-4o, embeddings) │
│  Supabase Auth Client               PQC / Quantum crypto layer  │
└──────────────────────────────────────────────────────────────────┘
```

Full architecture in [`ARCHITECTURE.md`](ARCHITECTURE.md).

---

## Deployment

| Platform | Config | Notes |
|---|---|---|
| **Vercel** | [`vercel.json`](vercel.json) | Serverless SSR, auto HTTPS |
| **Railway** | [`railway.json`](railway.json) | Docker-based |
| **Render** | [`render.yaml`](render.yaml) | Web service + cron |
| **Docker** | [`Dockerfile`](Dockerfile) | `docker compose up` for local |

---

## Routes

| Route | Description |
|---|---|
| `/` | Landing page (LATAM) |
| `/auth` | Sign in / Sign up |
| `/dashboard` | Author dashboard |
| `/submissions` | Submission tracker |
| `/library` | Academic library |
| `/verify/$litleId` | Datacite-style resolver |
| `/certificate/$litleId` | DAC certificate view |
| `/submit` | Public submission with quarantine |
| `/governance` | 7 Federations TAMV |
| `/standard` | Standards Council |
| `/admin/quarantine` | FED-5 curation panel |

---

## Project Structure

```
src/
├── content/rfcs.ts              # RFC specifications
├── integrations/supabase/       # Supabase client, auth middleware
├── lib/
│   ├── ai/openai.ts             # OpenAI integration (server-only)
│   ├── epistemic/               # 9-dim scoring, quantum filter
│   ├── verify/                  # CSV, GMM, source, certificate
│   ├── litle/                   # ID, sign, PQC, quantum, container
│   ├── quantum/                 # Gates, hybrid-shield, zero-trust, interconnect
│   └── submission/              # Quarantine, triangulation, pipeline
├── routes/                      # All application routes
├── server.ts                    # SSR error wrapper
└── styles.css                   # Obsidian & Crystal Glass palette
docs/                            # Whitepaper, threat model, benchmark
ARCHITECTURE.md                  # Full system architecture
```

---

## Docs

| Document | Description |
|---|---|
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | Frontend, backend, AI agent architecture |
| [`docs/whitepaper.md`](docs/whitepaper.md) | Technical whitepaper (draft) |
| [`docs/threat-model.md`](docs/threat-model.md) | Security threat model |
| [`docs/benchmark.md`](docs/benchmark.md) | Comparison vs Zenodo/Figshare/Dataverse/Crossref |

---

## RFCs

| RFC | Status | Description |
|---|---|---|
| 0001 | Implemented | LITLE-ID specification |
| 0008 | Implemented | Evidence Chain |
| 0010 | Proposed | Federated governance (7 federations) |
| 0014 | Proposed | Open Science curation (9-dim scoring) |
| 0015 | Proposed | Digital Academic Certificate (dual-stack) |
| 0016 | Proposed | Quarantine pipeline |
| 0017 | Proposed | Post-quantum cryptography |
| 0018 | Draft | Quantum architecture (48 gates, shield, zero-trust) |

---

## Scripts

```bash
bun dev          # Development server
bun build        # Production build
bun run lint     # ESLint
bun run format   # Prettier
```

---

## License

Open Source. The LITLE standard is public and versioned in git.
