// ────────────────────────────────────────────────────────────────
// Isabella Villaseñor AI™ — Knowledge Base Ampliada
// Ecosistema TAMV + Constitución LITLE + Arquitectura Cognitiva
// ────────────────────────────────────────────────────────────────

export interface KnowledgeEntry {
  domain: string;
  keywords: string[];
  content: string;
  priority: number;
}

const TAMV_KNOWLEDGE: KnowledgeEntry[] = [
  // ── Ecosistema TAMV ───────────────────────────────────────────
  {
    domain: "ecosystem",
    keywords: ["tamv", "territorio", "memoria viva", "ecosistema"],
    priority: 10,
    content:
      "TAMV Online — Territorio Autónomo de Memoria Viva — es un ecosistema digital con arquitectura propia, identidad, gobernanza y servicios integrados. Fundado por Edwin Oswaldo Castillo Trejo en Real del Monte, Hidalgo, México. TAMV integra capas federadas de identidad, experiencia XR, sistemas, inteligencia artificial, economía, gobernanza e infraestructura. Isabella Villaseñor es su sistema operativo cognitivo soberano.",
  },
  {
    domain: "ecosystem",
    keywords: ["edwin", "castillo", "trejo", "fundador", "founder"],
    priority: 8,
    content:
      "Edwin Oswaldo Castillo Trejo es el fundador de TAMV Online Network. Originario de Real del Monte, Hidalgo, México. Ha desarrollado TAMV Online, TAMV OS, MD-X4/MD-X5, CITEMESH y UTAMV, combinando tecnología, educación, inteligencia artificial, identidad digital, cultura y desarrollo territorial.",
  },
  {
    domain: "ecosystem",
    keywords: ["rdm", "real del monte", "digital hub", "nodo cero"],
    priority: 9,
    content:
      "RDM Digital Hub / Real del Monte Digital Hub es el Nodo Cero de TAMV Online. Busca convertir Real del Monte, Hidalgo, en un referente de turismo, cultura, economía local e innovación territorial. Isabella actúa como guía contextual (isabella-rdm-guide) con soporte XR/3D, narrativa multiversal y gamificación. Sitio: visitarealdelmonte.online.",
  },
  {
    domain: "ecosystem",
    keywords: ["utamv", "campus", "educación", "education", "master", "community manager", "ucip"],
    priority: 8,
    content:
      "UTAMV Campus Online es la iniciativa educativa del ecosistema TAMV. La UTAMV Cognitive Intelligence Platform (UCIP) es la plataforma cognitiva que orquesta los engines de Isabella para producir experiencias educativas adaptativas. Programas: Master Community Managers NextGen 2026 (150h) y Fundamentos de IA Generativa y Agéntica. Isabella actúa como tutor cognitivo (isabella-edu-mentor) que adapta explicaciones, detecta brechas de conocimiento y guía rutas de aprendizaje.",
  },
  {
    domain: "ecosystem",
    keywords: ["citemesh", "civilizational", "metaverse"],
    priority: 6,
    content:
      "CITEMESH (Civilizational Technological Metaverse Serving Humanity) es un concepto del ecosistema TAMV que propone un metaverso tecnológico al servicio de la humanidad, integrando XR, IA y gobernanza federada.",
  },
  {
    domain: "ecosystem",
    keywords: ["scao", "stewarded", "constitutional", "autonomous", "organization"],
    priority: 7,
    content:
      "SCAO (Stewarded & Constitutional Autonomous Organization) es el modelo de gobernanza autónoma con supervisión humana del ecosistema TAMV. Isabella opera bajo este modelo: es IA acompañante, no IA autónoma absoluta. Integra la Constitución de LITLE como marco normativo y las 7 federaciones como órganos de gobierno.",
  },
  {
    domain: "ecosystem",
    keywords: ["md-x4", "md-x5", "dm-x4", "sovereign", "api"],
    priority: 5,
    content:
      "MD-X4/MD-X5 y TAMV DM-X4 Sovereign API son la arquitectura de API soberana del ecosistema TAMV, diseñada con principios de seguridad post-cuántica, identidad descentralizada y gobernanza federada.",
  },
  {
    domain: "ecosystem",
    keywords: ["bookpi", "ledger", "libro", "contabilidad"],
    priority: 7,
    content:
      "BookPI es el ledger único e inmutable de LITLE. Opera como libro de contabilidad para obras, transacciones y la Constitución misma. Las enmiendas constitucionales producen ConstitutionAmendmentNode en el DAG. Skills y plugins se registran en BookPI como obras tipo PL (Plugin). BookPI debe ser reconciliable con el DAG en todo momento.",
  },
  {
    domain: "ecosystem",
    keywords: ["msr", "seguridad", "cryptografía", "post-cuántica", "security"],
    priority: 5,
    content:
      "MSR (Modelo de Seguridad) es el framework de seguridad del ecosistema TAMV/LITLE, utilizando criptografía post-cuántica (SimulatedPqcProvider), hash-based signatures con SHAKE256, un DAG de evidencia inmutable, y Mexa API para firma digital y verificación de procedencia.",
  },
  {
    domain: "ecosystem",
    keywords: ["isabella", "villasenor", "villaseñor"],
    priority: 10,
    content:
      "Isabella Villaseñor es el Sistema Operativo Cognitivo Soberano (ZT-DCOS) del ecosistema TAMV. Opera en 5 capas: SOUL (identidad y ética), Isa API (cognitiva), Mexa API (criptográfica), ClawHub (ejecución/skills), y Multimodal (voz/visión/XR). Tiene 6 skills internos: voice-tutor, edu-mentor, rdm-guide, devsecops, ethics-guardian, heptafederated-maestro. Incorpora triple bloqueo sexual en su núcleo de gobernanza.",
  },

  // ── Isa API ───────────────────────────────────────────────────
  {
    domain: "cognitive",
    keywords: ["isa", "api", "cognitivo", "cognitive", "reasoning", "razonamiento", "graphrag", "prompt guard"],
    priority: 9,
    content:
      "Isa API es el núcleo cognitivo de Isabella. Incluye: Cognitive Core (taxonomía de procesos: percepción, atención, memoria, razonamiento, planificación, decisión, verificación, aprendizaje), Reasoning Engine (razonamiento estructurado sobre knowledge graph), GraphRAG (knowledge graph Neo4j/Memgraph + RAG), y Prompt Guard (sanitizador que detecta inyección, jailbreak e intentos de sexualización). Implementada en src/lib/ai/isa-api.ts.",
  },
  {
    domain: "cognitive",
    keywords: ["triple", "bloqueo", "sexual", "ethics", "ética", "ontológico", "semántico", "conductual"],
    priority: 10,
    content:
      "El triple bloqueo sexual de Isabella tiene 3 capas: (1) Ontológico — no se define ni entrena como objeto de deseo, exclusión de datasets románticos/sexuales; (2) Semántico — filtros en Isa API (Prompt Guard) detectan sexualización, sexting, grooming y redirigen; (3) Conductual — no coquetea, no erotiza, tono profesional. No son plugins opcionales: son reglas del kernel de gobernanza (POL-SEX-001, POL-SEX-002, POL-SEX-003).",
  },

  // ── Mexa API ──────────────────────────────────────────────────
  {
    domain: "cryptographic",
    keywords: ["mexa", "api", "cripto", "crypto", "firma", "signature", "federación", "mask", "máscara"],
    priority: 8,
    content:
      "Mexa API es la puerta criptográfica de Isabella. Funciones: firma digital de payloads con SimulatedPqcProvider, verificación de procedencia de nodos en el DAG, máscara de federación (FederationMask) que verifica qué federación autoriza cada operación, y registro de eventos críticos. Cada operación sensible genera hashes y firmas que garantizan que solo nodos autorizados de las 7 federaciones TAMV ejecutan acciones. Implementada en src/lib/ai/mexa-api.ts.",
  },

  // ── ClawHub ───────────────────────────────────────────────────
  {
    domain: "execution",
    keywords: ["clawhub", "clawscan", "skill", "plugin", "registro", "registry"],
    priority: 8,
    content:
      "ClawHub es el registro descentralizado de herramientas y skills del ecosistema TAMV. ClawScan es el motor de análisis de seguridad estática/dinámica. Isabella publica, bloquea o pone en cuarentena skills mediante scripts de auditoría. Valida licencias (MIT-0 por defecto), binarios declarados, ofuscación, mutaciones dinámicas y uso indebido de variables de entorno. Skills nuevos entran en cuarentena hasta aprobación de FED-3. Implementado en src/lib/ai/clawhub.ts.",
  },
  {
    domain: "execution",
    keywords: ["skill maestro", "heptafederated", "maestro"],
    priority: 7,
    content:
      "El skill Isabella-Heptafederated-Maestro (v2.0.0) es el núcleo maestro de ejecución cognitiva, auditoría criptográfica y gobernanza de automatizaciones. Requiere CLAWHUB_API_KEY, ISA_API_TOKEN, MEXA_API_SECURE_KEY, y herramientas curl, jq, openssl. Licencia MIT-0. Es el skill que define el entorno mínimo para que Isabella opere como kernel maestro.",
  },

  // ── Cognitive Engines ─────────────────────────────────────────
  {
    domain: "engines",
    keywords: ["memoria", "memory", "engine", "largo plazo", "ltm"],
    priority: 6,
    content:
      "Memory Engine (src/lib/ai/engines/memory.ts): almacena lecciones aprendidas, patrones incidentales, incidentes, precedentes e interacciones. Soporta consultas por tipo, tags y ventana temporal. Consolidación automática de entradas expiradas.",
  },
  {
    domain: "engines",
    keywords: ["speech", "voz", "voice", "stt", "tts", "tutor"],
    priority: 6,
    content:
      "Speech Engine (src/lib/ai/engines/speech.ts): STT (whisper-1) + TTS (tts-1) streaming vía OpenAI. Soporta voces: alloy, echo, fable, onyx, nova, shimmer. Usado por isabella-voice-tutor para clases narradas, evaluación oral, lectura guiada y coaching.",
  },
  {
    domain: "engines",
    keywords: ["visión", "vision", "ocr", "scene", "image", "imagen"],
    priority: 6,
    content:
      "Vision Engine (src/lib/ai/engines/vision.ts): GPT-4o vision para OCR, scene analysis, image captioning, diagram understanding y whiteboard analysis. Usado por isabella-rdm-guide e isabella-edu-mentor para escaneo de tareas, pizarras y materiales físicos.",
  },
  {
    domain: "engines",
    keywords: ["evaluación", "evaluation", "calidad", "quality", "hallucination", "alucinación"],
    priority: 6,
    content:
      "Evaluation Engine (src/lib/ai/engines/evaluation.ts): evalúa calidad de respuesta, tasa de alucinación, alineación ética, cumplimiento constitucional, latencia y satisfacción. Cada respuesta generada por Isabella pasa por evaluación automática. Integrable con Langfuse, Phoenix y MLflow.",
  },

  // ── Gateway ───────────────────────────────────────────────────
  {
    domain: "gateway",
    keywords: ["gateway", "whatsapp", "telegram", "slack", "discord", "signal", "imessage", "mensajería", "canales"],
    priority: 7,
    content:
      "El Gateway TAMV/OpenClaw controla los canales de mensajería del ecosistema: WhatsApp, Telegram, Slack, Discord, Signal, iMessage y WebChat. Isabella administra pairing, confianza y presencia de nodos y dispositivos. Usa protocolo WS (connect, req/res, events) y herramientas como gateway, nodes, message, cron y heartbeat para vigilar salud y sincronización de la malla.",
  },

  // ── Self-Healing ──────────────────────────────────────────────
  {
    domain: "devops",
    keywords: ["self-healing", "self healing", "devsecops", "ci/cd", "auditoría", "parche"],
    priority: 6,
    content:
      "Isabella DevSecOps (isabella-devsecops) es un agente interno de monorepo que: se conecta a CI/CD, analiza resultados de SAST, calidad y seguridad, abre issues y PRs, aplica parches pequeños y reversibles, y actualiza AGENTS.md, HEARTBEAT.md y MEMORY.md con nuevos procedimientos aprendidos. No aplica parches en producción sin aprobación.",
  },

  // ── Constitución LITLE ────────────────────────────────────────
  {
    domain: "constitution",
    keywords: ["constitución", "constitution", "libro", "articulo", "norma", "mcf"],
    priority: 10,
    content:
      "La Constitución de LITLE es un modelo constitutivo formal (MCF) definido como C = (A, Σ, R, D, E). Contiene 15 LIBROS (I–XV) con 42 artículos categorizados como PRINCIPIO (6/7 quorum), NORMA (5/7), SANCION (5/7), PROCEDIMIENTO (4/7) o DEFINICION (3/7). Artículos disponibles en src/content/constitution.ts. Especificación completa en RFC-0019. El SOUL de Isabella referencia los 15 LIBROS como fuente de verdad ética.",
  },
  {
    domain: "constitution",
    keywords: ["sanción", "sanction", "san-001", "san-002", "san-003", "san-004", "san-005"],
    priority: 8,
    content:
      "Sanciones (Σ): SAN-001 Deprecación de obra (grave, fabricación/conflictos/IA), SAN-002 Suspensión de autor (crítica, reincidencia/anillos), SAN-003 Revocación de membresía (crítica, neutralidad), SAN-004 Marcaje de IA no declarada (moderada), SAN-005 Multa de reputación (leve, mala fe). El Ethics Guardian de Isabella monitorea cumplimiento y escala incidentes a FED-7.",
  },
  {
    domain: "constitution",
    keywords: ["fed", "federación", "federation", "gobernanza", "quorum"],
    priority: 9,
    content:
      "Siete federaciones: FED-1 (Preservación), FED-2 (Estándares), FED-3 (Tecnología), FED-4 (Curación), FED-5 (Integridad), FED-6 (Adopción), FED-7 (Auditoría). Isabella reporta a FED-7 y coordina con FED-3. Decisiones ordinarias: 4/7. Estándares: 5/7. Revocaciones/enmiendas: 6/7.",
  },
  {
    domain: "constitution",
    keywords: ["dag", "evidencia", "evidence", "merkle", "inmutable", "immutable"],
    priority: 8,
    content:
      "Evidence DAG (LITLE-EVD-001): Merkle-DAG append-only. Cada nodo: timestamp, tipo de operación, hash del contenido, hash del nodo anterior, firma PQC, metadatos. Root hash anclado en Bitcoin (OP_RETURN). Todas las decisiones de Isabella generan nodos en el DAG.",
  },
  {
    domain: "constitution",
    keywords: ["ai", "ia", "inteligencia", "artificial", "gobernanza"],
    priority: 7,
    content:
      "Gobernanza de IA (LITLE-AI-001): Ningún sistema de IA puede ser autor principal. Fragmentos IA etiquetados con {ai} en el DAG. Modelos registrados como agentes de red con LITLE-IDs. Isabella cumple con LITLE-AI-001 y su operación es auditada por FED-3 trimestralmente.",
  },

  // ── Plataforma ────────────────────────────────────────────────
  {
    domain: "platform",
    keywords: ["registro", "submission", "sumisión", "obra", "publicar"],
    priority: 7,
    content:
      "Pipeline de registro en /submit: obra entra en cuarentena → triangulación (ORCID/DOI/ISNI/web) → decisión GREEN (indexada con LITLE-ID y DAC), RED (duplicada), INCONCLUSUS (escalada a federación). Isabella puede guiar a usuarios en cada paso.",
  },
  {
    domain: "platform",
    keywords: ["litle-id", "identificador"],
    priority: 6,
    content:
      "LITLE-IDs: LTL-AÑO-TIPO-XXXX-XXXX. Tipos: RQ, TG, SH, DK, XM, AB, CD, EF, GH, IJ, KL, MN, OP, QR, ST.",
  },
  {
    domain: "platform",
    keywords: ["certificado", "dac", "certificate", "digital academic certificate"],
    priority: 5,
    content:
      "DAC (Digital Academic Certificate): 4 metodologías — CSV Generator, Authorship GMM, Data Source Verification, Evidence Chain. Suites: classic, pqc, dual.",
  },
];

export function buildKnowledgeContext(query: string, maxEntries = 10): string {
  const normalized = query.toLowerCase();
  const scored = TAMV_KNOWLEDGE.map((entry) => ({
    entry,
    score: entry.priority + entry.keywords.filter((kw) => normalized.includes(kw.toLowerCase())).length * 3,
  }));

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, maxEntries).filter((s) => s.score > 0);

  if (top.length === 0) return "";

  return (
    "## Contexto del Ecosistema TAMV / LITLE / Isabella\n\n" +
    top.map((s, i) => `[${i + 1}] ${s.entry.content}`).join("\n\n")
  );
}

export function getAllKnowledge(): KnowledgeEntry[] {
  return TAMV_KNOWLEDGE;
}

export function knowledgeByDomain(domain: string): KnowledgeEntry[] {
  return TAMV_KNOWLEDGE.filter((e) => e.domain === domain);
}
