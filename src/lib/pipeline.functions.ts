import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const AddSourceInput = z.object({
  bookId: z.string().uuid(),
  filename: z.string().trim().min(1).max(500),
  mime: z.string().trim().max(200).optional().default(""),
  size: z.number().int().nonnegative().max(50_000_000), // 50MB per source cap
  text: z.string().min(1).max(4_000_000), // 4M chars per source cap
});

export const addSource = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => AddSourceInput.parse(raw))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("sources")
      .insert({
        book_id: data.bookId,
        user_id: userId,
        filename: data.filename,
        mime: data.mime,
        size: data.size,
        extracted_text: data.text,
        char_count: data.text.length,
      })
      .select("id, filename, char_count")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

// --- Pipeline ---

const BookIdInput = z.object({ bookId: z.string().uuid() });

// Roughly ~800 word paragraph-aware chunks
function chunkText(text: string, targetChars = 2400): string[] {
  const paragraphs = text.split(/\n{2,}/).filter((p) => p.trim().length > 0);
  const chunks: string[] = [];
  let cur = "";
  for (const p of paragraphs) {
    if (cur.length + p.length + 2 <= targetChars) {
      cur = cur ? cur + "\n\n" + p : p;
    } else {
      if (cur) chunks.push(cur);
      if (p.length <= targetChars) {
        cur = p;
      } else {
        // Hard-split long paragraph
        for (let i = 0; i < p.length; i += targetChars) {
          chunks.push(p.slice(i, i + targetChars));
        }
        cur = "";
      }
    }
  }
  if (cur) chunks.push(cur);
  return chunks;
}

async function sha256Hex(s: string): Promise<string> {
  const buf = new TextEncoder().encode(s);
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const runIngestion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => BookIdInput.parse(raw))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: sources, error: sErr } = await supabase
      .from("sources")
      .select("id, extracted_text")
      .eq("book_id", data.bookId);
    if (sErr) throw new Error(sErr.message);

    // Sources with existing chunks are skipped
    const { data: existing } = await supabase
      .from("chunks")
      .select("source_id")
      .eq("book_id", data.bookId);
    const done = new Set((existing ?? []).map((c) => c.source_id));

    const pending = (sources ?? []).filter((s) => s.extracted_text && !done.has(s.id));

    const { embedTexts } = await import("./ai-gateway.server");

    let totalChunks = 0;
    let idxCounter = 0;
    for (const src of pending) {
      const pieces = chunkText(src.extracted_text!);
      // batch embed 32 at a time
      for (let i = 0; i < pieces.length; i += 32) {
        const batch = pieces.slice(i, i + 32);
        const { embeddings } = await embedTexts(batch);
        const rows = await Promise.all(
          batch.map(async (content, j) => ({
            book_id: data.bookId,
            source_id: src.id,
            user_id: userId,
            content,
            content_hash: await sha256Hex(content),
            embedding: embeddings[j] ?? [],
            order_idx: idxCounter++,
          })),
        );
        const { error: iErr } = await supabase.from("chunks").insert(rows);
        if (iErr) throw new Error(iErr.message);
        totalChunks += rows.length;
      }
    }

    await supabase
      .from("books")
      .update({ status: "ingested", updated_at: new Date().toISOString() })
      .eq("id", data.bookId);

    return { processedSources: pending.length, chunksCreated: totalChunks };
  });

// Cosine similarity
function cosine(a: number[], b: number[]): number {
  if (a.length === 0 || b.length === 0 || a.length !== b.length) return 0;
  let dot = 0,
    na = 0,
    nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const d = Math.sqrt(na) * Math.sqrt(nb);
  return d === 0 ? 0 : dot / d;
}

// Simple normalized Levenshtein estimate on truncated text
function levSim(a: string, b: string): number {
  const A = a.slice(0, 400);
  const B = b.slice(0, 400);
  const m = A.length,
    n = B.length;
  if (m === 0 && n === 0) return 1;
  const dp = new Uint16Array((m + 1) * (n + 1));
  for (let i = 0; i <= m; i++) dp[i * (n + 1)] = i;
  for (let j = 0; j <= n; j++) dp[j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = A.charCodeAt(i - 1) === B.charCodeAt(j - 1) ? 0 : 1;
      dp[i * (n + 1) + j] = Math.min(
        dp[(i - 1) * (n + 1) + j] + 1,
        dp[i * (n + 1) + (j - 1)] + 1,
        dp[(i - 1) * (n + 1) + (j - 1)] + cost,
      );
    }
  }
  return 1 - dp[m * (n + 1) + n] / Math.max(m, n);
}

export const deduplicateChunks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => BookIdInput.parse(raw))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: chunks, error } = await supabase
      .from("chunks")
      .select("id, content, embedding, created_at, superseded_by")
      .eq("book_id", data.bookId)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    if (!chunks) return { duplicates: 0, evolutions: 0 };

    const ALPHA = 0.7;
    const DUP_THRESHOLD = 0.95;
    const EVO_THRESHOLD = 0.7;

    const active = chunks.filter((c) => !c.superseded_by);
    const updates: { id: string; superseded_by: string; similarity_score: number }[] = [];
    let evolutions = 0;

    for (let i = 0; i < active.length; i++) {
      if (updates.find((u) => u.id === active[i].id)) continue;
      const a = active[i];
      const ea = (a.embedding as number[]) ?? [];
      if (ea.length === 0) continue;
      for (let j = i + 1; j < active.length; j++) {
        const b = active[j];
        if (updates.find((u) => u.id === b.id)) continue;
        const eb = (b.embedding as number[]) ?? [];
        if (eb.length === 0) continue;
        const cos = cosine(ea, eb);
        if (cos < EVO_THRESHOLD) continue;
        const lev = levSim(a.content, b.content);
        const s = ALPHA * cos + (1 - ALPHA) * lev;
        if (s >= DUP_THRESHOLD) {
          // Newer supersedes older (a is older by ordering above)
          updates.push({ id: a.id, superseded_by: b.id, similarity_score: s });
          break;
        } else if (s >= EVO_THRESHOLD) {
          evolutions++;
        }
      }
    }

    for (const u of updates) {
      await supabase
        .from("chunks")
        .update({ superseded_by: u.superseded_by, similarity_score: u.similarity_score })
        .eq("id", u.id);
    }

    return { duplicates: updates.length, evolutions };
  });

// Build chapters: ask the LLM to propose a ToC from a sample of active chunks,
// then assign each chunk to the closest chapter centroid.
export const buildChapters = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => BookIdInput.parse(raw))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: book } = await supabase
      .from("books")
      .select("title, central_idea")
      .eq("id", data.bookId)
      .single();

    const { data: chunks, error } = await supabase
      .from("chunks")
      .select("id, content, embedding")
      .eq("book_id", data.bookId)
      .is("superseded_by", null);
    if (error) throw new Error(error.message);
    if (!chunks || chunks.length === 0) return { chapters: 0, assigned: 0 };

    // Sample: take up to 40 evenly spaced chunks
    const sample: typeof chunks = [];
    const step = Math.max(1, Math.floor(chunks.length / 40));
    for (let i = 0; i < chunks.length; i += step) sample.push(chunks[i]);

    const { chatComplete } = await import("./ai-gateway.server");
    const prompt = [
      `You are an editorial architect. Design a compact table of contents for the book titled: "${book?.title ?? "Untitled"}".`,
      book?.central_idea ? `Central idea: ${book.central_idea}` : "",
      `Below are representative passages from thousands of research fragments. Propose between 5 and 12 chapters that best organize the material topologically (by theme, not by chronology).`,
      `Return STRICT JSON of the form: {"chapters":[{"title":"..."}]} with no prose.`,
      `Passages (abbreviated):`,
      sample.map((s, i) => `[#${i + 1}] ${s.content.slice(0, 500)}`).join("\n---\n"),
    ]
      .filter(Boolean)
      .join("\n\n");

    const raw = await chatComplete(
      [
        {
          role: "system",
          content:
            "You output ONLY valid JSON matching the requested shape. No commentary, no markdown fences.",
        },
        { role: "user", content: prompt },
      ],
      { maxTokens: 1200, temperature: 0.3 },
    );

    let toc: { chapters: { title: string }[] };
    try {
      const cleaned = raw
        .trim()
        .replace(/^```(?:json)?/i, "")
        .replace(/```$/, "")
        .trim();
      toc = JSON.parse(cleaned);
    } catch {
      toc = { chapters: [{ title: "Chapter One" }, { title: "Chapter Two" }] };
    }
    const titles = (toc.chapters ?? []).map((c) => c.title).filter(Boolean).slice(0, 12);
    if (titles.length === 0) titles.push("Chapter One");

    // Reset chapters
    await supabase.from("chapters").delete().eq("book_id", data.bookId);
    await supabase
      .from("chunks")
      .update({ chapter_id: null })
      .eq("book_id", data.bookId);

    // Embed titles to build initial centroids
    const { embedTexts } = await import("./ai-gateway.server");
    const { embeddings: titleEmb } = await embedTexts(titles);

    const inserted: { id: string; centroid: number[]; order: number }[] = [];
    for (let i = 0; i < titles.length; i++) {
      const { data: row, error: e } = await supabase
        .from("chapters")
        .insert({
          book_id: data.bookId,
          user_id: userId,
          order_idx: i,
          title: titles[i],
          centroid: titleEmb[i] ?? [],
        })
        .select("id")
        .single();
      if (e) throw new Error(e.message);
      inserted.push({ id: row.id, centroid: titleEmb[i] ?? [], order: i });
    }

    // Assign each chunk to nearest centroid
    let assigned = 0;
    for (const chunk of chunks) {
      const emb = (chunk.embedding as number[]) ?? [];
      if (emb.length === 0) continue;
      let best = -Infinity;
      let bestId = inserted[0].id;
      for (const chap of inserted) {
        const s = cosine(emb, chap.centroid);
        if (s > best) {
          best = s;
          bestId = chap.id;
        }
      }
      await supabase.from("chunks").update({ chapter_id: bestId }).eq("id", chunk.id);
      assigned++;
    }

    await supabase
      .from("books")
      .update({ status: "mapped", updated_at: new Date().toISOString() })
      .eq("id", data.bookId);

    return { chapters: titles.length, assigned };
  });

const SynthesizeInput = z.object({
  bookId: z.string().uuid(),
  chapterId: z.string().uuid(),
});

export const synthesizeChapter = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => SynthesizeInput.parse(raw))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const [{ data: chapter }, { data: book }, { data: chunks }] = await Promise.all([
      supabase.from("chapters").select("*").eq("id", data.chapterId).single(),
      supabase.from("books").select("title, central_idea").eq("id", data.bookId).single(),
      supabase
        .from("chunks")
        .select("content, order_idx")
        .eq("chapter_id", data.chapterId)
        .is("superseded_by", null)
        .order("order_idx", { ascending: true }),
    ]);
    if (!chapter) throw new Error("Chapter not found");

    const source = (chunks ?? [])
      .map((c, i) => `<<FRAG ${i + 1}>>\n${c.content}`)
      .join("\n\n");
    if (!source) throw new Error("No content assigned to this chapter yet.");

    const { chatComplete } = await import("./ai-gateway.server");
    const output = await chatComplete(
      [
        {
          role: "system",
          content:
            "You are a rigorous editorial synthesizer. Given fragments from disparate research files, you produce a SINGLE flowing chapter that: (1) preserves every unique technical detail, axiom, definition, formula and reference; (2) reconciles overlapping versions by keeping the most complete phrasing; (3) inserts smooth logical transitions between historically distant fragments; (4) never invents facts. Write in the same language as the fragments. Return only the chapter text (no headings for other chapters, no meta commentary).",
        },
        {
          role: "user",
          content: `Book: "${book?.title ?? ""}"\nCentral idea: ${book?.central_idea ?? ""}\nChapter title: "${chapter.title}"\n\nFRAGMENTS TO FUSE:\n\n${source}`,
        },
      ],
      { maxTokens: 8000, temperature: 0.5 },
    );

    await supabase
      .from("chapters")
      .update({ synthesized_text: output })
      .eq("id", data.chapterId);

    // If all chapters synthesized → mark book synthesized
    const { data: remaining } = await supabase
      .from("chapters")
      .select("id, synthesized_text")
      .eq("book_id", data.bookId);
    if ((remaining ?? []).every((c) => c.synthesized_text && c.synthesized_text.length > 0)) {
      await supabase
        .from("books")
        .update({ status: "synthesized", updated_at: new Date().toISOString() })
        .eq("id", data.bookId);
    }
    return { chars: output.length };
  });

export const signBook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => BookIdInput.parse(raw))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const [{ data: book }, { data: chapters }] = await Promise.all([
      supabase.from("books").select("*").eq("id", data.bookId).single(),
      supabase
        .from("chapters")
        .select("title, synthesized_text, order_idx")
        .eq("book_id", data.bookId)
        .order("order_idx", { ascending: true }),
    ]);
    if (!book) throw new Error("Book not found");
    const texts = (chapters ?? []).map(
      (c) => `# ${c.title}\n\n${c.synthesized_text ?? ""}`,
    );
    if (texts.length === 0 || texts.every((t) => t.trim().length < 10)) {
      throw new Error("Cannot sign an empty manuscript — synthesize chapters first.");
    }

    const { buildLitleSignature } = await import("./litle/sign");
    const workspaceSecret = process.env.LITLE_AUTHOR_SECRET;
    if (!workspaceSecret) {
      throw new Error("LITLE_AUTHOR_SECRET environment variable is required for signing");
    }

    const { canonical } = buildLitleSignature({
      chapterTexts: texts,
      coverPrompt: book.cover_prompt,
      version: { major: 1, minor: 0, patch: 0 },
      flags: 0x02, // commercial
      authorSecret: workspaceSecret,
    });

    const totalChars = texts.reduce((s, t) => s + t.length, 0);
    await supabase
      .from("books")
      .update({
        litle_signature: canonical,
        status: "signed",
        stats: { chapters: texts.length, chars: totalChars, pages: Math.ceil(totalChars / 1800) },
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.bookId);

    return { canonical, chapters: texts.length, chars: totalChars };
  });

const ExportInput = z.object({ bookId: z.string().uuid() });

export const exportManuscript = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => ExportInput.parse(raw))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const [{ data: book }, { data: chapters }] = await Promise.all([
      supabase.from("books").select("*").eq("id", data.bookId).single(),
      supabase
        .from("chapters")
        .select("title, synthesized_text, order_idx")
        .eq("book_id", data.bookId)
        .order("order_idx", { ascending: true }),
    ]);
    if (!book) throw new Error("Book not found");
    const md: string[] = [];
    md.push(`# ${book.title}`);
    if (book.central_idea) md.push(`\n> ${book.central_idea}\n`);
    if (book.litle_signature) {
      md.push(`\n**LITLE-512B signature:** \`${book.litle_signature}\`\n`);
    }
    for (const c of chapters ?? []) {
      md.push(`\n\n## ${c.title}\n\n${c.synthesized_text ?? "_(empty)_"}`);
    }
    return { markdown: md.join("\n"), filename: `${slug(book.title)}.md` };
  });

function slug(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80) || "manuscript";
}
