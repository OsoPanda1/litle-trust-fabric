import React from "react";
import { Link } from "@tanstack/react-router";
import { Shield, Sparkles } from "lucide-react";

export const HeaderNav: React.FC = () => (
  <header className="sticky top-0 z-50 border-b border-amber-500/10 bg-background/80 backdrop-blur-xl">
    <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-3 group">
        <div className="relative flex items-center justify-center h-8 w-8 rounded-md bg-amber-500/10 border border-amber-500/30 group-hover:border-amber-500/60 transition-colors">
          <Shield className="h-4 w-4 text-amber-500" />
          <div className="absolute inset-0 rounded-md bg-amber-500/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="flex flex-col">
          <span className="font-serif text-lg font-bold tracking-wider leading-none">LITLE</span>
          <span className="text-[9px] font-mono tracking-widest text-muted-foreground uppercase">Specification Suite</span>
        </div>
      </Link>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/5 border border-amber-500/20 text-[10px] font-mono tracking-widest text-amber-500">
          <Sparkles className="h-3 w-3" />
          <span>CONSENSUS ENGINE V1.0</span>
        </div>
        <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground border border-border/80 px-3 py-1 rounded-full bg-muted/20">
          Standards Council
        </div>
      </div>
    </div>
  </header>
);
