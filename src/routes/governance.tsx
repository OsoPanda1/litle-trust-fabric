import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/governance")({
  head: () => ({
    meta: [
      { title: "Governance — LITLE Trust Fabric" },
      { name: "description", content: "The 7 Federations of the TAMV governance model for LITLE Trust Fabric. Academic sovereignty for LATAM Open Science." },
    ],
  }),
  component: GovernancePage,
});

const FEDERATIONS = [
  { id: "FED-1", name: "Crypto & Identity", mandate: "Custodia de perfiles criptográficos, transición post-cuántica y raíz de confianza PKI. Cada obra firmada con claves rotables cuya metadata pública permite verificación independiente sin depender de un único proveedor de firma.", color: "from-oklch(0.2_0.08_280)/40" },
  { id: "FED-2", name: "Standards & LIPs", mandate: "Ciclo de vida formal de LITLE Improvement Proposals, compatibilidad hacia atrás y publicación de RFCs. Toda modificación al estándar requiere RFC público, período de comentarios de 90 días y aprobación 5/7.", color: "from-oklch(0.2_0.08_240)/40" },
  { id: "FED-3", name: "Infrastructure & Mesh", mandate: "Orquestación de nodos de almacenamiento distribuido, replicación geográfica y observabilidad multi-cloud. Mínimo 3 copias geográficamente independientes por obra antes de emitir certificación.", color: "from-oklch(0.2_0.08_200)/40" },
  { id: "FED-4", name: "Evidence & Lineage", mandate: "Integridad matemática del DAG, canonicalización JSON y esquemas de nodos de evidencia. Cada transición de estado computacional se registra como un nodo Merkle-encadenado con hash del padre.", color: "from-oklch(0.2_0.08_160)/40" },
  { id: "FED-5", name: "Curation & Redemption", mandate: "Taxonomía académica, moderación de contenido, gestión de retractaciones y actualización de obras ya publicadas. El curador asigna categorías epistemológicas y resuelve disputas de clasificación.", color: "from-oklch(0.2_0.08_120)/40" },
  { id: "FED-6", name: "Kernel & Dev", mandate: "Mantenimiento del núcleo en TypeScript/Rust/Python, SDKs oficiales, CI/CD abiertas y documentación técnica. Todo release firmado con firmas post-cuánticas experimentales.", color: "from-oklch(0.2_0.08_80)/40" },
  { id: "FED-7", name: "Audit & Compliance", mandate: "Evaluación periódica de consistencia entre federaciones, seguridad de infraestructura, privacidad de datos y resolución formal de disputas. Emite informes públicos de auditoría cada 6 meses.", color: "from-oklch(0.2_0.08_40)/40" },
];

function GovernancePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">&larr; Back</a>
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Governance · TAMV</span>
        </div>
        <div className="max-w-7xl mx-auto px-6 pb-8">
          <h1 className="font-serif text-4xl mb-3">7 Federations</h1>
          <p className="text-muted-foreground text-sm max-w-2xl">
            LITLE operates under a federated governance model (<span className="font-mono">TAMV</span>).
            Seven autonomous federations manage distinct domains of the standard.
            Decisions require quorum of 5 out of 7 federations, ensuring no single
            entity controls the infrastructure.
          </p>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid gap-6">
          {FEDERATIONS.map((fed) => (
            <div key={fed.id} className="crystal-panel p-6 md:p-8 grid md:grid-cols-[auto_1fr] gap-6 items-start">
              <div className="md:min-w-[100px]">
                <div className={`font-mono text-lg gilt-text`}>{fed.id}</div>
              </div>
              <div className="space-y-3">
                <h2 className={`font-serif text-2xl`}>{fed.name}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed font-mono">{fed.mandate}</p>
                <div className="flex items-center gap-3 pt-2">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Quorum weight</span>
                  <span className="w-2 h-2 rounded-full bg-gilt/60"></span>
                  <span className="w-2 h-2 rounded-full bg-gilt/30"></span>
                  <span className="w-2 h-2 rounded-full bg-gilt/15"></span>
                  <span className="text-xs font-mono text-gilt">1 / 7</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border/60">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="font-serif text-3xl mb-6">Governance Principles</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="crystal-panel p-5">
              <div className="font-mono text-xs text-gilt mb-2">PRINCIPLE I</div>
              <h3 className="font-serif text-lg mb-2">Quorum 5/7</h3>
              <p className="text-xs text-muted-foreground font-mono">Ninguna decisión vinculante se toma sin el respaldo de al menos 5 de las 7 federaciones. Cada federación tiene un voto.</p>
            </div>
            <div className="crystal-panel p-5">
              <div className="font-mono text-xs text-gilt mb-2">PRINCIPLE II</div>
              <h3 className="font-serif text-lg mb-2">Transparencia Radical</h3>
              <p className="text-xs text-muted-foreground font-mono">Todas las sesiones, votaciones y auditorías se registran en la cadena de evidencia con acceso público.</p>
            </div>
            <div className="crystal-panel p-5">
              <div className="font-mono text-xs text-gilt mb-2">PRINCIPLE III</div>
              <h3 className="font-serif text-lg mb-2">Independencia</h3>
              <p className="text-xs text-muted-foreground font-mono">Cada federación opera su propia infraestructura y presupuesto. No existe una entidad central controladora.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60">
        <div className="max-w-7xl mx-auto px-6 py-8 text-xs text-muted-foreground font-mono uppercase tracking-wider">
          <span>LITLE · Trust Fabric &amp; Standard · Real del Monte, Hidalgo, MX</span>
        </div>
      </footer>
    </main>
  );
}
