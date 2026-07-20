import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { findRfc } from "@/content/rfcs";

export const Route = createFileRoute("/standard/rfcs/$slug")({
  loader: ({ params }) => {
    const rfc = findRfc(params.slug);
    if (!rfc) throw notFound();
    return rfc;
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "RFC not found — LITLE" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    return {
      meta: [
        { title: `${loaderData.id} — ${loaderData.title} — LITLE` },
        { name: "description", content: loaderData.abstract },
        { property: "og:title", content: `${loaderData.id} — ${loaderData.title}` },
        { property: "og:description", content: loaderData.abstract },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/standard/rfcs/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/standard/rfcs/${params.slug}` }],
    };
  },
  component: RfcDetail,
  notFoundComponent: () => (
    <section className="max-w-3xl mx-auto px-6 py-24 text-center">
      <h1 className="font-serif text-3xl mb-3">RFC not found</h1>
      <Link to="/standard/rfcs" className="underline text-sm">
        Back to RFCs
      </Link>
    </section>
  ),
});

function RfcDetail() {
  const rfc = Route.useLoaderData();
  return (
    <article className="max-w-3xl mx-auto px-6 py-16">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-muted-foreground mb-6">
        <span className="font-mono text-gilt">{rfc.id}</span>
        <span>{rfc.status} · {rfc.category}</span>
      </div>
      <h1 className="font-serif text-4xl md:text-5xl leading-tight mb-6">{rfc.title}</h1>
      <p className="text-muted-foreground text-lg leading-relaxed mb-10">{rfc.abstract}</p>
      <div className="hairline mb-10" />
      <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-foreground/90">
{rfc.body}
      </pre>
      <div className="mt-14 text-xs text-muted-foreground">
        Last updated {rfc.updated} · <Link to="/standard/rfcs" className="underline">All RFCs</Link>
      </div>
    </article>
  );
}
