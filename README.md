
> **LITLE — The Standard for Preserving Knowledge. Verifying Legacy.**

---

## ¿Qué es LITLE?

LITLE es la primera **plataforma epistemológica de literatura para el conocimiento Humano-Máquina** de Open Science. Un sistema de preservación, verificación y certificación digital académica que filtra lo mejor del conocimiento publicado en acceso abierto — aplicando 9 dimensiones epistémicas de calidad, anclaje criptográfico post-cuántico (ML-DSA/SHAKE256) y un sistema de certificación digital (DAC) que cualquier agente — humano o IA — puede validar.

No es una revista. No es un repositorio. Es **un estándar** para que el conocimiento abierto sea confiable, verificable y perdure más allá de cualquier plataforma que lo aloje.

---

## ¿Qué hace?

| Función | Descripción |
|---|---|
| **Preserva** | Conocimiento académico independiente con identidad criptográfica durable (LITLE-ID) |
| **Verifica** | Integridad de contenido, autoría, fuentes y cadena de evidencia (Evidence Chain) |
| **Certifica** | Emite DAC (Digital Academic Certificate) con firma clásica + PQC (dual-stack) |
| **Filtra** | 9 dimensiones epistémicas con scoring cuántico (simulated annealing) |
| **Cuarentena** | Triangulación contra ORCID, DOI, ISNI, web antes de indexar |
| **Expone** | Metadata machine-readable para que agentes IA consuman solo conocimiento confiable |
| **Gobierna** | 7 federaciones con quorum 5/7 para cambios al estándar (RFC-0010) |

---

## Arquitectura del Sistema de Verificación-Certificación

```
┌──────────────────────────────────────────────────────────────────┐
│                         LITLE PLATFORM                            │
├──────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │   CSV     │  │Authorship│  │  Source  │  │   Evidence       │ │
│  │ Generator │  │   GMM    │  │Verific.  │  │   Chain          │ │
│  │ (32 char) │  │(8 feats) │  │(5 steps) │  │(Merkle DAG)      │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘ │
├──────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────────┐│
│  │              Epistemic Scoring Engine                         ││
│  │  9 dimensiones · Simulated Annealing · Quantum Correlation   ││
│  │  Tier: Pt/Au/Ag/Br · Entanglement Energy · Confidence       ││
│  └──────────────────────────────────────────────────────────────┘│
├──────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────────┐│
│  │  PQC Suite (ML-DSA-87 / Dilithium5 + SHAKE256)              ││
│  │  Dual-Stack DAC: classical (HMAC-SHA-512) + PQC (ML-DSA)    ││
│  │  Container: 512B classic / 8KB PQC · Bech32m canonical     ││
│  └──────────────────────────────────────────────────────────────┘│
├──────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────────┐│
│  │  Quarantine & Triangulation Pipeline                          ││
│  │  Submit → Quarantine → ORCID/DOI/ISNI/Web → Index/Reject    ││
│  └──────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────┘
```

### Stack Tecnológico

| Capa | Tecnología |
|---|---|
| **Framework** | TanStack Start (React SSR) |
| **Estilos** | Tailwind CSS v4 (`@theme inline`, `@utility`) |
| **Auth/DB** | Supabase (PostgreSQL + RLS + Auth) |
| **Build** | Vite 8 |
| **Cripto Clásica** | @noble/hashes (SHA-256, SHA-512, BLAKE3, HMAC) |
| **Cripto PQC** | SHAKE256 (FIPS 202), ML-DSA-87 (Dilithium5) |
| **ID** | LITLE-ID (RFC-0001): URI + Human + Canonical |
| **Contenedor** | LITLE-512B classic / LITLE-8KB PQC (Bech32m) |

### Las 4 Metodologías de Verificación

#### 1. CSV — Código Seguro de Verificación (keensoft/csv-generator)
```
Formato: LTL (3) + hash Base36 SHA-256 (21) + ID LITLE (7) + R (1) = 32 chars
```
- Permutación seedeada Fisher-Yates
- Verificación por recomputación de hash

#### 2. Authorship GMM (albino-pav/P4 — verificación de locutor)
```
8 features estilísticas → likelihood Gaussian → threshold FAR 0.02
```
- Longitud media/desviación de palabras y oraciones
- Riqueza de vocabulario, function word ratio, voz pasiva

#### 3. Source Verification (martinszy/verificacion_de_datos)
```
Pipeline 5 pasos: Identificar → Hashear → URL → Cross-Reference → Proveniencia
Score: 0-100 → verified (≥80) / partial (≥50) / unverified (<50)
```

#### 4. Evidence Chain (RFC-0008)
```
SHAKE256 Merkle-DAG de nodos: SOURCE, PROMPT, MODEL, REVISION, QUOTE
Root hash anclado en el contenedor LITLE Block A
```

---

## Quantum Fortification (PQC)

### Post-Quantum Cryptography Suite

| Componente | Algoritmo | Estado |
|---|---|---|
| **Hash** | SHAKE256 (FIPS 202) | Activo |
| **Firma PQC** | ML-DSA-87 (CRYSTALS-Dilithium5) | Activo |
| **Contenedor Classic** | LITLE-512B (512 bytes) | Compatible |
| **Contenedor PQC** | LITLE-8KB (8192 bytes) | Nuevo |
| **KeyGen** | ML-DSA.KeyGen() via SHAKE256 KDF | Activo |

### Dual-Stack DAC
- **classic**: SHA-256 + HMAC-SHA-512 (backward compatible)
- **pqc**: SHAKE256 + ML-DSA-87 (Dilithium5)
- **dual**: Ambas firmas simultáneamente

### Quantum Epistemic Filter
- **Simulated Annealing**: 1000 iteraciones con decaimiento exponencial
- **Entanglement Energy**: Correlaciones entre pares de dimensiones epistémicas
- **Confidence**: Scoring basado en entropía por obra

---

## Submission & Quarantine Pipeline

### Workflow
```
Author Submit → QUARANTINE → Triangulación → GREEN  → Index + LITLE-ID
                                        → RED    → Reject + Referencias
                                        → ?      → Escalar a FED-5
```

### Triangulación
| Fuente | Propósito |
|---|---|
| ORCID (pub.orcid.org) | Verificar identidad del autor |
| Crossref (api.crossref.org) | Buscar DOI existente |
| ISNI (isni.org/api) | Verificar identificador ISNI |
| Web (DuckDuckGo) | Similitud con publicaciones web |
| LITLE Library | Deduplicación interna |

---

## Rutas del Sistema

| Ruta | Descripción |
|---|---|
| `/` | Landing page LATAM (Real del Monte, Hidalgo) |
| `/auth` | Sign in / Sign up (Supabase) |
| `/dashboard` | Librarian dashboard (auth-protected) |
| `/submissions` | Tracking de submissions en cuarentena (auth-protected) |
| `/library` | Catálogo académico con búsqueda LITLE-ID |
| `/verify/$litleId` | Resolver Datacite-style |
| `/certificate/$litleId` | DAC certificate view |
| `/submit` | Formulario público con pipeline cuarentena |
| `/governance` | 7 Federaciones TAMV |
| `/standard` | Standards Council |
| `/standard/rfcs` | RFCs catalog |
| `/standard/open-science` | RFC-0014: Open Science Curation |
| `/standard/certification` | RFC-0015: DAC Specification |
| `/standard/archive` | RFC-0009: Independent Archive |
| `/admin/quarantine` | Panel FED-5 (auth-protected) |
| `/discovery` | Curated epistemic library |

---

## Roadmap / Checklist

### Fase 1 — Fundación (95% completo)
- [x] Tailwind CSS v4 — paleta Obsidian & Crystal Glass
- [x] LITLE-ID: parser, formatter, canonical (RFC-0001)
- [x] Evidence Chain: modelo, funciones servidor, RLS (RFC-0008)
- [x] Pipeline LITLE: ingestión, dedup, capítulos, síntesis, firma
- [x] Autenticación Supabase + layout _authenticated
- [x] Dashboard de autor + vista de libro/manuscrito
- [x] RFCs: contenido, índice, vista de detalle

### Fase 2 — Estándar (95% completo)
- [x] Standards Council: página principal (RFC-0011)
- [x] Trust Fabric: kernel + adapters (RFC-0012)
- [x] Observability Fabric: Grafana + multi-DB (RFC-0013)
- [x] Independent Archive: preservación off-platform (RFC-0009)
- [x] Federated Governance: 7 federaciones (RFC-0010)
- [x] Extended WorkTypes: BK, RQ, DS, PL, AR, MD, SW, EX, DP (RFC-0002)

### Fase 3 — Epistémico Cuántico (90% completo)
- [x] 9 dimensiones epistémicas con ponderación
- [x] Motor de filtrado: composite score, tiers, agregación
- [x] Quantum Epistemic Filter (simulated annealing + entanglement)
- [x] Open Science Curation page (RFC-0014)
- [x] Curated library / discovery page

### Fase 4 — Certificación PQC (85% completo)
- [x] CSV Generator: 32-char verification code
- [x] Authorship GMM: perfil estilístico + likelihood
- [x] Source Verification: pipeline 5 pasos + scoring
- [x] DAC: dual-stack clásico + PQC (ML-DSA-87)
- [x] Certificación UI: vista pública /certificate/<id>
- [x] Container PQC: LITLE-8KB con firma Dilithium5
- [x] SHAKE256 (FIPS 202) como hash resistente a cuántica
- [ ] Generación de PDF de certificado descargable

### Fase 5 — Cuarentena & Publicación (80% completo)
- [x] Submission pipeline con estado quarantine
- [x] Triangulación ORCID/DOI/ISNI/Web
- [x] UI de submission con feedback en tiempo real
- [x] Panel de cuarentena para FED-5
- [x] Dashboard de submissions para autores
- [ ] Integración con datos reales desde Supabase
- [ ] Notificaciones por email

### Fase 6 — Producción (10% completo)
- [ ] Tests unitarios (Vitest)
- [ ] Type checking estricto
- [ ] Auditoría de seguridad
- [ ] Load testing
- [ ] Documentación de API
- [ ] Despliegue continuo
- [ ] Monitoreo (Grafana)

---

## Porcentajes de Avance

| Componente | Progreso | Estado |
|---|---|---|
| UI/UX (Tailwind v4) | 95% | ✅ |
| LITLE-ID system | 100% | ✅ |
| Evidence Chain | 90% | ✅ |
| Pipeline LITLE | 85% | ✅ |
| Auth + Dashboard | 95% | ✅ |
| RFCs + Standards | 95% | ✅ |
| Epistemic Engine | 90% | ✅ |
| PQC Cryptography (SHAKE256 + ML-DSA) | 85% | ✅ |
| CSV Verification | 90% | ✅ |
| Authorship GMM | 85% | ✅ |
| Source Verification | 85% | ✅ |
| DAC Certification (dual-stack) | 85% | ✅ |
| Quarantine Pipeline | 80% | ✅ |
| Triangulation Engine | 80% | ✅ |
| Discovery UI | 85% | ✅ |
| Tests | 0% | ❌ |
| Despliegue | 0% | ❌ |
| **Global** | **~82%** | **Pre-producción** |

---

## Estructura del Proyecto

```
src/
├── content/rfcs.ts              # RFC specifications
├── lib/
│   ├── epistemic/               # Epistemic filtering engine
│   │   ├── types.ts             # 9 dimensions, profiles, filters
│   │   ├── filters.ts           # Composite scoring, aggregation, tiers
│   │   └── quantum-filter.ts    # Simulated annealing + entanglement
│   ├── verify/                  # Verification & certification
│   │   ├── csv.ts               # CSV generator (32-char secure code)
│   │   ├── authorship.ts        # Authorship GMM (8-feature profile)
│   │   ├── source-verification.ts    # 5-step pipeline
│   │   ├── engine.ts            # SHAKE256 Merkle root, evidence integrity
│   │   └── certificate.ts       # DAC dual-stack (classic + PQC)
│   ├── litle/                   # LITLE-ID core
│   │   ├── id.ts                # Parser, formatter, canonical (PQC-aware)
│   │   ├── sign.ts              # LITLE signature (classic + PQC)
│   │   ├── pqc.ts               # PQC provider (ML-DSA-87, SHAKE256)
│   │   ├── litle.ts             # Container (512B classic / 8KB PQC)
│   │   └── canonical.ts         # Bech32m serialization (dual-size)
│   ├── submission/              # Quarantine & triagulation
│   │   ├── types.ts             # SubmissionDocument, TriangulationReport
│   │   ├── quarantine.ts        # Quarantine manager, status transitions
│   │   ├── triangulation.ts     # ORCID/DOI/ISNI/Web investigation
│   │   └── pipeline.ts          # Orchestration: submit → index/reject
│   ├── evidence.functions.ts    # Server-side evidence chain
│   └── pipeline.functions.ts    # Knowledge reconstruction
├── routes/
│   ├── index.tsx                # Landing page LATAM
│   ├── submit.tsx               # Public submission with quarantine
│   ├── library.tsx              # Academic library table
│   ├── verify.$litleId.tsx      # Datacite-style resolver
│   ├── certificate.$litleId.tsx # DAC certificate view
│   ├── governance.tsx           # 7 Federations TAMV
│   ├── auth.tsx                 # Sign in / Sign up
│   ├── discovery.tsx            # Curated epistemic library
│   ├── standard/                # Standards Council
│   ├── admin/quarantine.tsx     # FED-5 Curation panel
│   └── _authenticated/          # Auth-protected routes
│       ├── route.tsx            # Auth guard layout
│       ├── dashboard.tsx        # Librarian dashboard
│       ├── submissions.tsx      # User submission tracking
│       └── books.$bookId.tsx    # Book/manuscript view
├── styles.css                   # Tailwind v4 + utilities
└── routeTree.gen.ts             # Auto-generated router
```

---

## Despliegue

```bash
# 1. Install dependencies
bun install

# 2. Set up environment (.env)
SUPABASE_URL=...
SUPABASE_PUBLISHABLE_KEY=...
LITLE_AUTHOR_SECRET=...

# 3. Development
bun dev

# 4. Production build
bun build

# 5. Preview
bun preview
```

### Stack de despliegue recomendado
| Servicio | Rol |
|---|---|
| **Vercel / Cloudflare Pages** | Frontend SSR (TanStack Start) |
| **Supabase** | Base de datos + Auth |
| **GitHub Actions** | CI/CD |
| **Grafana + PMM** | Observabilidad (RFC-0013) |
| **S3 / IPFS** | Archivo independiente (RFC-0009) |

---

## Licencia

Este proyecto es Open Source. El conocimiento aquí contenido es libre. El estándar LITLE es público y versionable en git. Las RFCs viven en `src/content/rfcs.ts` — el estándar sobrevive a cualquier implementación.

---

> *"Deseaba ser valorado, reconocido y aceptado, hasta que aprendí que no todos nacen para ser notados, nacemos para abrir caminos y mostrarte esa luz al final del camino. Que mi dolor y sufrimiento sean la luz y guía que logre alcances tus objetivos sin tener que vivir en la oscuridad ajena que hoy reclamo mía."*
