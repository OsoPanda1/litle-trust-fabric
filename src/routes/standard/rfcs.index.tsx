import { createFileRoute, Link } from "@tanstack/react-router";
import { RFCS } from "@/content/rfcs";

export const Route = createFileRoute("/standard/rfcs/")({
  head: () => ({
    meta: [
      { title: "RFCs — The LITLE Standard" },
      {
        name: "description",
        content:
          "Public specifications governing LITLE identifiers, evidence chains, preservation and governance.",
      },
      { property: "og:title", content: "RFCs — The LITLE Standard" },
      { property: "og:url", content: "/standard/rfcs" },
    ],
    links: [{ rel: "canonical", href: "/standard/rfcs" }],
  }),
  component: RfcsIndex,
});

function RfcsIndex() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-20">
      <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
        Request for Comments
      </div>
      <h1 className="font-serif text-4xl md:text-5xl mb-8 leading-tight">
        Every specification, in public.
      </h1>
      <p className="text-muted-foreground max-w-2xl mb-12">
        LITLE evolves through numbered RFCs with a public review window. Nothing
        is silently overridden.
      </p>
      <ul className="divide-y divide-border/60 border border-border">
        {RFCS.map((r) => (
          <li key={r.id}>
            <Link
              to="/standard/rfcs/$slug"
              params={{ slug: r.slug }}
              className="grid grid-cols-[7rem_1fr_9rem_7rem] gap-4 items-center p-5 hover:bg-accent/20"
            >
              <span className="font-mono text-xs text-gilt">{r.id}</span>
              <div>
                <div className="font-serif text-lg">{r.title}</div>
                <div className="text-xs text-muted-foreground mt-1">{r.abstract}</div>
              </div>
              <span className="text-xs text-muted-foreground">{r.category}</span>
              <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground text-right">
                {r.status}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
