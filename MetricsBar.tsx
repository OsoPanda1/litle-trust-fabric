import React from "react";
import { ShieldCheck, GitCommit, FileCode, CheckCircle2 } from "lucide-react";

interface MetricsProps {
  stats: { total: number; final: number; proposed: number; draft: number };
}

export const MetricsBar: React.FC<MetricsProps> = ({ stats }) => (
  <section className="border-b border-border/60 bg-muted/20 backdrop-blur-md">
    <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6 divide-x divide-border/40">
      <div className="flex items-center gap-4 pl-2">
        <FileCode className="h-8 w-8 text-amber-500/70" />
        <div>
          <div className="text-2xl font-mono font-bold tracking-tight">{stats.total}</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider font-mono">Active RFCs</div>
        </div>
      </div>
      <div className="flex items-center gap-4 pl-6">
        <CheckCircle2 className="h-8 w-8 text-emerald-500/70" />
        <div>
          <div className="text-2xl font-mono font-bold tracking-tight text-emerald-500">{stats.final}</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider font-mono">Ratified Standard</div>
        </div>
      </div>
      <div className="flex items-center gap-4 pl-6">
        <GitCommit className="h-8 w-8 text-amber-400/70" />
        <div>
          <div className="text-2xl font-mono font-bold tracking-tight text-amber-400">{stats.proposed}</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider font-mono">Under Review</div>
        </div>
      </div>
      <div className="flex items-center gap-4 pl-6">
        <ShieldCheck className="h-8 w-8 text-blue-400/70" />
        <div>
          <div className="text-2xl font-mono font-bold tracking-tight">512-Bit</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider font-mono">PQC Container</div>
        </div>
      </div>
    </div>
  </section>
);
