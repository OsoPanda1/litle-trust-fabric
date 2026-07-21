// src/routes/standard/-hooks/useRfcCatalog.ts
import { useState, useMemo } from "react";
import type { Rfc } from "@/content/rfcs";

export function useRfcCatalog(rfcs: Rfc[] = []) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = useMemo(() => {
    return Array.from(new Set(rfcs.map((r) => r.category)));
  }, [rfcs]);

  const filteredRfcs = useMemo(() => {
    return rfcs.filter((rfc) => {
      const matchesSearch =
        rfc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rfc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rfc.abstract?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory ? rfc.category === selectedCategory : true;

      return matchesSearch && matchesCategory;
    });
  }, [rfcs, searchQuery, selectedCategory]);

  const stats = useMemo(() => ({
    total: rfcs.length,
    final: rfcs.filter((r) => r.status.toUpperCase() === "FINAL").length,
    proposed: rfcs.filter((r) => r.status.toUpperCase() === "PROPOSED").length,
    draft: rfcs.filter((r) => r.status.toUpperCase() === "DRAFT").length,
  }), [rfcs]);

  return {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    categories,
    filteredRfcs,
    stats,
  };
}
