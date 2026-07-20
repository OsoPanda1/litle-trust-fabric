import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { getBook } from "@/lib/books.functions";
import {
  addSource,
  runIngestion,
  deduplicateChunks,
  buildChapters,
  synthesizeChapter,
  signBook,
  exportManuscript,
} from "@/lib/pipeline.functions";
import { extractFile } from "@/lib/extract.client";
import {
  Upload,
  FileText,
  Play,
  Layers,
  BookOpen,
  Sparkles,
  Shield,
  Download,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/books/$bookId")({
  head: ({ params }) => ({
    meta: [
      { title: "Manuscript · LITLE Librarian" },
      { name: "description", content: `Book ${params.bookId} pipeline` },
    ],
  }),
  component: BookDetail,
});

function BookDetail() {
  const { bookId } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const get = useServerFn(getBook);
  const add = useServerFn(addSource);
  const ingest = useServerFn(runIngestion);
  const dedup = useServerFn(deduplicateChunks);
  const build = useServerFn(buildChapters);
  const synth = useServerFn(synthesizeChapter);
  const sign = useServerFn(signBook);
  const exp = useServerFn(exportManuscript);

  const { data, isLoading } = useQuery({
    queryKey: ["book", bookId],
    queryFn: () => get({ data: { bookId } }),
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["book", bookId] });

  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    let ok = 0;
    for (const f of Array.from(files)) {
      try {
        const ext = await extractFile(f);
        if (!ext.text.trim()) {
          toast.error(`${f.name}: no text extracted`);
          continue;
        }
        await add({
          data: {
            bookId,
            filename: ext.filename,
            mime: ext.mime,
            size: ext.size,
            text: ext.text,
          },
        });
        ok++;
      } catch (e) {
        toast.error(`${f.name}: ${e instanceof Error ? e.message : "failed"}`);
      }
    }
    setUploading(false);
    if (ok > 0) toast.success(`${ok} source${ok === 1 ? "" : "s"} added`);
    refresh();
  }

  function withToast<T>(label: string, fn: () => Promise<T>) {
    return async () => {
      const id = toast.loading(label + "…");
      try {
        const r = await fn();
        toast.success(label + " ✓", { id });
        refresh();
        return r;
      } catch (e) {
        toast.error(e instanceof Error ? e.message : label + " failed", { id });
      }
    };
  }

  const ingestMut = useMutation({ mutationFn: withToast("Ingesting", () => ingest({ data: { bookId } })) });
  const dedupMut = useMutation({ mutationFn: withToast("Deduplicating", () => dedup({ data: { bookId } })) });
  const buildMut = useMutation({ mutationFn: withToast("Mapping chapters", () => build({ data: { bookId } })) });
  const signMut = useMutation({ mutationFn: withToast("Sealing LITLE-512B", () => sign({ data: { bookId } })) });
  const synthMut = useMutation({
    mutationFn: async (chapterId: string) => {
      const id = toast.loading("Synthesizing…");
      try {
        await synth({ data: { bookId, chapterId } });
        toast.success("Synthesized ✓", { id });
        refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed", { id });
      }
    },
  });

  async function download() {
    try {
      const r = await exp({ data: { bookId } });
      const blob = new Blob([r.markdown], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = r.filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    }
  }

  if (isLoading) return <div className="p-10 text-muted-foreground">Loading…</div>;
  if (!data) return <div className="p-10">Not found.</div>;

  const { book, sources, chapters, chunks } = data;
  const activeChunks = chunks.filter((c) => !c.superseded_by);
  const superseded = chunks.length - activeChunks.length;

  return (
    <main className="min-h-screen">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 py-6">
        <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
          ← Archive
        </Link>
        <button onClick={() => navigate({ to: "/dashboard" })} className="text-sm text-muted-foreground">
          Dashboard
        </button>
      </nav>

      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="mb-10">
          <div className="text-xs font-mono uppercase tracking-widest text-gilt mb-2">
            {book.status}
          </div>
          <h1 className="font-serif text-5xl leading-tight mb-3">{book.title}</h1>
          {book.central_idea && (
            <p className="text-muted-foreground max-w-2xl">{book.central_idea}</p>
          )}
          {book.litle_signature && (
            <div className="mt-6 card-editorial p-4">
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
                <Shield className="w-3 h-3" /> LITLE-512B signature
              </div>
              <code className="font-mono text-xs text-gilt break-all">{book.litle_signature}</code>
            </div>
          )}
        </div>

        <div className="hairline mb-10" />

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <PipelineCard
            step={1}
            icon={<Upload className="w-5 h-5" />}
            title="Ingest sources"
            body={`${sources.length} source${sources.length === 1 ? "" : "s"} · ${sources.reduce((s, x) => s + (x.char_count ?? 0), 0).toLocaleString()} chars`}
            action={
              <>
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  accept=".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown"
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files)}
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium disabled:opacity-50"
                >
                  {uploading ? "Extracting…" : "Upload files"}
                </button>
              </>
            }
          >
            {sources.length > 0 && (
              <ul className="mt-3 text-xs space-y-1 max-h-32 overflow-auto">
                {sources.map((s) => (
                  <li key={s.id} className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="w-3 h-3" />
                    <span className="truncate">{s.filename}</span>
                    <span className="ml-auto font-mono">{s.char_count?.toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </PipelineCard>

          <PipelineCard
            step={2}
            icon={<Play className="w-5 h-5" />}
            title="Segment & embed"
            body={`${chunks.length} chunks · ${activeChunks.length} active`}
            action={
              <button
                onClick={() => ingestMut.mutate()}
                disabled={ingestMut.isPending || sources.length === 0}
                className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium disabled:opacity-50"
              >
                {ingestMut.isPending ? "…" : "Run ingestion"}
              </button>
            }
          />

          <PipelineCard
            step={3}
            icon={<Layers className="w-5 h-5" />}
            title="Reconcile versions"
            body={`${superseded} chunk${superseded === 1 ? "" : "s"} superseded (α=0.7, θ=0.95)`}
            action={
              <button
                onClick={() => dedupMut.mutate()}
                disabled={dedupMut.isPending || chunks.length === 0}
                className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium disabled:opacity-50"
              >
                {dedupMut.isPending ? "…" : "Deduplicate"}
              </button>
            }
          />

          <PipelineCard
            step={4}
            icon={<BookOpen className="w-5 h-5" />}
            title="Map chapters"
            body={`${chapters.length} chapter${chapters.length === 1 ? "" : "s"} in the ToC`}
            action={
              <button
                onClick={() => buildMut.mutate()}
                disabled={buildMut.isPending || activeChunks.length === 0}
                className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium disabled:opacity-50"
              >
                {buildMut.isPending ? "…" : "Rebuild ToC"}
              </button>
            }
          />
        </div>

        {chapters.length > 0 && (
          <div className="mb-10">
            <h2 className="font-serif text-3xl mb-4 flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-gilt" /> Chapters
            </h2>
            <div className="space-y-3">
              {chapters.map((c) => {
                const assigned = activeChunks.filter((x) => x.chapter_id === c.id).length;
                const done = !!c.synthesized_text;
                return (
                  <div key={c.id} className="card-editorial p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-xs font-mono text-gilt mb-1">
                          {String(c.order_idx + 1).padStart(2, "0")}
                        </div>
                        <h3 className="font-serif text-xl truncate">{c.title}</h3>
                        <div className="text-xs text-muted-foreground mt-1">
                          {assigned} fragments · {done ? `${c.synthesized_text?.length.toLocaleString()} chars synthesized` : "not synthesized"}
                        </div>
                      </div>
                      <button
                        onClick={() => synthMut.mutate(c.id)}
                        disabled={synthMut.isPending || assigned === 0}
                        className="shrink-0 rounded-md border border-gilt/60 gilt-text px-3 py-1.5 text-sm hover:bg-gilt/10 disabled:opacity-50"
                      >
                        {done ? "Resynthesize" : "Synthesize"}
                      </button>
                    </div>
                    {done && (
                      <details className="mt-3">
                        <summary className="text-xs text-muted-foreground cursor-pointer">
                          Preview
                        </summary>
                        <div className="mt-3 text-sm text-foreground/90 whitespace-pre-wrap max-h-96 overflow-auto">
                          {c.synthesized_text}
                        </div>
                      </details>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="hairline mb-6" />

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => signMut.mutate()}
            disabled={signMut.isPending || chapters.length === 0}
            className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-5 py-2.5 font-medium disabled:opacity-50"
          >
            <Shield className="w-4 h-4" />
            {signMut.isPending ? "Sealing…" : "Seal with LITLE-512B"}
          </button>
          <button
            onClick={download}
            className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-2.5 hover:bg-accent/30"
          >
            <Download className="w-4 h-4" /> Export manuscript (.md)
          </button>
        </div>
      </section>
    </main>
  );
}

function PipelineCard({
  step,
  icon,
  title,
  body,
  action,
  children,
}: {
  step: number;
  icon: React.ReactNode;
  title: string;
  body: string;
  action: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="card-editorial p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-md bg-accent/40 border border-border grid place-items-center text-gilt">
          {icon}
        </div>
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            Step {step}
          </div>
          <h3 className="font-serif text-xl leading-tight">{title}</h3>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-4">{body}</p>
      {action}
      {children}
    </div>
  );
}
