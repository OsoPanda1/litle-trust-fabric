import React from "react";
import { Link } from "@tanstack/react-router";
import { BookOpen, Layers, Lock, Cpu } from "lucide-react";

export const HeroSection: React.FC = () => (
  <section className="relative overflow-hidden pt-28 pb-20 border-b border-border/40">
    {/* Fondo de Malla Radial & Acento de Luz */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent blur-3xl pointer-events-none -z-10" />
    <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:24px_24px] opacity-25 -z-10" />

    <div className="max-w-5xl mx-auto px-6 text-center md:text-left">
      <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-amber-500 font-mono mb-6 bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-full shadow-inner">
        <Cpu className="h-3.5 w-3.5 animate-pulse" />
        <span>Post-Quantum & Zero-Trust Knowledge Standard</span>
      </div>

      <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl leading-[1.02] tracking-tight mb-8">
        The Standard for Preserving Knowledge.
        <br />
        <span className="italic bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent font-normal">
          Verifying Legacy.
        </span>
      </h1>

      <p className="text-lg md:text-xl text-muted-foreground max-w-3xl leading-relaxed mb-10 font-light">
        LITLE is a decentralized specification suite engineered for durable identifiers, post-quantum proof-of-lineage, and sovereign academic preservation designed to outlive centralized infrastructure.
      </p>

      <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
        <a
          href="#rfcs-explorer"
          className="inline-flex items-center gap-2.5 rounded-md bg-amber-500 text-slate-950 px-6 py-3.5 text-sm font-semibold hover:bg-amber-400 transition-all shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)]"
        >
          <BookOpen className="h-4 w-4" />
          Explore Public RFCs
        </a>
        <Link
          to="/standard/archive"
          className="inline-flex items-center gap-2.5 rounded-md border border-amber-500/30 bg-background/50 hover:bg-amber-500/10 text-amber-500 px-6 py-3.5 text-sm font-medium transition backdrop-blur-sm"
        >
          <Layers className="h-4 w-4" />
          Independent Archive
        </Link>
      </div>
    </div>
  </section>
);
