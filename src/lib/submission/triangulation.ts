import type {
  TriangulationCheck,
  TriangulationReport,
  DuplicateEvidence,
  TriangulationResult,
  SubmissionDocument,
} from "./types";

let webSearchCache = new Map<string, { found: boolean; matches: Array<{ title: string; url: string; score: number }> }>();

export function resetSearchCache(): void {
  webSearchCache.clear();
}

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
}

export async function checkOrcid(orcid: string): Promise<TriangulationCheck> {
  const cleaned = orcid.replace(/[^0-9X-]/g, "");
  if (!/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/.test(cleaned)) {
    return { source: "ORCID", found: false, match: null, confidence: 0, detail: "Invalid ORCID format" };
  }
  try {
    const resp = await fetch(`https://pub.orcid.org/v3.0/${cleaned}/record`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
    if (resp.ok) {
      const data = await resp.json();
      const name = data?.person?.name
        ? `${data.person.name.givenNames ?? ""} ${data.person.name.familyName ?? ""}`.trim()
        : null;
      return {
        source: "ORCID",
        found: true,
        match: name,
        confidence: 0.95,
        detail: `ORCID verified: ${cleaned}`,
      };
    }
    return { source: "ORCID", found: false, match: null, confidence: 0.8, detail: `ORCID not found: ${cleaned}` };
  } catch (err) {
    return { source: "ORCID", found: false, match: null, confidence: 0, detail: `ORCID check failed: ${(err as Error).message}` };
  }
}

export async function checkDoi(title: string, abstract: string): Promise<TriangulationCheck> {
  const normalized = normalizeText(title);
  if (normalized.length < 10) {
    return { source: "DOI/CROSSREF", found: false, match: null, confidence: 0, detail: "Title too short for matching" };
  }
  try {
    const url = `https://api.crossref.org/works?query.title=${encodeURIComponent(title)}&rows=5`;
    const resp = await fetch(url, {
      headers: { "User-Agent": "LITLE/1.0 (mailto:research@litle.org)" },
      signal: AbortSignal.timeout(10000),
    });
    if (resp.ok) {
      const data = await resp.json();
      const items = data?.message?.items ?? [];
      for (const item of items) {
        const itemTitle = normalizeText(item.title?.[0] ?? "");
        const score = item.score ?? 0;
        if (itemTitle === normalized || score > 50) {
          const doi = item.DOI ?? null;
          return {
            source: "DOI/CROSSREF",
            found: !!doi,
            match: doi,
            confidence: Math.min(1, score / 100),
            detail: doi ? `Found DOI: ${doi}` : "No DOI assigned but title match found",
          };
        }
      }
      return { source: "DOI/CROSSREF", found: false, match: null, confidence: 0.7, detail: "No matching DOI found in Crossref" };
    }
    return { source: "DOI/CROSSREF", found: false, match: null, confidence: 0.3, detail: "Crossref API unavailable" };
  } catch (err) {
    return { source: "DOI/CROSSREF", found: false, match: null, confidence: 0, detail: `Crossref check failed: ${(err as Error).message}` };
  }
}

export async function checkIsni(orcid: string): Promise<TriangulationCheck> {
  try {
    const orcidClean = orcid.replace(/[^0-9X-]/g, "");
    const resp = await fetch(`https://isni.org/api/orcid/${orcidClean}`, {
      signal: AbortSignal.timeout(6000),
    });
    if (resp.ok) {
      const data = await resp.json();
      const isni = data?.isni ?? null;
      return {
        source: "ISNI",
        found: !!isni,
        match: isni,
        confidence: isni ? 0.9 : 0.5,
        detail: isni ? `ISNI found: ${isni}` : "No ISNI linked to ORCID",
      };
    }
    return { source: "ISNI", found: false, match: null, confidence: 0.3, detail: "ISNI API unavailable" };
  } catch (err) {
    return { source: "ISNI", found: false, match: null, confidence: 0, detail: `ISNI check failed: ${(err as Error).message}` };
  }
}

export async function checkWebSimilarity(title: string, abstract: string): Promise<TriangulationCheck> {
  const cacheKey = normalizeText(title).slice(0, 80);
  const cached = webSearchCache.get(cacheKey);
  if (cached) {
    const best = cached.matches[0];
    return {
      source: "WEB",
      found: best?.score > 0.5,
      match: best?.title ?? null,
      confidence: best?.score ?? 0,
      detail: best ? `Cached: "${best.title}"` : "No web matches found",
    };
  }
  try {
    const searchTerms = encodeURIComponent(`"${title.slice(0, 100)}" research paper`);
    const resp = await fetch(`https://api.duckduckgo.com/?q=${searchTerms}&format=json&max=5`, {
      signal: AbortSignal.timeout(8000),
    });
    const matches: Array<{ title: string; url: string; score: number }> = [];
    if (resp.ok) {
      const data = await resp.json();
      const results = data?.Results ?? data?.RelatedTopics ?? [];
      for (const r of results.slice(0, 5)) {
        const resultTitle = r.Text ?? r.Title ?? "";
        const resultUrl = r.FirstURL ?? "";
        const normalizedResult = normalizeText(resultTitle);
        const normalizedQuery = normalizeText(title);
        const words = normalizedQuery.split(" ").filter(Boolean);
        const matchCount = words.filter((w) => normalizedResult.includes(w)).length;
        const score = words.length > 0 ? matchCount / words.length : 0;
        matches.push({ title: resultTitle, url: resultUrl, score });
      }
    }
    matches.sort((a, b) => b.score - a.score);
    webSearchCache.set(cacheKey, { found: matches.length > 0, matches });
    const best = matches[0];
    return {
      source: "WEB",
      found: best ? best.score > 0.5 : false,
      match: best?.title ?? null,
      confidence: best?.score ?? 0,
      detail: best ? `Web match: "${best.title}" (${(best.score * 100).toFixed(0)}%)` : "No web similarity found",
    };
  } catch (err) {
    return { source: "WEB", found: false, match: null, confidence: 0, detail: `Web search failed: ${(err as Error).message}` };
  }
}

export async function checkExistingLitleId(title: string, abstract: string): Promise<TriangulationCheck> {
  const normalized = normalizeText(title);
  try {
    const resp = await fetch("https://raw.githubusercontent.com/OsoPanda1/litle-trust-fabric/main/src/routes/library.tsx", {
      signal: AbortSignal.timeout(5000),
    });
    if (resp.ok) {
      const content = await resp.text();
      const titleRefs = content.match(/title:\s*"([^"]+)"/g) ?? [];
      for (const ref of titleRefs) {
        const existingTitle = ref.match(/title:\s*"([^"]+)"/)?.[1] ?? "";
        const normalizedExisting = normalizeText(existingTitle);
        const words = normalized.split(" ").filter(Boolean);
        const matchCount = words.filter((w) => normalizedExisting.includes(w)).length;
        const ratio = words.length > 0 ? matchCount / words.length : 0;
        if (ratio > 0.7) {
          return {
            source: "LITLE-LIBRARY",
            found: true,
            match: existingTitle,
            confidence: ratio,
            detail: `Existing LITLE work found: "${existingTitle}"`,
          };
        }
      }
    }
    return { source: "LITLE-LIBRARY", found: false, match: null, confidence: 0.9, detail: "No duplicate in LITLE library" };
  } catch {
    return { source: "LITLE-LIBRARY", found: false, match: null, confidence: 0.5, detail: "LITLE library check unavailable" };
  }
}

function computeOverallResult(checks: TriangulationCheck[]): { result: TriangulationResult; summary: string } {
  const foundCount = checks.filter((c) => c.found).length;
  const highConfFound = checks.filter((c) => c.found && c.confidence > 0.6).length;
  const errors = checks.filter((c) => c.confidence === 0).length;

  if (errors === checks.length) {
    return { result: "inconclusive", summary: "All checks failed — unable to verify. Manual review required." };
  }

  if (highConfFound >= 2) {
    const matches = checks.filter((c) => c.found).map((c) => c.match).filter(Boolean).join(", ");
    return {
      result: "red",
      summary: `Information already published. Found ${highConfFound} independent confirmations: ${matches}. Author should review existing registrations.`,
    };
  }

  if (foundCount >= 1) {
    const match = checks.find((c) => c.found)?.match ?? "unknown";
    return {
      result: "red",
      summary: `Potential duplicate detected. Matching record: ${match}. Recommend author verification.`,
    };
  }

  if (errors > 0) {
    return {
      result: "inconclusive",
      summary: `${errors} check(s) failed due to service unavailability. Manual review recommended.`,
    };
  }

  return {
    result: "green",
    summary: "No existing registrations found across ORCID, DOI/CROSSREF, ISNI, or web sources. Ready for indexing.",
  };
}

export async function runTriangulation(
  submission: SubmissionDocument,
): Promise<{ report: TriangulationReport; evidence: DuplicateEvidence[] }> {
  const [orcidCheck, doiCheck, isniCheck, webCheck, litleCheck] = await Promise.all([
    checkOrcid(submission.orcid),
    checkDoi(submission.title, submission.abstract),
    checkIsni(submission.orcid),
    checkWebSimilarity(submission.title, submission.abstract),
    checkExistingLitleId(submission.title, submission.abstract),
  ]);

  const checks = [orcidCheck, doiCheck, isniCheck, webCheck, litleCheck];
  const { result, summary } = computeOverallResult(checks);

  const evidence: DuplicateEvidence[] = checks
    .filter((c) => c.found && c.match)
    .map((c) => ({
      type: c.source === "ORCID" ? "orcid" : c.source === "DOI/CROSSREF" ? "doi" : c.source === "ISNI" ? "isni" : c.source === "LITLE-LIBRARY" ? "crossref" : "web",
      identifier: c.match ?? "",
      existingWorkTitle: c.detail,
      existingWorkUrl: "",
      matchScore: c.confidence,
    }));

  return {
    report: {
      submissionId: submission.id,
      checks,
      overallResult: result,
      summary,
      completedAt: new Date().toISOString(),
    },
    evidence,
  };
}
