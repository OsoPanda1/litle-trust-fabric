import React from "react";
import { ShieldCheck, FileCode2, Layers } from "lucide-react";

interface PillarItemProps {
  id: string;
  title: string;
  body: string;
  icon: React.ReactNode;
  tag: string;
}

export const PillarsBento: React.FC = () => (
  <section className="max-w-7xl mx-auto px-6 py-20">
    <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3 font-mono">
      Architectural Foundations
    </div>
    <h2 className="font-serif text-3xl md:text-4xl mb-10">Core Pillars of the Standard</h2>

    <div className="grid md:grid-cols-3 gap-6">
      <PillarCard
        id="RFC-0001"
        tag="IDENTITY LAYER"
        title="LITLE-ID / L-512"
        icon={<FileCode2 className="h-6 w-6 text-amber-500" />}
        body="A durable, self-describing 512-byte binary container that encapsulates Merkle AST roots, cryptographic headers, and author identities independently of hosting providers."
      />
      <PillarCard
        id="RFC-0008"
        tag="PROVENANCE ENGINE"
        title="Evidence Chain"
        icon={<ShieldCheck className="h-6 w-6 text-amber-500" />}
        body="Standardized lineage trees tracking original source text, model seeds, AST mutations, and post-quantum Dilithium signatures for verifiable academic integrity."
      />
      <PillarCard
        id="RFC-0009"
        tag="PERSISTENCE"
        title="Independent Archive"
        icon={<Layers className="h-6 w-6 text-amber-500" />}
        body="Redundant, peer-to-peer off-platform preservation with Bech32m canonical strings verified continuously across distributed nodes."
      />
    </div>
  </section>
);

const PillarCard: React.FC<PillarItemProps> = ({ id, title, body, icon, tag }) => (
  <div className="group relative rounded-xl border border-border/80 bg-gradient-to-b from-background to-muted/20 p-8 hover:border-amber-500/50 transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-1">
    <div className="flex items-center justify-between mb-6">
      <span className="font-mono text-xs font-semibold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded">
        {id}
      </span>
      {icon}
    </div>
    <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">{tag}</div>
    <h3 className="font-serif text-2xl mb-3 group-hover:text-amber-400 transition-colors">{title}</h3>
    <p className="text-sm text-muted-foreground leading-relaxed font-light">{body}</p>
  </div>
);
