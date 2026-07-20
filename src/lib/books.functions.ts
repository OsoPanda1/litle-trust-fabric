import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const CreateBookInput = z.object({
  title: z.string().trim().min(1).max(200),
  centralIdea: z.string().trim().max(2000).optional().default(""),
  coverPrompt: z.string().trim().max(1000).optional().default(""),
});

export const createBook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => CreateBookInput.parse(raw))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("books")
      .insert({
        user_id: userId,
        title: data.title,
        central_idea: data.centralIdea || null,
        cover_prompt: data.coverPrompt || null,
        status: "draft",
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const listBooks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("books")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getBook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ bookId: z.string().uuid() }).parse(raw))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const [book, sources, chapters, chunks] = await Promise.all([
      supabase.from("books").select("*").eq("id", data.bookId).maybeSingle(),
      supabase
        .from("sources")
        .select("id, filename, mime, size, char_count, created_at")
        .eq("book_id", data.bookId)
        .order("created_at", { ascending: true }),
      supabase
        .from("chapters")
        .select("*")
        .eq("book_id", data.bookId)
        .order("order_idx", { ascending: true }),
      supabase
        .from("chunks")
        .select("id, source_id, chapter_id, order_idx, content, superseded_by, similarity_score")
        .eq("book_id", data.bookId),
    ]);
    if (book.error) throw new Error(book.error.message);
    if (!book.data) throw new Error("Book not found");
    return {
      book: book.data,
      sources: sources.data ?? [],
      chapters: chapters.data ?? [],
      chunks: chunks.data ?? [],
    };
  });

export const deleteBook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ bookId: z.string().uuid() }).parse(raw))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("books").delete().eq("id", data.bookId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
