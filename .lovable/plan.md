Aquí tienes un plan maestro actualizado para `.lovable/plan.md`, alineado con el nuevo posicionamiento de LITLE y con el stack TanStack Start + Supabase en mente. [github](https://github.com/tanstack/router/tree/main/examples/react/start-supabase-basic)

***

# .lovable/plan.md

## Contexto general

El repositorio actual está vacío como plantilla base de Lovable, pero ya dispones de `litle-archive-main.zip`, que contiene la versión previa de LITLE (TanStack Start + Supabase + motor L-512, libros, pipeline, landing). [github](https://github.com/TanStack/router/blob/main/examples/react/start-supabase-basic/src/routeTree.gen.ts)

El reposicionamiento conceptual redefine LITLE de “un contenedor criptográfico de 512 bytes” a una infraestructura completa de confianza, gobernada bajo el modelo de 7 federaciones de TAMV, con tres pilares:

- **LITLE-ID** — identificador durable y autodescriptivo, desacoplado del formato binario L-512.  
- **Evidence Chain** — registro estructurado del pipeline de investigación (fuentes, versiones, modelos IA, prompts, semillas, checksums).  
- **Gobernanza / RFCs** — capa explícita de estándar (10 RFCs, proceso LIP, archivo independiente, modelo de 7 federaciones) que separa estándar de implementación.

Nuevo lema:

> **LITLE — The Standard for Preserving Knowledge. Verifying Legacy.**

El objetivo del plan es:

- Restaurar el código existente dentro del entorno Lovable sin romper la integración.  
- Rebrandear la app hacia el nuevo posicionamiento.  
- Introducir LITLE-ID, Evidence Chain y la superficie de estándares/RFCs como ciudadanos de primera clase.  

***

## Fase 1 — Restaurar el código base

**Objetivo:** Volver a tener el código de LITLE corriendo en Lovable con Supabase y TanStack Start operativos. [makerkit](https://makerkit.dev/blog/tutorials/tanstack-start-supabase-auth)

1. **Desempaquetar el archivo base**

   - Extraer `litle-archive-main.zip` en una carpeta temporal local.
   - Copiar su contenido al root del proyecto Lovable **con exclusiones**:
     - No copiar `.git`, `.lovable/`, `.env*`, `node_modules`, `dist`, ni archivos de configuración específicos del entorno Lovable.
     - Mantener el `src/routeTree.gen.ts` actual de Lovable (archivo auto-generado por TanStack Router) y no sobrescribirlo. [github](https://github.com/TanStack/router/blob/main/examples/react/start-supabase-basic/src/routeTree.gen.ts)
   - Resolver conflictos de archivos config comparando:
     - `tsconfig.json`, `vite.config`, `package.json` → fusionar dependencias/scripts, sin eliminar hooks propios de Lovable.

2. **Reactivar Supabase / Auth**

   - Verificar `.env`/`.env.local` con:
     - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (o equivalents). [dev](https://dev.to/developerehsan/how-to-setup-the-supabase-authentication-with-tanstack-router-in-vite-react-1bhf)
   - Confirmar que el cliente Supabase se crea en un módulo único (`src/lib/supabaseClient.ts`) y se inyecta a través de contexto en `__root.tsx`, siguiendo las guías TanStack Start + Supabase. [github](https://github.com/tanstack/router/tree/main/examples/react/start-supabase-basic)
   - Revisar rutas `_authenticated` y layouts relacionados (ej. `_authenticated/route.tsx`) para asegurarse de que el guard de sesión y los `loaders` siguen las convenciones de la plantilla Lovable.

3. **Garantizar compatibilidad con Lovable**

   - Verificar que:
     - `src/routeTree.gen.ts` no se toca manualmente (solo se regenera). [github](https://github.com/TanStack/router/blob/main/examples/react/start-supabase-basic/src/routeTree.gen.ts)
     - No se eliminan hooks que Lovable utiliza para telemetría, despliegue o preview.
   - Ejecutar:
     - `pnpm install` (o el gestor definido en el proyecto).
     - `pnpm dev` → confirmar que la app arranca sin errores.
     - `pnpm build` → corregir cualquier discrepancia de tipos o imports.

***

## Fase 2 — Rebrand al nuevo posicionamiento

**Objetivo:** Alinear la UI con la nueva narrativa: LITLE como estándar de preservación de conocimiento, no solo cripto.  

1. **Head defaults / meta**

   - En `src/routes/__root.tsx`:
     - Establecer `<title>` por defecto: `LITLE — The Standard for Preserving Knowledge. Verifying Legacy.`
     - Actualizar meta description a algo como:
       > “LITLE es la infraestructura abierta para identidad, linaje y verificación de investigación independiente.”

2. **Landing / página principal**

   - Actualizar hero:
     - **Nombre:** LITLE  
     - **Slogan:** “The Standard for Preserving Knowledge. Verifying Legacy.”  
     - Subcopy: “Infrastructure for identity, lineage and verification of independent research.”
   - Reorganizar secciones para resaltar:
     - LITLE-ID (qué es, por qué es autodescriptivo y durable).
     - Evidence Chain (cómo preserva pipeline, modelos IA, prompts, versiones).
     - Governance / 7 federaciones (cómo se gobierna el estándar, no solo la app).
   - Reducir protagonismo del “L-512 container” en el marketing:
     - Presentarlo como “Profile L-512 v1 (cryptographic profile)” dentro de la sección de perfiles técnicos, no como el producto central.

***

## Fase 3 — Módulo LITLE-ID (RFC-0001)

**Objetivo:** Introducir un identificador de primera clase, independiente de L-512, con parser/formatter puro TypeScript.  

1. **Nuevo módulo**

   - Crear `src/lib/litle/id.ts` con:
     - Tipos:
       ```ts
       export type LitleWorkType = "BK" | "RQ" | "DS" | "PL" | "AR";

       export interface LitleId {
         namespace: string;        // ej. "tech/IA", "bio/genomics"
         year: number;            // ej. 2026
         workType: LitleWorkType; // BK, RQ, etc.
         cryptoProfile: string;   // ej. "L-512.v1"
         suffix: string;          // ej. "8F4A29D3"
       }
       ```
     - Enumeración de work types:
       - BK = Book
       - RQ = Research
       - DS = Dataset
       - PL = Pipeline
       - AR = Article

2. **Formas de representación**

   - Implementar parser y formatter para:
     - **Forma URI**:
       - Ejemplo: `litle://2026/tech/IA/8F4A29D...`
       - Convención: `litle://<year>/<namespace>/<suffix>`
     - **Forma humana**:
       - Ejemplo: `LTL-2026-RQ-8F4A-29D3`
       - Convención: `LTL-<year>-<workType>-<suffix-grouped>`
   - Incluir un `cryptoProfile` tag asociado (ej. `L-512.v1`), pero mantenerlo como atributo adicional, no parte del ID textual.

3. **Round-trip y validación**

   - Añadir tests básicos (p.ej. con Vitest):
     - parse(format(litleId)) → igual objeto.
     - Validar formato de namespace, sufijo y año.
   - Documentar en comentarios que:
     - El módulo **no** depende de Supabase ni del motor L-512.
     - Está pensado para ser portable a otros lenguajes.

4. **Bridge con L-512**

   - En el módulo de firma (`sign.ts` / `canonical.ts`):
     - Añadir una función para derivar LITLE-ID a partir de:
       - Digest del contenedor (ej. hash de L-512, pero como un input, no como identidad).
       - Metadatos (año, tipo de obra, namespace).
     - Garantizar que:
       - El LITLE-ID persiste incluso si la obra se re-firma con otro perfil criptográfico (L-1024), siempre que el linaje de la investigación sea el mismo.

***

## Fase 4 — Evidence Chain (RFC-0008)

**Objetivo:** Introducir un modelo de Evidence Chain persistida en Supabase, enlazado a LITLE-ID, pero independiente de L-512. [supabase](https://supabase.com/docs/guides/database/postgres/row-level-security)

1. **Esquema de base de datos (Supabase)**

   - Crear nueva migración con tablas:

     ```sql
     create table public.evidence_records (
       id uuid primary key default gen_random_uuid(),
       litle_id text not null,
       work_type text not null,          -- BK/RQ/DS/PL/AR
       owner uuid not null references auth.users(id),
       created_at timestamptz not null default now()
     );

     create table public.evidence_nodes (
       id uuid primary key default gen_random_uuid(),
       record_id uuid not null references public.evidence_records(id) on delete cascade,
       node_type text not null,          -- enum lógica: Source, Version, etc.
       parent_id uuid null references public.evidence_nodes(id),
       payload jsonb not null,           -- contenido semántico
       hash text not null,               -- sha256(payload canonical)
       created_at timestamptz not null default now()
     );
     ```

   - Node types sugeridos:
     - `Source`, `Version`, `Author`, `Signature`, `PipelineStep`, `ModelUsage`, `Prompt`, `Seed`, `Checksum`, `Config`.

2. **RLS y permisos**

   - Habilitar RLS en ambas tablas. [designrevision](https://designrevision.com/blog/supabase-row-level-security)
   - Políticas:
     - `evidence_records`:
       - Insert: `auth.uid() is not null` (usuarios autenticados).
       - Select: propietario (owner = auth.uid()) y, más adelante, registros publicados.
     - `evidence_nodes`:
       - Insert/Select restringidos a dueños del `record_id`.
   - Dejar preparado para futura política “publicado” (para vistas públicas de Evidence Chain).

3. **Funciones de servidor**

   - Crear `src/lib/evidence.functions.ts` con funciones lado servidor (TanStack Start server functions):
     - `createEvidenceRecord({ litleId, workType })`
     - `appendEvidenceNode({ recordId, nodeType, parentId?, payload })`
       - Calcula hash SHA-256 de la payload canonical y lo almacena.
     - `getEvidenceChain(litleId)`:
       - Recupera `evidence_records` + `evidence_nodes` como árbol tipado.

4. **UI de Evidence Chain**

   - Nueva ruta autenticada:
     - `src/routes/_authenticated/evidence.$litleId.tsx`:
       - Usa `getEvidenceChain(litleId)` para renderizar:
         - Árbol de nodos: tipo, hash, timestamps, payload.
       - Enfatiza el concepto de **Evidence Preservation** (badge o sección).
   - Integración con pipeline:
     - En `pipeline.functions.ts`:
       - Cada paso del pipeline (OCR, chunking, embeddings, índice, output final) debe:
         - Llamar a `appendEvidenceNode` con `node_type = "PipelineStep"` y payload describiendo:
           - Nombre del paso, hash de input/output, configuración.

***

## Fase 5 — Verificación pública + vista de Evidence Preservation

**Objetivo:** Ofrecer una ruta pública de verificación que combine perfil criptográfico + Evidence Chain, sin exigir autenticación.

1. **Nueva ruta pública**

   - `src/routes/verify.$litleId.tsx`:
     - Loader: buscar `evidence_records` + una vista mínima de nodes (solo publicados / anon-safe).
     - Mostrar:
       - LITLE-ID.
       - Work type, created_at, owner (si es público/anónimo).
       - Perfil criptográfico actual (ej. `L-512.v1`).
       - Resumen de Evidence Chain (contador de nodos, tipos principales).
       - Estado de verificación:
         - Integridad criptográfica (basado en VerificarteEngine + L-512).
         - Evidence Preservation (cadena consistente, hashes válidos).

2. **Políticas de lectura pública**

   - Añadir un flag o columna futura (ej. `published boolean`) a `evidence_records`:
     - RLS: allow SELECT para `published = true` a roles `anon` y `authenticated`.
   - Por ahora:
     - Implementar sólo lectura anónima de registros explicitamente marcados como públicos (si se añaden más adelante).

3. **UI / badges**

   - Para cada verificación:
     - Mostrar badge “Zero-Trust Verification” (estado criptográfico).
     - Mostrar badge “Evidence Preservation” (presencia y coherencia de Evidence Chain).

***

## Fase 6 — Superficie de Governance & RFC (RFC-0010)

**Objetivo:** Exponer LITLE como estándar formal mediante una sección “Standard” con RFCs, governance y proceso de propuestas.  

1. **Árbol de rutas estándar**

   - Crear `src/routes/standard/`:

     - `standard/index.tsx`:
       - Overview del LITLE Standards Council / Independent Literature Standards Committee.
       - Descripción del modelo de 7 federaciones de TAMV.
       - Explicación del proceso LIP (LITLE Improvement Proposal):
         - Cómo se propone una RFC.
         - Cómo se marcan Draft / Stable / Experimental.

     - `standard/rfcs.tsx`:
       - Índice de RFCs (0001–0010):
         - ID, título, estado, breve resumen.

     - `standard/rfcs.$rfcId.tsx`:
       - Ruta dinámica que carga contenido MDX/Markdown desde `src/content/rfcs/RFC-XXXX.md`.
       - Renderiza encabezados, estado y contenido.

2. **Contenido inicial de RFCs**

   - `src/content/rfcs/`:

     - RFC-0001 — **LITLE Identifier**
       - Definición de LITLE-ID, forma URI y humana, campos, semántica.
     - RFC-0008 — **Evidence Chain**
       - Modelo lógico de Evidence Chain, tipos de nodo, hash de payload, invariantes.
     - Otras RFCs (abstracts / stub):
       - RFC-0002 Canonical Serialization.
       - RFC-0003 Book Container.
       - RFC-0004 Merkle AST.
       - RFC-0005 Cryptographic Signature.
       - RFC-0006 Verification Protocol.
       - RFC-0007 Publication Metadata.
       - RFC-0009 Independent Archive.
       - RFC-0010 Governance.

3. **Sitemap**

   - Actualizar `sitemap.xml.ts` para incluir:
     - `/standard`, `/standard/rfcs`, `/standard/rfcs/<id>` y `/standard/archive` como rutas indexables.

***

## Fase 7 — Independent Archive placeholder (RFC-0009)

**Objetivo:** Declarar explícitamente el compromiso de archivo independiente, incluso si aún no hay integración técnica con arXiv/Zenodo.  

1. **Página de archivo**

   - Crear `src/routes/standard/archive.tsx`:
     - Describir:
       - Dónde estarán (o están) los RFC replicados:
         - arXiv, Zenodo, Internet Archive, repos institucionales.
       - Qué garantías de reproducibilidad se buscan:
         - Que cualquier tercero pueda reimplementar verificadores y reconstruir Evidence Chains a partir de las RFC y esquemas publicados.
     - Estado actual:
       - Indicar que la replicación externa está en roadmap, esta página actúa como manifiesto y estado.

***

## Fase 8 — Integración final y pulido

**Objetivo:** Conectar todas las piezas a nivel UI y garantizar consistencia técnica.  

1. **Navegación principal**

   - Actualizar top nav con entradas:
     - `Library` — acceso a libros / obras.
     - `Verify` — enlace a `/verify` (listado o form de búsqueda por LITLE-ID).
     - `Standard` — enlace a `/standard`.
     - `Governance` — alias o sección dentro de `/standard`.
     - `Submit Work` — flujo autenticado para subir una nueva obra y crear su LITLE-ID + Evidence Record.

2. **Footer**

   - Añadir new tagline:
     - “LITLE — The Standard for Preserving Knowledge. Verifying Legacy.”
   - Links rápidos a:
     - `/standard`, `/standard/rfcs`, `/standard/archive`.

3. **Sitemap y SEO**

   - Regenerar/actualizar entradas del sitemap para:
     - Rutas públicas nuevas: `/verify/*`, `/standard/*`.

4. **Typecheck & tests**

   - Ejecutar:
     - `pnpm typecheck` o `pnpm test` según setup.
   - Corregir:
     - Dependencias circulares entre `id.ts`, `sign.ts`, `verificarte.ts`.
     - Tipos Supabase para nuevas tablas (`Database` types si se generan).

***

## Notas técnicas clave

- **Perfil L-512**: se mantiene intacto como `Profile L-512 v1`, pero ahora es solo un perfil criptográfico referenciado desde RFC-0003/0005/0006, no la identidad final.  
- **LITLE-ID**: módulo completamente puro (sin Supabase), para que implementadores puedan adoptarlo de manera independiente.  
- **Evidence Chain**: sus nodos almacenan `hash` (ej. SHA-256 de payload canonical) para que la cadena sea Merkle-verificable, independiente de L-512.  
- **RLS**: todas las tablas nuevas deben tener RLS activado y políticas claras por rol (anon/authenticated), siguiendo buenas prácticas de Supabase. [dev](https://dev.to/thebenforce/lock-down-your-data-implement-row-level-security-policies-in-supabase-sql-4p82)
- **RFCs en repo**: el contenido de las RFC vive como Markdown en `src/content/rfcs`, de modo que el estándar es versionable en git, incluso si la aplicación deja de existir.  

***

## Fuera de alcance en esta iteración

- Sustituir el stand-in HMAC por una firma PQC real (ML-DSA / Dilithium); se mantiene el perfil actual como RFC-0005 v1.  
- Automatizar mirroring en arXiv/Zenodo/Internet Archive (solo se deja documentado en `standard/archive.tsx`).  
- Escalar la gobernanza multi-tenant más allá del modelo conceptual de 7 federaciones (queda como guideline en la sección Standard).  

Este plan deja a LITLE listo para evolucionar desde un motor criptográfico sólido hacia una infraestructura completa de confianza académica, en la que Lovable actúa como entorno de desarrollo y despliegue, pero el estándar vive en las RFCs y los identificadores, no en la implementación concreta.
