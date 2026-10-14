import Link from "next/link";
import { CategoryMark, DemoChip, Kicker, When } from "@/components/ui";
import { getCircuit } from "@/lib/circuit";
import { CATEGORIES, formatPrice } from "@/lib/format";

export const metadata = { title: "Calls" };

export default async function CallsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; category?: string; sort?: string }>;
}) {
  const sp = await searchParams;
  const status = sp.status === "settled" ? "settled" : "open";
  const category = sp.category ?? "all";
  const sort = sp.sort === "readers" || sp.sort === "price" ? sp.sort : "closing";
  const circuit = await getCircuit();
  let rows = circuit.markets.filter((m) => (status === "open" ? m.open : !m.open));
  if (category !== "all") rows = rows.filter((m) => m.category === category);
  rows = rows.slice().sort((a, b) => {
    if (sort === "readers") return b.readerCount - a.readerCount;
    if (sort === "price") {
      const ap = Math.max(...a.outcomes.map((o) => o.priceBps));
      const bp = Math.max(...b.outcomes.map((o) => o.priceBps));
      return bp - ap;
    }
    return new Date(a.closesAt).getTime() - new Date(b.closesAt).getTime();
  });

  function href(next: { status?: string; category?: string; sort?: string }) {
    const params = new URLSearchParams();
    params.set("status", next.status ?? status);
    params.set("category", next.category ?? category);
    params.set("sort", next.sort ?? sort);
    return `/calls?${params.toString()}`;
  }

  return (
    <div>
      <Kicker>Calls</Kicker>
      <h1 className="mt-3 max-w-3xl font-serif text-4xl tracking-[-0.04em] md:text-5xl">Questions with a rule, a close, and a price.</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
        A call is speculative. You can lose the demo stake. It is not a contest prize, not income, and not a live market.
        Every reader on a question is a named demonstration profile.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        {[
          ["open", "Open"],
          ["settled", "Settled"],
        ].map(([id, label]) => (
          <Link key={id} href={href({ status: id })} className={status === id ? "bg-ink px-3 py-1.5 text-sm text-[#f6f1e7]" : "border border-line px-3 py-1.5 text-sm"}>
            {label}
          </Link>
        ))}
      </div>
      <div className="mt-3 flex gap-2 overflow-x-auto">
        <Link href={href({ category: "all" })} className={category === "all" ? "shrink-0 bg-forest px-3 py-1.5 text-sm text-[#f6f1e7]" : "shrink-0 border border-line px-3 py-1.5 text-sm"}>
          All
        </Link>
        {CATEGORIES.map((c) => (
          <Link key={c.id} href={href({ category: c.id })} className={category === c.id ? "shrink-0 bg-forest px-3 py-1.5 text-sm text-[#f6f1e7]" : "shrink-0 border border-line px-3 py-1.5 text-sm"}>
            {c.label}
          </Link>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-sm">
        {[
          ["closing", "Closing"],
          ["readers", "Readers"],
          ["price", "Leading price"],
        ].map(([id, label]) => (
          <Link key={id} href={href({ sort: id })} className={sort === id ? "underline" : "text-muted"}>
            {label}
          </Link>
        ))}
      </div>
      {rows.length === 0 ? (
        <p className="mt-8 border border-dashed border-line px-4 py-8 text-sm text-muted">No calls in this filter.</p>
      ) : (
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {rows.map((m) => {
            const top = m.outcomes.slice().sort((a, b) => b.priceBps - a.priceBps)[0];
            return (
              <li key={m.id}>
                <Link href={`/calls/${m.id}`} className="grid gap-3 py-4 md:grid-cols-[1fr_140px_120px] md:items-center">
                  <span>
                    <span className="flex flex-wrap items-center gap-2">
                      <CategoryMark id={m.category} />
                      <DemoChip>{m.open ? "Open" : `Resolved ${m.resolvedLabel}`}</DemoChip>
                    </span>
                    <span className="mt-1 block font-serif text-2xl leading-snug tracking-[-0.03em]">{m.question}</span>
                  </span>
                  <span className="text-sm text-muted">
                    {m.open ? (
                      <>
                        Closes <When value={m.closesAt} />
                      </>
                    ) : (
                      <>
                        Resolved <When value={m.resolvesAt} />
                      </>
                    )}
                    <span className="mt-1 block">{m.readerCount} readers</span>
                  </span>
                  <span className="font-serif text-3xl num">{top ? formatPrice(top.priceBps) : "—"}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
