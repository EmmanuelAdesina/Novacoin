import Link from "next/link";
import { MarketCard } from "@/components/cards";
import { Segmented, cn } from "@/components/ui";
import { followedInMarket, getData } from "@/lib/data";
import { CATEGORIES, categoryLabel, formatCompactNgn } from "@/lib/format";

export const metadata = { title: "Markets" };

export default async function MarketsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const data = await getData();
  const active = CATEGORIES.some((c) => c.id === category) ? category : undefined;
  const inView = (m: { category: string }) => !active || m.category === active;

  const open = data.markets
    .filter((m) => m.status === "open" && inView(m))
    .sort((a, b) => Number(b.featured) - Number(a.featured) || b.traderCount - a.traderCount);
  const settled = data.markets.filter((m) => m.status === "settled" && inView(m));
  const volume = data.markets.reduce((sum, m) => sum + m.volume, 0);

  return (
    <div className="space-y-10">
      <section className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl font-semibold tracking-[-0.04em] md:text-6xl">Markets</h1>
          <p className="mt-3 max-w-xl text-muted md:text-lg">
            Real-world questions with a price on each answer. The price is the chance the crowd gives it.
          </p>
          <p className="num mt-3 text-sm text-faint">
            {open.length} open · {formatCompactNgn(volume)} demo volume
          </p>
        </div>
        <Segmented
          items={[
            { href: "/markets", label: "Markets", active: true },
            { href: "/feed", label: "Feed", active: false },
          ]}
        />
      </section>

      <nav aria-label="Categories" className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 md:mx-0 md:flex-wrap md:px-0">
        {[{ id: "all", label: "All" }, ...CATEGORIES].map((c) => {
          const on = c.id === "all" ? !active : c.id === active;
          return (
            <Link
              key={c.id}
              href={c.id === "all" ? "/markets" : `/markets?category=${c.id}`}
              aria-current={on ? "page" : undefined}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition",
                on ? "border-ink bg-ink text-bg" : "border-line-2 text-muted hover:text-ink",
              )}
            >
              {c.label}
            </Link>
          );
        })}
      </nav>

      <section>
        {open.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {open.map((market) => (
              <MarketCard key={market.id} market={market} followed={followedInMarket(data, market)} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-line-2 p-10 text-center text-muted">
            No open {active ? categoryLabel(active).toLowerCase() : ""} markets right now.
          </div>
        )}
      </section>

      {settled.length ? (
        <section>
          <h2 className="text-xl font-semibold tracking-[-0.01em]">Settled</h2>
          <p className="mt-1 text-sm text-muted">Results are demo settlements, not official outcomes.</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {settled.map((market) => (
              <MarketCard key={market.id} market={market} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
