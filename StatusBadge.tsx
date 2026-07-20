import React from "react";
import { cn } from "@/lib/utils";

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const norm = status.toUpperCase();

  const styles: Record<string, string> = {
    FINAL: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    PROPOSED: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    DRAFT: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    OBSOLETE: "bg-rose-500/10 text-rose-400 border-rose-500/30",
  };

  return (
    <span
      className={cn(
        "inline-block font-mono text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded border text-center shadow-sm",
        styles[norm] || "bg-muted text-muted-foreground border-border"
      )}
    >
      {status}
    </span>
  );
};
