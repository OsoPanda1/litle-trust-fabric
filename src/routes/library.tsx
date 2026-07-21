import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";

export const Route = createFileRoute("/library")({
  head: () => ({
    meta: [
      { title: "Library — LITLE Trust Fabric" },
      { name: "description", content: "Academic library of works preserved under the LITLE Trust Fabric standard. Search by LITLE-ID, title, work type, federation or status." },
    ],
  }),
  component: LibraryPage,
});

const WORKS = [
  { id: "LTL-2026-RQ-8F4A-29D3", title: "Análisis formal del linaje epistemológico en sistemas multiagente", type: "Paper", fed: "FED-4", status: "certified", year: 2026 },
  { id: "LTL-2026-TG-7B3C-18E2", title: "Propuesta de gobernanza federada para repositorios de ciencia abierta en LATAM", type: "Paper", fed: "FED-2", status: "certified", year: 2026 },
  { id: "LTL-2026-SH-6A2B-07D1", title: "Implementación de un grafo Merkle-DAG para trazabilidad de evidencia computacional", type: "Technical Report", fed: "FED-4", status: "certified", year: 2026 },
  { id: "LTL-2026-DK-5C4D-96F0", title: "Hacia un estándar de identificación persistente para obras académicas latinoamericanas", type: "Standard", fed: "FED-2", status: "review", year: 2026 },
  { id: "LTL-2026-XM-4E5F-85G1", title: "Dataset: Métricas de producción científica en universidades mexicanas 2020–2025", type: "Dataset", fed: "FED-5", status: "certified", year: 2026 },
  { id: "LTL-2026-AB-9D8C-74H2", title: "Modelo de lenguaje pequeño para transcripción de fuentes primarias en archivos históricos", type: "Model", fed: "FED-6", status: "archived", year: 2025 },
  { id: "LTL-2025-CD-0E1F-63I3", title: "Evaluación criptográfica post-cuántica para firmas digitales en infraestructura académica", type: "Paper", fed: "FED-1", status: "certified", year: 2025 },
  { id: "LTL-2025-EF-2A3B-52J4", title: "Lineamientos de accesibilidad y preservación digital para repositorios institucionales", type: "Standard", fed: "FED-3", status: "certified", year: 2025 },
  { id: "LTL-2025-GH-4C5D-41K5", title: "Bitácora de experimentos: Validación de esquemas de canonicalización JSON", type: "Lab Notebook", fed: "FED-4", status: "review", year: 2025 },
  { id: "LTL-2025-IJ-6E7F-30L6", title: "Análisis de redes de citación en producción científica de Centroamérica", type: "Dataset", fed: "FED-5", status: "certified", year: 2025 },
  { id: "LTL-2024-KL-8G9H-29M7", title: "Manifiesto por una ciencia abierta soberana: principios, arquitectura y gobernanza", type: "Manifesto", fed: "FED-2", status: "archived", year: 2024 },
  { id: "LTL-2024-MN-0I1J-18N8", title: "Framework de auditoría de consistencia para DAGs de evidencia académica", type: "Technical Report", fed: "FED-7", status: "certified", year: 2024 },
  { id: "LTL-2024-OP-2K3L-07O9", title: "Protocolo de resolución de disputas en gobernanza federada de datos académicos", type: "Standard", fed: "FED-7", status: "certified", year: 2024 },
  { id: "LTL-2024-QR-4M5N-96P0", title: "Taxonomía de disciplinas académicas para clasificación epistemológica automática", type: "Standard", fed: "FED-5", status: "review", year: 2024 },
  { id: "LTL-2023-ST-6O7P-85Q1", title: "Estudio comparativo de plataformas de preservación digital independiente", type: "Paper", fed: "FED-3", status: "archived", year: 2023 },
];

const TYPE_COLORS: Record<string, string> = {
  Paper: "text-[color:oklch(0.75_0.15_200)]",
  "Technical Report": "text-[color:oklch(0.75_0.15_150)]",
  Standard: "text-[color:oklch(0.75_0.15_100)]",
  Dataset: "text-[color:oklch(0.75_0.15_50)]",
  Model: "text-[color:oklch(0.75_0.15_300)]",
  "Lab Notebook": "text-[color:oklch(0.75_0.10_250)]",
  Manifesto: "text-[color:oklch(0.75_0.15_30)]",
};

const STATUS_COLORS: Record<string, string> = {
  certified: "bg-gilt/15 text-gilt border-gilt/30",
  review: "bg-amber-signal/10 border-amber-signal/30",
  archived: "bg-[color:oklch(0.5_0.02_240)]/10 border-[color:oklch(0.5_0.02_240)]/30 text-[color:oklch(0.7_0.05_240)]",
};

function LibraryPage() {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [fedFilter, setFedFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const types = useMemo(() => [...new Set(WORKS.map((w) => w.type))], []);
  const feds = useMemo(() => [...new Set(WORKS.map((w) => w.fed))], []);

  const filtered = useMemo(() => {
    return WORKS.filter((w) => {
      if (query && !w.id.toLowerCase().includes(query.toLowerCase()) && !w.title.toLowerCase().includes(query.toLowerCase())) return false;
      if (typeFilter !== "all" && w.type !== typeFilter) return false;
      if (fedFilter !== "all" && w.fed !== fedFilter) return false;
      if (statusFilter !== "all" && w.status !== statusFilter) return false;
      return true;
    });
  }, [query, typeFilter, fedFilter, statusFilter]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">&larr; Back</a>
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">LITLE Academic Library</span>
        </div>
        <div className="max-w-7xl mx-auto px-6 pb-6 space-y-4">
          <h1 className="font-serif text-4xl">Library</h1>
          <p className="text-muted-foreground text-sm max-w-2xl">
            Catalogue of works preserved under the LITLE Trust Fabric standard.
            Every work is identified by a persistent LITLE-ID, linked to a
            Digital Academic Certificate, and stored with independent preservation.
          </p>
          <div className="flex flex-wrap gap-3 items-center pt-3">
            <input
              type="text"
              placeholder="Search by LITLE-ID or title…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-background border border-border/60 px-4 py-2 text-sm font-mono min-w-[240px] focus:outline-none focus:border-platinum transition"
            />
            <FilterSelect label="Type" value={typeFilter} onChange={setTypeFilter} options={["all", ...types]} />
            <FilterSelect label="Federation" value={fedFilter} onChange={setFedFilter} options={["all", ...feds]} />
            <FilterSelect label="Status" value={statusFilter} onChange={setStatusFilter} options={["all", "certified", "review", "archived"]} />
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-xs font-mono text-muted-foreground pb-2 border-b border-border/40 mb-4">
          {filtered.length} work{filtered.length !== 1 ? "s" : ""} found
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40 text-left font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                <th className="pb-3 pr-4">LITLE-ID</th>
                <th className="pb-3 pr-4">Title</th>
                <th className="pb-3 pr-4">Type</th>
                <th className="pb-3 pr-4">Fed</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3">Year</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((w) => (
                <tr key={w.id} className="border-b border-border/20 hover:bg-accent/10 transition cursor-pointer">
                  <td className="py-3 pr-4 font-mono">
                    <a href={`/verify/${w.id}`} className="gilt-text text-xs hover:underline">{w.id}</a>
                  </td>
                  <td className="py-3 pr-4 font-serif">{w.title}</td>
                  <td className={`py-3 pr-4 font-mono text-xs ${TYPE_COLORS[w.type] ?? "text-muted-foreground"}`}>{w.type}</td>
                  <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">{w.fed}</td>
                  <td className="py-3 pr-4">
                    <span className={`inline-block px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded-full border ${STATUS_COLORS[w.status] ?? "border-border/40 text-muted-foreground"}`}>
                      {w.status}
                    </span>
                  </td>
                  <td className="py-3 font-mono text-xs text-muted-foreground">{w.year}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="py-12 text-center text-muted-foreground text-sm">No works match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="border-t border-border/60 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-8 text-xs text-muted-foreground font-mono uppercase tracking-wider">
          <span>LITLE · Trust Fabric &amp; Standard · Real del Monte, Hidalgo, MX</span>
        </div>
      </footer>
    </main>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="bg-background border border-border/60 px-3 py-2 text-xs font-mono uppercase tracking-wider text-muted-foreground focus:outline-none focus:border-platinum transition">
      {options.map((o) => (
        <option key={o} value={o}>{o === "all" ? `All ${label}` : o}</option>
      ))}
    </select>
  );
}
