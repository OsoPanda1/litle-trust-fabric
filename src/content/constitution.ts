// ────────────────────────────────────────────────────────────────
// LITLE Institutional Constitution — Formal Constitutive Model
// Specification: RFC-0019 | LITLE-ID: LTL-2026-BK-CONSTITUCION-LITLE-0001
// Paradigm: Modelo Constitutivo Formal (MCF)
// ────────────────────────────────────────────────────────────────

// ── 1. Foundational Types ───────────────────────────────────────

/** Categoría constitucional — determina el peso normativo */
export type CategoriaConstitucional =
  | "PRINCIPIO"       // Fundamental, immutable (requires 6/7 quorum to amend)
  | "NORMA"           // Regla específica (5/7 quorum)
  | "PROCEDIMIENTO"   // Cómo se aplica una norma (4/7 quorum)
  | "SANCION"         // Consecuencia de violación (5/7 quorum)
  | "DEFINICION";     // Glosario formal (3/7 quorum)

/** Tipo de LIBRO */
export type TipoLibro =
  | "POL"   // Política institucional
  | "PHI"   // Filosofía
  | "CON"   // Conducta y ética
  | "ATH"   // Autoría
  | "DUT"   // Derechos y obligaciones
  | "AI"    // Gobernanza de IA
  | "GOV"   // Gobernanza
  | "EVD"   // Evidence DAG
  | "PRS"   // BookPI / Ledger
  | "COM";  // Comunidad

/** Nivel jerárquico dentro del modelo constitutivo */
export type JerarquiaNormativa = 1 | 2 | 3 | 4;
// 1 = Principio (fundacional)
// 2 = Norma general
// 3 = Reglamento específico
// 4 = Procedimiento operativo

/** Estado de un artículo constitucional */
export type EstadoArticulo =
  | "vigente"
  | "derogado"
  | "enmendado"
  | "propuesto";

// ── 2. Core Entities ────────────────────────────────────────────

export interface Articulo {
  id: string;                    // ej. "LITLE-POL-001.3"
  libro: string;                 // ej. "LIBRO-I"
  categoria: CategoriaConstitucional;
  jerarquia: JerarquiaNormativa;
  titulo: string;
  texto: string;
  estado: EstadoArticulo;
  dependeDe: string[];           // IDs de artículos de los que depende
  sancionAsociada?: string;      // ID de sanción aplicable
}

export interface Sancion {
  id: string;
  nombre: string;
  gravedad: "leve" | "moderada" | "grave" | "critica";
  descripcion: string;
  aplicaA: string[];             // IDs de artículos que la activan
  procedimiento: string;         // Cómo se aplica
  apelacionPosible: boolean;
  registroEnDAG: boolean;        // Siempre true en producción
}

export interface RelacionConstitucional {
  origen: string;                // ID de artículo
  destino: string;               // ID de artículo
  tipo: "deriva_de" | "complementa" | "restringe" | "autoriza" | "deroga";
  justificacion: string;
}

// ── 3. Formal Constitutive Model ────────────────────────────────

/**
 * Modelo Constitutivo Formal (MCF) de LITLE.
 *
 * Definición: C = (A, Σ, R, D, E)
 *   A = conjunto de artículos
 *   Σ = conjunto de sanciones
 *   R = relaciones entre artículos (DAG)
 *   D = dependencias funcionales
 *   E = matriz de enforcement (quórum × categoría)
 */
export interface ConstitutiveModel {
  readonly articulos: Articulo[];
  readonly sanciones: Sancion[];
  readonly relaciones: RelacionConstitucional[];
  readonly quorumMatrix: Record<CategoriaConstitucional, number>; // mínimo / total
}

// ── 4. Domain: Libro ────────────────────────────────────────────

export interface Libro {
  id: string;
  code: string;
  title: string;
  tipo: TipoLibro;
  categoria: CategoriaConstitucional;
  jerarquia: JerarquiaNormativa;
  rfc: string;
  summary: string;
  articulos: Articulo[];
  dependeDe: string[];  // IDs de otros LIBROS
}

// ── 5. The Constitution ─────────────────────────────────────────

export const CONSTITUTION: {
  title: string;
  litleId: string;
  enacted: string;
  model: ConstitutiveModel;
  libri: Libro[];
} = {
  title: "CONSTITUCIÓN INSTITUCIONAL DE LITLE",
  litleId: "LTL-2026-BK-CONSTITUCION-LITLE-0001",
  enacted: "2026-07-21",

  model: {
    articulos: [],
    sanciones: [
      {
        id: "SAN-001",
        nombre: "Deprecación de obra",
        gravedad: "grave",
        descripcion: "La obra infractora es marcada como deprecated en el DAG. Pierde su certificación activa pero permanece en la cadena.",
        aplicaA: ["LITLE-CON-001.1", "LITLE-CON-001.2", "LITLE-CON-001.3"],
        procedimiento: "FED-5 emite resolución. 7 días para apelar. Deprecación irreversible tras confirmación.",
        apelacionPosible: true,
        registroEnDAG: true,
      },
      {
        id: "SAN-002",
        nombre: "Suspensión de autor",
        gravedad: "critica",
        descripcion: "El autor pierde capacidad de registrar nuevas obras por un período determinado (90/180/365 días según reincidencia).",
        aplicaA: ["LITLE-CON-001.4", "LITLE-ATH-002.3", "LITLE-DUT-002.4"],
        procedimiento: "FED-7 evalúa, FED-5 ejecuta. Reincidencia duplica el período. Apelación a plenario de 7 federaciones.",
        apelacionPosible: true,
        registroEnDAG: true,
      },
      {
        id: "SAN-003",
        nombre: "Revocación de membresía de federación",
        gravedad: "critica",
        descripcion: "Un miembro de federación que viole la neutralidad (LITLE-POL-002) o el código de ética es removido.",
        aplicaA: ["LITLE-POL-002.2", "LITLE-GOV-001.4"],
        procedimiento: "Requiere 6/7 quorum. Sin apelación. Registro permanente en DAG.",
        apelacionPosible: false,
        registroEnDAG: true,
      },
      {
        id: "SAN-004",
        nombre: "Marcaje de IA no declarada",
        gravedad: "moderada",
        descripcion: "Fragmentos no declarados como IA son marcados con estampillo público. Obra permanece visible pero señalada.",
        aplicaA: ["LITLE-AI-001.1", "LITLE-AI-001.2"],
        procedimiento: "Automático tras verificación FED-3. Autor notificado. Corrección en 14 días o escala a SAN-001.",
        apelacionPosible: true,
        registroEnDAG: true,
      },
      {
        id: "SAN-005",
        nombre: "Multa de reputación",
        gravedad: "leve",
        descripcion: "Disminución temporal del score epistémico en 0.5 puntos por 90 días.",
        aplicaA: ["LITLE-CON-002.2", "LITLE-ATH-002.2", "LITLE-DUT-002.3"],
        procedimiento: "Automático tras verificación de incumplimiento. Escala a SAN-002 si reincide.",
        apelacionPosible: true,
        registroEnDAG: true,
      },
    ],
    relaciones: [],
    quorumMatrix: {
      PRINCIPIO: 6,
      NORMA: 5,
      PROCEDIMIENTO: 4,
      SANCION: 5,
      DEFINICION: 3,
    },
  },

  libri: [
    {
      id: "LIBRO-I", code: "LITLE-POL-001", title: "Institutional Purpose", tipo: "POL",
      categoria: "PRINCIPIO", jerarquia: 1, rfc: "RFC-0019",
      summary: "LITLE existe como estándar abierto para preservar el conocimiento académico, verificar su linaje y sobrevivir a las plataformas que lo alojan.",
      dependeDe: [],
      articulos: [
        { id: "LITLE-POL-001.1", libro: "LIBRO-I", categoria: "PRINCIPIO", jerarquia: 1, titulo: "Misión", texto: "LITLE es un estándar abierto, soberano y perpetuo para el registro, verificación y preservación del conocimiento académico global, con raíz en América Latina.", estado: "vigente", dependeDe: [] },
        { id: "LITLE-POL-001.2", libro: "LIBRO-I", categoria: "PRINCIPIO", jerarquia: 1, titulo: "Permanencia", texto: "La infraestructura de LITLE debe operar independientemente de plataformas comerciales, gobiernos o corporaciones. El DAG de evidencia es append-only y replicable.", estado: "vigente", dependeDe: ["LITLE-POL-001.1"] },
        { id: "LITLE-POL-001.3", libro: "LIBRO-I", categoria: "NORMA", jerarquia: 2, titulo: "Jurisdicción", texto: "LITLE se rige por esta Constitución y por el derecho internacional de los derechos humanos. Ninguna legislación nacional prevalece sobre los principios constitucionales de LITLE.", estado: "vigente", dependeDe: ["LITLE-POL-001.1", "LITLE-POL-002.1"] },
      ],
    },
    {
      id: "LIBRO-II", code: "LITLE-PHI-001", title: "Institutional Philosophy", tipo: "PHI",
      categoria: "PRINCIPIO", jerarquia: 1, rfc: "RFC-0019",
      summary: "Neutralidad, integridad y durabilidad. LITLE no respalda ni censura contenido.",
      dependeDe: ["LIBRO-I"],
      articulos: [
        { id: "LITLE-PHI-001.1", libro: "LIBRO-II", categoria: "PRINCIPIO", jerarquia: 1, titulo: "Neutralidad epistémica", texto: "LITLE no evalúa la verdad de las obras, solo su integridad, linaje y reproducibilidad. La verdad es del dominio de las comunidades epistémicas, no de la plataforma.", estado: "vigente", dependeDe: ["LITLE-POL-001.1"] },
        { id: "LITLE-PHI-001.2", libro: "LIBRO-II", categoria: "PRINCIPIO", jerarquia: 1, titulo: "Primacía del conocimiento", texto: "La tecnología sirve al conocimiento humano, no al revés. Ningún algoritmo, modelo o agente de IA puede sustituir el juicio epistémico humano como autoridad final.", estado: "vigente", dependeDe: ["LITLE-PHI-001.1"] },
        { id: "LITLE-PHI-001.3", libro: "LIBRO-II", categoria: "NORMA", jerarquia: 2, titulo: "No censura", texto: "LITLE no eliminará obras del DAG. La deprecación es el mecanismo máximo de desautorización. Cualquier solicitud gubernamental de eliminación será registrada como nodo público en el DAG.", estado: "vigente", dependeDe: ["LITLE-PHI-001.1"] },
      ],
    },
    {
      id: "LIBRO-III", code: "LITLE-CON-001", title: "Code of Ethics", tipo: "CON",
      categoria: "PRINCIPIO", jerarquia: 1, rfc: "RFC-0019",
      summary: "Prohibición de datos fabricados y firmas falsificadas. Declaración obligatoria de conflictos de interés y uso de IA.",
      dependeDe: ["LIBRO-II"],
      articulos: [
        { id: "LITLE-CON-001.1", libro: "LIBRO-III", categoria: "NORMA", jerarquia: 2, titulo: "Prohibición de fabricación", texto: "Ninguna obra registrada puede contener datos fabricados, resultados falsificados o firmas digitales forjadas. La detección de fabricación activa SAN-001.", estado: "vigente", dependeDe: ["LITLE-PHI-001.1"], sancionAsociada: "SAN-001" },
        { id: "LITLE-CON-001.2", libro: "LIBRO-III", categoria: "NORMA", jerarquia: 2, titulo: "Declaración de conflictos", texto: "Todo autor debe declarar conflictos de interés financieros, institucionales o personales al momento del registro. La omisión intencional activa SAN-001.", estado: "vigente", dependeDe: ["LITLE-CON-001.1"], sancionAsociada: "SAN-001" },
        { id: "LITLE-CON-001.3", libro: "LIBRO-III", categoria: "NORMA", jerarquia: 2, titulo: "Declaración de IA", texto: "Todo uso de inteligencia artificial en la generación, análisis o redacción de una obra debe ser declarado explícitamente en los metadatos. La omisión intencional activa SAN-004, y en caso de reincidencia SAN-001.", estado: "vigente", dependeDe: ["LITLE-CON-001.1", "LITLE-AI-001.1"], sancionAsociada: "SAN-004" },
        { id: "LITLE-CON-001.4", libro: "LIBRO-III", categoria: "SANCION", jerarquia: 3, titulo: "Reincidencia", texto: "Tres violaciones del Código de Ética en un período de 2 años activan SAN-02 (suspensión de autor) por 365 días.", estado: "vigente", dependeDe: ["LITLE-CON-001.1", "LITLE-CON-001.2", "LITLE-CON-001.3"], sancionAsociada: "SAN-002" },
      ],
    },
    {
      id: "LIBRO-IV", code: "LITLE-CON-002", title: "Principles of Conduct", tipo: "CON",
      categoria: "PRINCIPIO", jerarquia: 2, rfc: "RFC-0019",
      summary: "Transparencia metodológica, atribución, financiamiento y participación de buena fe.",
      dependeDe: ["LIBRO-III"],
      articulos: [
        { id: "LITLE-CON-002.1", libro: "LIBRO-IV", categoria: "NORMA", jerarquia: 2, titulo: "Transparencia metodológica", texto: "Toda obra debe describir su metodología con nivel de detalle suficiente para permitir reproducibilidad independiente.", estado: "vigente", dependeDe: ["LITLE-PHI-001.2"] },
        { id: "LITLE-CON-002.2", libro: "LIBRO-IV", categoria: "NORMA", jerarquia: 2, titulo: "Buena fe", texto: "Los participantes deben actuar de buena fe. El acoso, la manipulación de métricas y el abuso del sistema de verificación son violaciones que activan SAN-005.", estado: "vigente", dependeDe: [], sancionAsociada: "SAN-005" },
        { id: "LITLE-CON-002.3", libro: "LIBRO-IV", categoria: "PROCEDIMIENTO", jerarquia: 3, titulo: "Revisión por FED-7", texto: "Las violaciones del Libro IV son evaluadas por FED-7 (Audit & Compliance). El fed tiene 30 días para emitir resolución. El acusado tiene 14 días para presentar descargos.", estado: "vigente", dependeDe: ["LITLE-CON-002.2"] },
      ],
    },
    {
      id: "LIBRO-V", code: "LITLE-ATH-001", title: "Authorship", tipo: "ATH",
      categoria: "NORMA", jerarquia: 2, rfc: "RFC-0019",
      summary: "Cinco niveles de contribución con derechos y responsabilidades distintos.",
      dependeDe: ["LIBRO-IV"],
      articulos: [
        { id: "LITLE-ATH-001.1", libro: "LIBRO-V", categoria: "DEFINICION", jerarquia: 4, titulo: "Autor principal", texto: "Concibe, ejecuta y lidera la investigación. Responsable principal de la integridad de la obra. Aparece primero en los metadatos.", estado: "vigente", dependeDe: [] },
        { id: "LITLE-ATH-001.2", libro: "LIBRO-V", categoria: "DEFINICION", jerarquia: 4, titulo: "Coautor", texto: "Contribuye sustancialmente al diseño, ejecución o análisis. Comparte responsabilidad sobre la integridad.", estado: "vigente", dependeDe: [] },
        { id: "LITLE-ATH-001.3", libro: "LIBRO-V", categoria: "DEFINICION", jerarquia: 4, titulo: "Contribuyente técnico", texto: "Aporta infraestructura técnica, software, equipos o reactivos. No necesariamente participa del diseño intelectual.", estado: "vigente", dependeDe: [] },
        { id: "LITLE-ATH-001.4", libro: "LIBRO-V", categoria: "DEFINICION", jerarquia: 4, titulo: "Revisor", texto: "Evalúa crítica y metodológicamente la obra antes de su publicación. Su identidad queda registrada en el DAG.", estado: "vigente", dependeDe: [] },
        { id: "LITLE-ATH-001.5", libro: "LIBRO-V", categoria: "DEFINICION", jerarquia: 4, titulo: "Colaborador documental", texto: "Aporta fuentes, datos, traducciones o material de archivo. No necesariamente participa del análisis.", estado: "vigente", dependeDe: [] },
        { id: "LITLE-ATH-001.6", libro: "LIBRO-V", categoria: "NORMA", jerarquia: 2, titulo: "Registro obligatorio", texto: "Toda obra debe declarar el nivel de contribución de cada autor en los metadatos. El orden de autores debe reflejar el nivel de contribución.", estado: "vigente", dependeDe: ["LITLE-ATH-001.1", "LITLE-ATH-001.2", "LITLE-ATH-001.3", "LITLE-ATH-001.4", "LITLE-ATH-001.5"] },
      ],
    },
    {
      id: "LIBRO-VI", code: "LITLE-ATH-002", title: "Citation and Integrity", tipo: "ATH",
      categoria: "NORMA", jerarquia: 2, rfc: "RFC-0019",
      summary: "Citas precisas y verificables. Prohibición de autocitación abusiva y anillos de citación.",
      dependeDe: ["LIBRO-V"],
      articulos: [
        { id: "LITLE-ATH-002.1", libro: "LIBRO-VI", categoria: "NORMA", jerarquia: 2, titulo: "Precisión de citas", texto: "Toda cita debe ser verificable contra la fuente original. Citas secundarias deben declararse como tales.", estado: "vigente", dependeDe: ["LITLE-CON-002.1"] },
        { id: "LITLE-ATH-002.2", libro: "LIBRO-VI", categoria: "NORMA", jerarquia: 2, titulo: "Autocitación", texto: "La autocitación no debe exceder el 15% de las referencias totales. El exceso no justificado activa SAN-005.", estado: "vigente", dependeDe: ["LITLE-ATH-002.1"], sancionAsociada: "SAN-005" },
        { id: "LITLE-ATH-002.3", libro: "LIBRO-VI", categoria: "NORMA", jerarquia: 2, titulo: "Anillos de citación", texto: "Queda prohibida la coordinación entre autores para citarse mutuamente con el fin de inflar métricas. La detección activa SAN-002.", estado: "vigente", dependeDe: ["LITLE-ATH-002.1"], sancionAsociada: "SAN-002" },
        { id: "LITLE-ATH-002.4", libro: "LIBRO-VI", categoria: "PROCEDIMIENTO", jerarquia: 3, titulo: "Verificación de citas", texto: "El motor de triangulación verifica cada cita contra CrossRef/DOI. Las discrepancias se registran como nodos en el DAG.", estado: "vigente", dependeDe: ["LITLE-ATH-002.1"] },
      ],
    },
    {
      id: "LIBRO-VII", code: "LITLE-ATH-003", title: "Recognition and Attribution", tipo: "ATH",
      categoria: "NORMA", jerarquia: 3, rfc: "RFC-0019",
      summary: "Diez funciones del ciclo de reconocimiento con registro obligatorio en el DAG.",
      dependeDe: ["LIBRO-V"],
      articulos: [
        { id: "LITLE-ATH-003.1", libro: "LIBRO-VII", categoria: "DEFINICION", jerarquia: 4, titulo: "Autoría intelectual", texto: "Concepción original, diseño metodológico, interpretación de resultados.", estado: "vigente", dependeDe: [] },
        { id: "LITLE-ATH-003.2", libro: "LIBRO-VII", categoria: "DEFINICION", jerarquia: 4, titulo: "Curación de datos", texto: "Recolección, limpieza, organización y preservación de datos.", estado: "vigente", dependeDe: [] },
        { id: "LITLE-ATH-003.3", libro: "LIBRO-VII", categoria: "DEFINICION", jerarquia: 4, titulo: "Digitalización", texto: "Conversión de fuentes analógicas a formato digital.", estado: "vigente", dependeDe: [] },
        { id: "LITLE-ATH-003.4", libro: "LIBRO-VII", categoria: "DEFINICION", jerarquia: 4, titulo: "Desarrollo de software", texto: "Creación de código, scripts o herramientas computacionales.", estado: "vigente", dependeDe: [] },
        { id: "LITLE-ATH-003.5", libro: "LIBRO-VII", categoria: "DEFINICION", jerarquia: 4, titulo: "Visualización", texto: "Creación de figuras, tablas, dashboards o representaciones gráficas.", estado: "vigente", dependeDe: [] },
        { id: "LITLE-ATH-003.6", libro: "LIBRO-VII", categoria: "DEFINICION", jerarquia: 4, titulo: "Supervisión", texto: "Dirección general del proyecto, mentoría, coordinación.", estado: "vigente", dependeDe: [] },
        { id: "LITLE-ATH-003.7", libro: "LIBRO-VII", categoria: "DEFINICION", jerarquia: 4, titulo: "Adquisición de fondos", texto: "Gestión de recursos financieros para la investigación.", estado: "vigente", dependeDe: [] },
        { id: "LITLE-ATH-003.8", libro: "LIBRO-VII", categoria: "DEFINICION", jerarquia: 4, titulo: "Administración del proyecto", texto: "Gestión operativa, logística, coordinación de equipos.", estado: "vigente", dependeDe: [] },
        { id: "LITLE-ATH-003.9", libro: "LIBRO-VII", categoria: "DEFINICION", jerarquia: 4, titulo: "Validación", texto: "Verificación de resultados, réplica de experimentos, revisión de código.", estado: "vigente", dependeDe: [] },
        { id: "LITLE-ATH-003.10", libro: "LIBRO-VII", categoria: "DEFINICION", jerarquia: 4, titulo: "Análisis formal", texto: "Aplicación de métodos estadísticos, matemáticos o computacionales.", estado: "vigente", dependeDe: [] },
      ],
    },
    {
      id: "LIBRO-VIII", code: "LITLE-DUT-001", title: "Rights of Authors", tipo: "DUT",
      categoria: "PRINCIPIO", jerarquia: 2, rfc: "RFC-0019",
      summary: "Los autores retienen propiedad intelectual. LITLE no posee copyright.",
      dependeDe: ["LIBRO-I"],
      articulos: [
        { id: "LITLE-DUT-001.1", libro: "LIBRO-VIII", categoria: "PRINCIPIO", jerarquia: 1, titulo: "Retención de propiedad", texto: "Los autores retienen todos los derechos de propiedad intelectual sobre sus obras. LITLE no reclama ningún derecho de copyright, licencia o explotación.", estado: "vigente", dependeDe: ["LITLE-POL-001.1"] },
        { id: "LITLE-DUT-001.2", libro: "LIBRO-VIII", categoria: "NORMA", jerarquia: 2, titulo: "Licencia obligatoria", texto: "Toda obra debe declarar una licencia de uso (CC-BY, CC0, etc.) en sus metadatos. Obras sin licencia no son admitidas.", estado: "vigente", dependeDe: ["LITLE-DUT-001.1"] },
        { id: "LITLE-DUT-001.3", libro: "LIBRO-VIII", categoria: "PROCEDIMIENTO", jerarquia: 3, titulo: "Retiro normativo", texto: "Un autor puede solicitar la deprecación archivística de su obra. La obra permanece en el DAG como nodo deprecated pero deja de aparecer en búsquedas activas.", estado: "vigente", dependeDe: ["LITLE-PHI-001.3"] },
        { id: "LITLE-DUT-001.4", libro: "LIBRO-VIII", categoria: "NORMA", jerarquia: 2, titulo: "Portabilidad", texto: "Los autores tienen derecho a exportar sus obras y metadatos en formato estándar (JSON-LD, CSV) en cualquier momento.", estado: "vigente", dependeDe: ["LITLE-DUT-001.1"] },
      ],
    },
    {
      id: "LIBRO-IX", code: "LITLE-DUT-002", title: "Obligations of Authors", tipo: "DUT",
      categoria: "NORMA", jerarquia: 2, rfc: "RFC-0019",
      summary: "ORCID obligatorio, declaración de IA, respuesta a verificaciones, precisión de metadatos.",
      dependeDe: ["LIBRO-VIII"],
      articulos: [
        { id: "LITLE-DUT-002.1", libro: "LIBRO-IX", categoria: "NORMA", jerarquia: 2, titulo: "ORCID obligatorio", texto: "Todo autor debe registrar un ORCID válido antes de publicar. ORCID institucionales son preferentes sobre personales.", estado: "vigente", dependeDe: [] },
        { id: "LITLE-DUT-002.2", libro: "LIBRO-IX", categoria: "NORMA", jerarquia: 2, titulo: "Precisión de metadatos", texto: "Los metadatos de la obra (título, autores, fechas, categorías) deben ser precisos y completos al momento del registro.", estado: "vigente", dependeDe: ["LITLE-CON-002.1"] },
        { id: "LITLE-DUT-002.3", libro: "LIBRO-IX", categoria: "NORMA", jerarquia: 2, titulo: "Respuesta a verificación", texto: "Los autores deben responder a solicitudes de verificación de integridad en un plazo máximo de 30 días. La falta de respuesta activa SAN-005.", estado: "vigente", dependeDe: [], sancionAsociada: "SAN-005" },
        { id: "LITLE-DUT-002.4", libro: "LIBRO-IX", categoria: "NORMA", jerarquia: 2, titulo: "Actualización", texto: "Los autores deben mantener actualizados sus metadatos de afiliación y ORCID. Cambios institucionales deben reflejarse en 90 días.", estado: "vigente", dependeDe: ["LITLE-DUT-002.1"], sancionAsociada: "SAN-005" },
      ],
    },
    {
      id: "LIBRO-X", code: "LITLE-AI-001", title: "AI Governance", tipo: "AI",
      categoria: "NORMA", jerarquia: 2, rfc: "RFC-0019",
      summary: "IA puede anotar y redactar pero nunca reclamar autoría principal. Fragmentos IA deben ser etiquetados en el DAG.",
      dependeDe: ["LIBRO-IV"],
      articulos: [
        { id: "LITLE-AI-001.1", libro: "LIBRO-X", categoria: "PRINCIPIO", jerarquia: 1, titulo: "No autoría de IA", texto: "Ningún sistema de inteligencia artificial puede ser listado como autor principal de una obra. La IA es una herramienta, no un agente epistémico.", estado: "vigente", dependeDe: ["LITLE-PHI-001.2"] },
        { id: "LITLE-AI-001.2", libro: "LIBRO-X", categoria: "NORMA", jerarquia: 2, titulo: "Etiquetado de fragmentos IA", texto: "Todo fragmento generado o asistido por IA debe ser etiquetado con un marcador {ai} en el DAG. La proporción de contenido IA vs humano debe ser explícita.", estado: "vigente", dependeDe: ["LITLE-AI-001.1"] },
        { id: "LITLE-AI-001.3", libro: "LIBRO-X", categoria: "NORMA", jerarquia: 2, titulo: "Registro de modelos", texto: "Los modelos de IA utilizados deben estar registrados como agentes de red con LITLE-IDs propios. El registro incluye: arquitectura, datos de entrenamiento, versión.", estado: "vigente", dependeDe: ["LITLE-AI-001.1"] },
        { id: "LITLE-AI-001.4", libro: "LIBRO-X", categoria: "PROCEDIMIENTO", jerarquia: 3, titulo: "Auditoría de IA", texto: "FED-3 (Tecnología y Ciencia Abierta) audita el cumplimiento de etiquetado IA. Auditorías trimestrales. Resultados públicos en el DAG.", estado: "vigente", dependeDe: ["LITLE-AI-001.2"] },
      ],
    },
    {
      id: "LIBRO-XI", code: "LITLE-GOV-001", title: "7 Federations Governance", tipo: "GOV",
      categoria: "PRINCIPIO", jerarquia: 1, rfc: "RFC-0019",
      summary: "Siete federaciones con quorum 5/7 para cambios, 6/7 para revocaciones.",
      dependeDe: ["LIBRO-I"],
      articulos: [
        { id: "LITLE-GOV-001.1", libro: "LIBRO-XI", categoria: "PRINCIPIO", jerarquia: 1, titulo: "Soberanía federal", texto: "La gobernanza de LITLE reside en siete federaciones soberanas. Cada federación tiene un voto en decisiones constitucionales. No existe autoridad central por encima de las federaciones.", estado: "vigente", dependeDe: ["LITLE-POL-001.1"] },
        { id: "LITLE-GOV-001.2", libro: "LIBRO-XI", categoria: "NORMA", jerarquia: 2, titulo: "Composición", texto: "Las siete federaciones son: FED-1 (Preservación), FED-2 (Estándares), FED-3 (Tecnología), FED-4 (Curación), FED-5 (Integridad), FED-6 (Adopción), FED-7 (Auditoría).", estado: "vigente", dependeDe: ["LITLE-GOV-001.1"] },
        { id: "LITLE-GOV-001.3", libro: "LIBRO-XI", categoria: "NORMA", jerarquia: 2, titulo: "Quorum", texto: "Decisiones ordinarias requieren 4/7. Cambios a estándares requieren 5/7. Revocaciones de membresía y enmiendas constitucionales requieren 6/7.", estado: "vigente", dependeDe: ["LITLE-GOV-001.1"] },
        { id: "LITLE-GOV-001.4", libro: "LIBRO-XI", categoria: "NORMA", jerarquia: 2, titulo: "Transparencia", texto: "Todas las votaciones, deliberaciones y resoluciones de las federaciones son registradas como nodos en el DAG. No existen sesiones secretas.", estado: "vigente", dependeDe: ["LITLE-GOV-001.1"] },
      ],
    },
    {
      id: "LIBRO-XII", code: "LITLE-EVD-001", title: "Evidence DAG", tipo: "EVD",
      categoria: "PRINCIPIO", jerarquia: 1, rfc: "RFC-0019",
      summary: "Cada operación genera nodos en el Merkle-DAG. Append-only.",
      dependeDe: ["LIBRO-XI"],
      articulos: [
        { id: "LITLE-EVD-001.1", libro: "LIBRO-XII", categoria: "PRINCIPIO", jerarquia: 1, titulo: "Inmutabilidad", texto: "El DAG de evidencia es append-only. Una vez que un nodo es sellado, no puede ser alterado, eliminado o reordenado. La integridad criptográfica es obligatoria.", estado: "vigente", dependeDe: ["LITLE-POL-001.2"] },
        { id: "LITLE-EVD-001.2", libro: "LIBRO-XII", categoria: "NORMA", jerarquia: 2, titulo: "Contenido del nodo", texto: "Cada nodo contiene: timestamp, tipo de operación, hash del contenido, hash del nodo anterior, firma PQC del autor y metadatos de operación.", estado: "vigente", dependeDe: ["LITLE-EVD-001.1"] },
        { id: "LITLE-EVD-001.3", libro: "LIBRO-XII", categoria: "NORMA", jerarquia: 2, titulo: "Anclaje", texto: "El hash raíz del DAG debe ser anclado periódicamente en la blockchain de Bitcoin (OP_RETURN) o en una infraestructura de timestamping equivalente.", estado: "vigente", dependeDe: ["LITLE-EVD-001.1"] },
      ],
    },
    {
      id: "LIBRO-XIII", code: "LITLE-PRS-001", title: "BookPI & Ledger", tipo: "PRS",
      categoria: "NORMA", jerarquia: 2, rfc: "RFC-0019",
      summary: "BookPI opera como ledger para obras y la Constitución. Enmiendas producen ConstitutionAmendmentNode.",
      dependeDe: ["LIBRO-XII"],
      articulos: [
        { id: "LITLE-PRS-001.1", libro: "LIBRO-XIII", categoria: "PRINCIPIO", jerarquia: 1, titulo: "Ledger único", texto: "BookPI es el libro de contabilidad único e inequívoco de LITLE. Toda obra, transacción y enmienda constitucional se registra en BookPI.", estado: "vigente", dependeDe: ["LITLE-EVD-001.1"] },
        { id: "LITLE-PRS-001.2", libro: "LIBRO-XIII", categoria: "NORMA", jerarquia: 2, titulo: "Enmiendas constitucionales", texto: "Las enmiendas a esta Constitución producen ConstitutionAmendmentNode en el DAG, conteniendo: RFC, LIBRO modificado, texto anterior y nuevo (hash), votos y timestamp.", estado: "vigente", dependeDe: ["LITLE-PRS-001.1"] },
        { id: "LITLE-PRS-001.3", libro: "LIBRO-XIII", categoria: "PROCEDIMIENTO", jerarquia: 3, titulo: "Reconciliación", texto: "BookPI debe ser reconciliable con el DAG en cualquier momento. Una discrepancia entre BookPI y el DAG constituye una emergencia de integridad.", estado: "vigente", dependeDe: ["LITLE-PRS-001.1"] },
      ],
    },
    {
      id: "LIBRO-XIV", code: "LITLE-POL-002", title: "Neutrality and Sovereignty", tipo: "POL",
      categoria: "PRINCIPIO", jerarquia: 1, rfc: "RFC-0019",
      summary: "Neutralidad institucional. Infraestructura multi-jurisdicción.",
      dependeDe: ["LIBRO-I"],
      articulos: [
        { id: "LITLE-POL-002.1", libro: "LIBRO-XIV", categoria: "PRINCIPIO", jerarquia: 1, titulo: "Neutralidad institucional", texto: "LITLE mantiene neutralidad política, religiosa y comercial. No favorece ni discrimina jurisdicciones, disciplinas o escuelas de pensamiento.", estado: "vigente", dependeDe: ["LITLE-PHI-001.1"] },
        { id: "LITLE-POL-002.2", libro: "LIBRO-XIV", categoria: "NORMA", jerarquia: 2, titulo: "Multi-jurisdicción", texto: "La infraestructura de LITLE debe operar en al menos 2 jurisdicciones nacionales diferentes. Ningún gobierno o corporación puede tener control unilateral.", estado: "vigente", dependeDe: ["LITLE-POL-002.1"] },
        { id: "LITLE-POL-002.3", libro: "LIBRO-XIV", categoria: "SANCION", jerarquia: 3, titulo: "Violación de neutralidad", texto: "Un miembro de federación que viole la neutralidad será removido (6/7 quorum). La violación queda registrada permanentemente en el DAG.", estado: "vigente", dependeDe: ["LITLE-POL-002.1"], sancionAsociada: "SAN-003" },
      ],
    },
    {
      id: "LIBRO-XV", code: "LITLE-COM-001", title: "Community", tipo: "COM",
      categoria: "NORMA", jerarquia: 2, rfc: "RFC-0019",
      summary: "Participación abierta sujeta al Código de Ética. Disputas resueltas por FED-7.",
      dependeDe: ["LIBRO-IV", "LIBRO-XI"],
      articulos: [
        { id: "LITLE-COM-001.1", libro: "LIBRO-XV", categoria: "PRINCIPIO", jerarquia: 1, titulo: "Participación abierta", texto: "Cualquier persona física o jurídica puede participar en LITLE, sujeto al cumplimiento de esta Constitución y el Código de Ética.", estado: "vigente", dependeDe: ["LITLE-CON-001.1"] },
        { id: "LITLE-COM-001.2", libro: "LIBRO-XV", categoria: "NORMA", jerarquia: 2, titulo: "Resolución de disputas", texto: "Las disputas comunitarias son resueltas por FED-7 (Audit & Compliance) en primera instancia, con apelación al plenario de 7 federaciones.", estado: "vigente", dependeDe: ["LITLE-COM-001.1", "LITLE-GOV-001.1"] },
        { id: "LITLE-COM-001.3", libro: "LIBRO-XV", categoria: "NORMA", jerarquia: 2, titulo: "Gobernanza pública", texto: "Toda la gobernanza opera en público. Las reuniones, votaciones y resoluciones son accesibles a través del DAG. No existen órganos de gobierno secretos.", estado: "vigente", dependeDe: ["LITLE-GOV-001.4"] },
      ],
    },
  ],
};

// ── 6. Helper Functions ─────────────────────────────────────────

export function findLibro(code: string): Libro | undefined {
  return CONSTITUTION.libri.find((l) => l.code === code || l.id === code);
}

export function findArticulo(id: string): Articulo | undefined {
  for (const libro of CONSTITUTION.libri) {
    const art = libro.articulos.find((a) => a.id === id);
    if (art) return art;
  }
  return undefined;
}

export function findSancion(id: string): Sancion | undefined {
  return CONSTITUTION.model.sanciones.find((s) => s.id === id);
}

export function articulosPorCategoria(cat: CategoriaConstitucional): Articulo[] {
  const result: Articulo[] = [];
  for (const libro of CONSTITUTION.libri) {
    for (const art of libro.articulos) {
      if (art.categoria === cat) result.push(art);
    }
  }
  return result;
}

export function sancionesPorGravedad(gravedad: Sancion["gravedad"]): Sancion[] {
  return CONSTITUTION.model.sanciones.filter((s) => s.gravedad === gravedad);
}

export function quorumMinimo(categoria: CategoriaConstitucional): number {
  return CONSTITUTION.model.quorumMatrix[categoria] ?? 5;
}

export function dependenciasDeArticulo(id: string): Articulo[] {
  const art = findArticulo(id);
  if (!art) return [];
  return art.dependeDe.map((depId) => findArticulo(depId)).filter(Boolean) as Articulo[];
}

export function articulosQueDependenDe(id: string): Articulo[] {
  const result: Articulo[] = [];
  for (const libro of CONSTITUTION.libri) {
    for (const art of libro.articulos) {
      if (art.dependeDe.includes(id)) result.push(art);
    }
  }
  return result;
}
