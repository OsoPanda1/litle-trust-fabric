// ────────────────────────────────────────────────────────────────
// Reasoning Engine — Cognitive Reasoning & GraphRAG
// Razonamiento estructurado sobre knowledge graph + RAG contextual
// ────────────────────────────────────────────────────────────────

export type KnowledgeNode = {
  id: string;
  label: string;
  type: string;
  properties: Record<string, string>;
};

export type KnowledgeEdge = {
  source: string;
  target: string;
  relation: string;
  weight: number;
};

export type ReasoningContext = {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  query: string;
};

export type ReasoningResult = {
  answer: string;
  path: string[];
  confidence: number;
  sources: string[];
};

// ── GraphRAG In-Memory ──────────────────────────────────────────

const GRAPH_NODES: Map<string, KnowledgeNode> = new Map();
const GRAPH_EDGES: KnowledgeEdge[] = [];

export function addNode(node: KnowledgeNode): void {
  GRAPH_NODES.set(node.id, node);
}

export function addEdge(edge: KnowledgeEdge): void {
  GRAPH_EDGES.push(edge);
}

export function buildKnowledgeGraph(): void {
  // Constitution
  addNode({ id: "constitution", label: "Constitución de LITLE", type: "document", properties: { rfc: "RFC-0019", status: "vigente" } });
  addNode({ id: "libro-I", label: "LIBRO I — Institutional Purpose", type: "libro", properties: { code: "LITLE-POL-001" } });
  addNode({ id: "libro-III", label: "LIBRO III — Code of Ethics", type: "libro", properties: { code: "LITLE-CON-001" } });
  addNode({ id: "libro-X", label: "LIBRO X — AI Governance", type: "libro", properties: { code: "LITLE-AI-001" } });
  addNode({ id: "libro-XI", label: "LIBRO XI — 7 Federations", type: "libro", properties: { code: "LITLE-GOV-001" } });
  addNode({ id: "san-001", label: "SAN-001 Deprecación de obra", type: "sanction", properties: { gravity: "grave" } });
  addNode({ id: "san-002", label: "SAN-002 Suspensión de autor", type: "sanction", properties: { gravity: "critica" } });
  addNode({ id: "fed-3", label: "FED-3 Tecnología y Ciencia Abierta", type: "federation", properties: { quorum: "5/7" } });
  addNode({ id: "fed-7", label: "FED-7 Auditoría y Compliance", type: "federation", properties: { quorum: "5/7" } });

  // Isabella
  addNode({ id: "isabella", label: "Isabella Villaseñor AI", type: "agent", properties: { model: "SCAO", status: "active" } });
  addNode({ id: "soul", label: "SOUL Identity Kernel", type: "artifact", properties: { layer: "identity" } });
  addNode({ id: "isa-api", label: "Isa API Cognitive Core", type: "artifact", properties: { layer: "cognitive" } });
  addNode({ id: "mexa-api", label: "Mexa API Crypto Layer", type: "artifact", properties: { layer: "cryptographic" } });
  addNode({ id: "clawhub", label: "ClawHub Skill Registry", type: "artifact", properties: { layer: "execution" } });
  addNode({ id: "tamv", label: "TAMV Online Network", type: "ecosystem", properties: { origin: "Real del Monte" } });
  addNode({ id: "rdm", label: "RDM Digital Hub", type: "ecosystem", properties: { nodo: "cero" } });
  addNode({ id: "ucip", label: "UTAMV Cognitive Intelligence Platform", type: "ecosystem", properties: { type: "educational" } });

  // Edges
  addEdge({ source: "constitution", target: "libro-I", relation: "contains", weight: 1.0 });
  addEdge({ source: "constitution", target: "libro-III", relation: "contains", weight: 1.0 });
  addEdge({ source: "constitution", target: "libro-X", relation: "contains", weight: 1.0 });
  addEdge({ source: "constitution", target: "libro-XI", relation: "contains", weight: 1.0 });
  addEdge({ source: "libro-III", target: "san-001", relation: "triggers", weight: 0.9 });
  addEdge({ source: "libro-III", target: "san-002", relation: "triggers", weight: 0.9 });
  addEdge({ source: "isabella", target: "soul", relation: "defined_by", weight: 1.0 });
  addEdge({ source: "isabella", target: "isa-api", relation: "operates", weight: 1.0 });
  addEdge({ source: "isabella", target: "mexa-api", relation: "operates", weight: 1.0 });
  addEdge({ source: "isabella", target: "clawhub", relation: "manages", weight: 1.0 });
  addEdge({ source: "isabella", target: "tamv", relation: "belongs_to", weight: 1.0 });
  addEdge({ source: "tamv", target: "rdm", relation: "contains", weight: 0.9 });
  addEdge({ source: "tamv", target: "ucip", relation: "contains", weight: 0.9 });
  addEdge({ source: "isa-api", target: "fed-3", relation: "reports_to", weight: 0.8 });
  addEdge({ source: "isabella", target: "fed-7", relation: "audited_by", weight: 0.8 });
  addEdge({ source: "clawhub", target: "fed-3", relation: "governed_by", weight: 0.8 });
}

export function queryGraphRAG(question: string): ReasoningResult {
  const q = question.toLowerCase();
  const matchedNodes: string[] = [];
  const paths: string[] = [];

  for (const [id, node] of GRAPH_NODES) {
    if (node.label.toLowerCase().includes(q) || node.type.toLowerCase().includes(q)) {
      matchedNodes.push(id);
    }
    for (const prop of Object.values(node.properties)) {
      if (prop.toLowerCase().includes(q)) {
        matchedNodes.push(id);
      }
    }
  }

  const unique = [...new Set(matchedNodes)];
  if (unique.length === 0) {
    return { answer: "No encontré información relevante en el grafo de conocimiento.", path: [], confidence: 0.1, sources: [] };
  }

  for (const nodeId of unique) {
    const node = GRAPH_NODES.get(nodeId)!;
    paths.push(node.label);
    const edges = GRAPH_EDGES.filter((e) => e.source === nodeId || e.target === nodeId);
    for (const edge of edges) {
      const connected = edge.source === nodeId ? GRAPH_EDGES.find((e) => e.target === edge.target) : null;
      if (connected) {
        const targetNode = GRAPH_NODES.get(edge.target === nodeId ? edge.source : edge.target);
        if (targetNode) paths.push(`  → ${edge.relation}: ${targetNode.label}`);
      }
    }
  }

  const answer = `Encontré ${unique.length} nodos relacionados con "${question}" en el grafo de conocimiento:\n${unique.map((id) => {
    const n = GRAPH_NODES.get(id)!;
    return `- ${n.label} (${n.type}): ${Object.values(n.properties).join(", ")}`;
  }).join("\n")}`;

  return { answer, path: [...new Set(paths)], confidence: 0.7, sources: unique.map((id) => GRAPH_NODES.get(id)!.label) };
}

// Initialize graph on import
buildKnowledgeGraph();

export interface ReasoningEngine {
  graphQuery: (question: string) => ReasoningResult;
  addNode: (node: KnowledgeNode) => void;
  addEdge: (edge: KnowledgeEdge) => void;
}

export function createReasoningEngine(): ReasoningEngine {
  return {
    graphQuery: (question: string) => queryGraphRAG(question),
    addNode,
    addEdge,
  };
}
