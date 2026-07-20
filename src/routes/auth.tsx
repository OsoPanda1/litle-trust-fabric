import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in · LITLE Librarian" },
      { name: "description", content: "Sign in to the AI Librarian & Publisher." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/dashboard" },
        });
        if (error) throw error;
        toast.success("Account created. Redirecting…");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <Link to="/" className="mb-10 text-sm text-muted-foreground hover:text-foreground">
        ← LITLE Librarian
      </Link>
      <div className="card-editorial w-full max-w-sm p-8">
        <h1 className="font-serif text-3xl gilt-text mb-1">
          {mode === "signin" ? "Enter the stacks" : "Open an account"}
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          {mode === "signin"
            ? "Return to your unfinished manuscripts."
            : "Begin sealing your archive with LITLE-512B."}
        </p>
        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md bg-input border border-border px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Password</span>
            <input
              type="password"
              required
              minLength={6}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md bg-input border border-border px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-primary text-primary-foreground font-medium py-2.5 hover:opacity-90 transition disabled:opacity-50"
          >
            {busy ? "…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>
        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-6 text-sm text-muted-foreground hover:text-foreground w-full text-center"
        >
          {mode === "signin" ? "No account? Sign up →" : "Have an account? Sign in →"}
        </button>
      </div>
    </main>
  );
}
