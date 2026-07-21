
> **LITLE — The Standard for Preserving Knowledge. Verifying Legacy.**

---

## ¿Qué es LITLE?

LITLE es la primera **plataforma epistemológica de literatura para el conocimiento Humano-Máquina** de Open Science. Un sistema de preservación, verificación y certificación digital académica que filtra lo mejor del conocimiento publicado en acceso abierto — aplicando 9 dimensiones epistémicas de calidad, anclaje criptográfico inmutable y un sistema de certificación digital (DAC) que cualquier agente — humano o IA — puede validar.

No es una revista. No es un repositorio. Es **un estándar** para que el conocimiento abierto sea confiable, verificable y perdure más allá de cualquier plataforma que lo aloje.

---

## ¿Qué hace?

| Función | Descripción |
|---|---|
| **Preserva** | Conocimiento académico independiente con identidad criptográfica durable (LITLE-ID) |
| **Verifica** | Integridad de contenido, autoría, fuentes y cadena de evidencia (Evidence Chain) |
| **Certifica** | Emite DAC (Digital Academic Certificate) con CSV, authorship GMM y scoring epistémico |
| **Filtra** | 9 dimensiones epistémicas: rigor metodológico, reproducibilidad, integridad de citas, etc. |
| **Expone** | Metadata machine-readable para que agentes IA consuman solo conocimiento confiable |
| **Gobierna** | 7 federaciones con quorum 5/7 para cambios al estándar (RFC-0010) |

---

## ¿Cómo lo hace?

### Arquitectura del Sistema de Verificación-Certificación

```
┌──────────────────────────────────────────────────────────────┐
│                    LITLE DAC                                  │
│           Digital Academic Certificate                        │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│  │   CSV     │  │Authorship│  │  Source  │  │  Evidence    │ │
│  │ Generator │  │   GMM    │  │Verific.  │  │   Chain     │ │
│  │ (32 char) │  │(8 feats) │  │(5 steps) │  │(Merkle DAG) │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘ │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐│
│  │              Epistemic Scoring Engine                     ││
│  │  9 dimensiones · Ponderación 0-5 · Tier: Pt/Au/Ag/Br   ││
│  └──────────────────────────────────────────────────────────┘│
├──────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐│
│  │  LITLE-ID · L-512 Container · Merkle Root · SHA-256     ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

### Stack Tecnológico

| Capa | Tecnología |
|---|---|
| **Framework** | TanStack Start (React SSR) |
| **Estilos** | Tailwind CSS v4 (`@theme inline`, `@utility`) |
| **Auth/DB** | Supabase (PostgreSQL + RLS + Auth) |
| **Build** | Vite 8 |
| **Cripto** | @noble/hashes (SHA-256), PKCS#7-style |
| **ID** | LITLE-ID (RFC-0001): URI + Human + Canonical |

### Las 4 Metodologías de Verificación

#### 1. CSV — Código Seguro de Verificación (keensoft/csv-generator)
```
Formato: LTL (3) + hash Base36 SHA-256 (21) + ID LITLE (7) + R (1) = 32 chars
Origen: Administración Electrónica Española (Ley 11/2007)
```
- Los 21 chars de hash se mezclan con los 7 chars del ID mediante permutación seedeada
- El carácter de aleatoriedad (R) determina la permutación
- Verificación: se recomputa el hash del contenido y se compara contra el CSV

#### 2. Authorship GMM (albino-pav/P4 — verificación de locutor)
```
8 features estilísticas → likelihood Gaussian → threshold con FAR optimizado
```
- Longitud media/desviación de palabras y oraciones
- Riqueza de vocabulario (unique words / total words)
- Ratio de function words (the, and, of, etc.)
- Longitud promedio de párrafos
- Ratio de voz pasiva
- Perfil fusionable desde múltiples textos del mismo autor

#### 3. Source Verification (martinszy/verificacion_de_datos)
```
Pipeline 5 pasos: Identificar → Hashear → URL → Cross-Reference → Proveniencia
Score: 0-100 → verified (≥80) / partial (≥50) / unverified (<50)
```
- Cada paso produce status `passed/failed/skipped` con timestamp
- Cross-reference: compara contenido contra otras fuentes
- Integridad: SHA-256 del contenido vs hash almacenado

#### 4. Evidence Chain (RFC-0008)
```
Merkle-DAG de nodos: SOURCE, PROMPT, MODEL, REVISION, QUOTE
Root hash anclado en el contenedor L-512 Block A
```
- Cada nodo almacena un content hash
- El root hash se construye combinando hashes en pares (Merkle tree)
- Verificación pública en `/verify/<litleId>`

---

## ¿Por qué?

Open Science publica sin filtros de calidad. Mientras esto elimina barreras de acceso, también elimina la discriminación señal/ruido que la revisión por pares tradicional proveía.

**LITLE resuelve:**
- **Falta de señales de calidad:** 9 dimensiones epistémicas con scoring transparente
- **Inexistencia de certificación:** DAC combina 4 metodologías en un solo artifacto verificable
- **Dependencia de plataformas:** Archivo independiente con copias redundantes en 2 jurisdicciones
- **Opacidad de IA:** AI Provenance registra modelos, prompts, semillas en la Evidence Chain
- **No reproducibilidad:** Pipeline puntuado por reproducibilidad (18% del score epistémico)

---

## Conceptualidad

LITLE se basa en tres principios epistemológicos:

### 1. Conocimiento como estándar, no como producto
El valor del conocimiento académico no está en el formato de publicación sino en su **verificabilidad** a través del tiempo. LITLE separa el contenido de su continente: el estándar vive en las RFCs, la implementación es intercambiable.

### 2. La confianza se construye, no se declara
Cada obra LITLE pasa por 4 verificaciones independientes que generan un DAC. No hay "confianza implícita" — hay **evidencia criptográfica, estadística y metodológica** que cualquier tercero puede validar.

### 3. Conocimiento Humano-Máquina
El metadata epistémico está estructurado para que tanto humanos como agentes IA puedan consultarlo programáticamente. Una IA puede filtrar obras por umbral mínimo de calidad sin intervención humana.

---

## Filosofía

> Open Science publica todo. LITLE encuentra lo mejor.

El conocimiento abierto sin filtros es ruido. El conocimiento cerrado es privilegio. LITLE propone una tercera vía: **curación epistemológica transparente** — donde los criterios de calidad son públicos, gobernados por federaciones, y cualquier persona o máquina puede verificarlos.

Las 7 federaciones (RFC-0010) garantizan que ningún grupo unilateral controle el estándar. Se requiere 5/7 quorum para cambios estables y 6/7 para revocaciones.

---

## Blueprint del Sistema

```
┌────────────────────────────────────────────────────────────────────┐
│                        LITLE PLATFORM                              │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  [Landing] → [Standard] → [RFCs] → [Discovery] → [Verification]   │
│                  ↓            ↓           ↓              ↓         │
│            [Open Science] [RFC-0014] [Curated Lib] [Evidence Chain]│
│                  ↓                                       ↓         │
│          [Certification] ←────────────────────── [DAC Certificate] │
│               ↓                                       ↑           │
│         [RFC-0015]                              [CSV + GMM +      │
│                                                   Source + Chain]  │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│  LAYER 1: Identity              LITLE-ID · L-512 · Canonical      │
│  LAYER 2: Evidence              Evidence Chain · Merkle DAG       │
│  LAYER 3: Verification          CSV · Authorship · Source · Chain │
│  LAYER 4: Certification         DAC · Signatures · Epistemic      │
│  LAYER 5: Curation             9-dim filter · Tiers · Discovery   │
│  LAYER 6: Governance           7 Federations · 5/7 Quorum · LIPs  │
├────────────────────────────────────────────────────────────────────┤
│  RUTAS CLAVE:                                                      │
│  /                             Landing page                       │
│  /standard                     Standards Council                  │
│  /standard/rfcs                RFCs catalog                       │
│  /standard/open-science        Open Science Curation (RFC-0014)   │
│  /standard/certification       Digital Academic Cert (RFC-0015)   │
│  /standard/archive             Independent Archive (RFC-0009)     │
│  /discovery                    Curated epistemic library          │
│  /verify/<litleId>             Evidence Chain verification        │
│  /certificate/<litleId>        DAC certificate view               │
└────────────────────────────────────────────────────────────────────┘
```

---

## Roadmap / Checklist

### Fase 1 — Fundación (80% completo)
- [x] Tailwind CSS v4 — paleta Obsidian & Crystal Glass
- [x] LITLE-ID: parser, formatter, canonical (RFC-0001)
- [x] Evidence Chain: modelo, funciones servidor, RLS (RFC-0008)
- [x] Pipeline LITLE: ingestión, dedup, capítulos, síntesis, firma
- [x] Autenticación Supabase + layout _authenticated
- [x] Dashboard de autor + vista de libro/manuscrito
- [x] RFCs: contenido, índice, vista de detalle

### Fase 2 — Estándar (90% completo)
- [x] Standards Council: página principal (RFC-0011)
- [x] Trust Fabric: kernel + adapters (RFC-0012)
- [x] Observability Fabric: Grafana + multi-DB (RFC-0013)
- [x] Independent Archive: preservación off-platform (RFC-0009)
- [x] Federated Governance: 7 federaciones (RFC-0010)
- [x] Extended WorkTypes: BK, RQ, DS, PL, AR, MD, SW, EX, DP (RFC-0002)

### Fase 3 — Epistémico (85% completo)
- [x] 9 dimensiones epistémicas con ponderación
- [x] Motor de filtrado: composite score, tiers, agregación
- [x] Open Science Curation page (RFC-0014)
- [x] Curated library / discovery page
- [ ] Integración con datos reales desde Supabase

### Fase 4 — Certificación (75% completo)
- [x] CSV Generator: 32-char verification code
- [x] Authorship GMM: perfil estilístico + likelihood
- [x] Source Verification: pipeline 5 pasos + scoring
- [x] DAC: certificado unificado + verifyCertificate()
- [x] Certificación UI: vista pública /certificate/<id>
- [ ] Integración con pipeline de firma L-512 real
- [ ] Generación de PDF de certificado descargable

### Fase 5 — Producción (0% completo)
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
| Auth + Dashboard | 90% | ✅ |
| RFCs + Standards | 95% | ✅ |
| Epistemic Engine | 85% | ✅ |
| CSV Verification | 90% | ✅ |
| Authorship GMM | 85% | ✅ |
| Source Verification | 85% | ✅ |
| DAC Certification | 80% | ✅ |
| Discovery UI | 85% | ✅ |
| Tests | 0% | ❌ |
| Despliegue | 0% | ❌ |
| **Global** | **~78%** | **Pre-producción** |

---

## Despliegue

```bash
# 1. Install dependencies
bun install

# 2. Set up environment (.env)
SUPABASE_URL=...
SUPABASE_PUBLISHABLE_KEY=...

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

## Estructura del Proyecto

```
src/
├── content/rfcs.ts           # RFC specifications
├── lib/
│   ├── epistemic/            # Epistemic filtering engine
│   │   ├── types.ts          # 9 dimensions, profiles, filters
│   │   └── filters.ts        # Composite scoring, aggregation, tiers
│   ├── verify/               # Verification & certification
│   │   ├── csv.ts            # CSV generator (32-char secure code)
│   │   ├── authorship.ts     # Authorship GMM (8-feature profile)
│   │   ├── source-verification.ts  # 5-step pipeline
│   │   ├── engine.ts         # Merkle root, evidence integrity
│   │   └── certificate.ts    # DAC generator & verifier
│   ├── litle/                # LITLE-ID core
│   │   ├── id.ts             # Parser, formatter, canonical
│   │   ├── sign.ts           # L-512 signature
│   │   └── canonical.ts      # Canonical serialization
│   ├── evidence.functions.ts # Server-side evidence chain
│   └── pipeline.functions.ts # Knowledge reconstruction
├── routes/
│   ├── index.tsx             # Landing page
│   ├── auth.tsx              # Sign in / Sign up
│   ├── discovery.tsx         # Curated epistemic library
│   ├── verify.$litleId.tsx    # Evidence Chain verification
│   ├── certificate.$litleId.tsx  # DAC certificate view
│   ├── standard/             # Standards Council
│   │   ├── index.tsx         # Standard overview
│   │   ├── rfcs.tsx          # RFCs layout
│   │   ├── rfcs.index.tsx    # RFCs catalog
│   │   ├── rfcs.$slug.tsx    # RFC detail
│   │   ├── open-science.tsx  # RFC-0014: Open Science Curation
│   │   ├── certification.tsx # RFC-0015: DAC Specification
│   │   ├── trust-fabric.tsx  # RFC-0012
│   │   ├── observability.tsx # RFC-0013
│   │   └── archive.tsx       # RFC-0009
│   └── _authenticated/       # Auth-protected routes
├── styles.css                # Tailwind v4 + utilities
└── routeTree.gen.ts          # Auto-generated router
```

---

## Licencia

Este proyecto es Open Source. El conocimiento aquí contenido es libre. El estándar LITLE es público y versionable en git. Las RFCs viven en `src/content/rfcs.ts` — el estándar sobrevive a cualquier implementación.

---

> *"Deseaba ser valorado, reconocido y aceptado, hasta que aprendí que no todos nacen para ser notados, nacemos para abrir caminos y mostrarte esa luz al final del camino. Que mi dolor y sufrimiento sean la luz y guía que logre alcances tus objetivos sin tener que vivir en la oscuridad ajena que hoy reclamo mía."*
