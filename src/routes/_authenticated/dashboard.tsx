import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { listBooks, createBook, deleteBook } from "@/lib/books.functions";
import { toast } from "sonner";
import { Book, Trash2, Plus, LogOut } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard · LITLE Librarian" },
      { name: "description", content: "Your manuscripts in progress." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const list = useServerFn(listBooks);
  const create = useServerFn(createBook);
  const del = useServerFn(deleteBook);
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data: books, isLoading } = useQuery({
    queryKey: ["books"],
    queryFn: () => list(),
  });

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [idea, setIdea] = useState("");
  const [coverPrompt, setCoverPrompt] = useState("");

  const createMut = useMutation({
    mutationFn: async () =>
      create({ data: { title, centralIdea: idea, coverPrompt } }),
    onSuccess: (b) => {
      toast.success("Book created");
      setShowForm(false);
      setTitle("");
      setIdea("");
      setCoverPrompt("");
      qc.invalidateQueries({ queryKey: ["books"] });
      navigate({ to: "/books/$bookId", params: { bookId: b.id } });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const delMut = useMutation({
    mutationFn: async (bookId: string) => del({ data: { bookId } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["books"] });
      toast.success("Removed");
    },
  });

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  return (
    <main className="min-h-screen">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 py-6">
        <div className="flex items-center gap-6">
          <Link to="/" className="font-serif text-lg gilt-text">
            LITLE Librarian
          </Link>
          <Link to="/submissions" className="text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground transition">
            Submissions
          </Link>
        </div>
        <button
          onClick={signOut}
          className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </nav>

      <section className="max-w-6xl mx-auto px-6">
        <div className="flex items-baseline justify-between mb-8">
          <div>
            <h1 className="font-serif text-4xl">Your archive</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Every book is a signed, verifiable artifact.
            </p>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 font-medium hover:opacity-90"
          >
            <Plus className="w-4 h-4" /> New book
          </button>
        </div>

        {showForm && (
          <div className="card-editorial p-6 mb-8">
            <div className="grid gap-4">
              <label className="block">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Title</span>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={200}
                  className="mt-1 w-full rounded-md bg-input border border-border px-3 py-2"
                />
              </label>
              <label className="block">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Central idea</span>
                <textarea
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  maxLength={2000}
                  rows={3}
                  className="mt-1 w-full rounded-md bg-input border border-border px-3 py-2 resize-none"
                />
              </label>
              <label className="block">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Cover prompt (optional)</span>
                <input
                  value={coverPrompt}
                  onChange={(e) => setCoverPrompt(e.target.value)}
                  maxLength={1000}
                  className="mt-1 w-full rounded-md bg-input border border-border px-3 py-2"
                />
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => createMut.mutate()}
                  disabled={!title.trim() || createMut.isPending}
                  className="rounded-md bg-primary text-primary-foreground px-4 py-2 font-medium disabled:opacity-50"
                >
                  {createMut.isPending ? "…" : "Create"}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="rounded-md border border-border px-4 py-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="text-muted-foreground">Loading…</div>
        ) : (books?.length ?? 0) === 0 ? (
          <div className="card-editorial p-12 text-center">
            <Book className="w-8 h-8 mx-auto mb-4 text-gilt" />
            <p className="text-muted-foreground">No books yet. Create your first manuscript.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {books!.map((b) => (
              <div key={b.id} className="card-editorial p-6 group">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-xs font-mono uppercase tracking-widest text-gilt">
                    {b.status}
                  </div>
                  <button
                    onClick={() => delMut.mutate(b.id)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <Link
                  to="/books/$bookId"
                  params={{ bookId: b.id }}
                  className="block"
                >
                  <h3 className="font-serif text-2xl mb-2 leading-tight">{b.title}</h3>
                  {b.central_idea && (
                    <p className="text-sm text-muted-foreground line-clamp-3">{b.central_idea}</p>
                  )}
                  {b.litle_signature && (
                    <p className="mt-4 font-mono text-[10px] text-gilt truncate" title={b.litle_signature}>
                      {b.litle_signature}
                    </p>
                  )}
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
