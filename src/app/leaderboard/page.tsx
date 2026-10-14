import Link from "next/link";
import { TraderRow } from "@/components/cards";
import { DemoTag, Eyebrow, cn } from "@/components/ui";
import { RANK_MIN_SETTLED, getData, leaderboard } from "@/lib/data";
import { formatNgn } from "@/lib/format";

export const metadata = { title: "Leaderboard" };

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort: raw } = await searchParams;
  const data = await getData();
  const sort = raw === "accuracy" ? "accuracy" : "return";
  const { ranked, unranked } = leaderboard(data, sort);
  const youFollow = new Set(data.you.following);

  return (
    <div className="space-y-10">
      <section className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <DemoTag>Demo record</DemoTag>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] md:text-6xl">Leaderboard</h1>
          <p className="mt-3 max-w-xl text-muted md:text-lg">
            Top traders by how their settled demo positions performed. Follow anyone to see their next call.
          </p>
        </div>
        <div className="inline-flex rounded-full border border-line bg-panel p-1 text-sm font-medium" role="tablist" aria-label="Sort by">
          {[
            { id: "return", label: "Return" },
            { id: "accuracy", label: "Accuracy" },
          ].map((s) => (
            <Link
              key={s.id}
              href={`/leaderboard?sort=${s.id}`}
              role="tab"
              aria-selected={sort === s.id}
              scroll={false}
              className={cn(
                "rounded-full px-5 py-2 transition-colors",
                sort === s.id ? "bg-ink text-bg" : "text-muted hover:text-ink",
              )}
            >
              {s.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-3 rounded-3xl border border-line bg-panel p-5 text-sm leading-6 text-muted md:grid-cols-3 md:p-6">
        <p>
          <span className="font-semibold text-ink">Return</span> is profit divided by the amount staked on settled positions.
        </p>
        <p>
          <span className="font-semibold text-ink">Accuracy</span> is the share of settled positions that won.
        </p>
        <p>
          Traders need {RANK_MIN_SETTLED} settled positions to rank. Everything here is demo data, not verified results.
        </p>
      </section>

      <section aria-label="Ranked traders">
        <div className="mb-4 flex items-center justify-between">
          <Eyebrow>Ranked by {sort === "return" ? "return" : "accuracy"}</Eyebrow>
          <span className="num text-xs text-faint">{ranked.length} ranked</span>
        </div>
        <div className="space-y-3">
          {ranked.map((trader, index) => (
            <div key={trader.id}>
              <TraderRow
                trader={trader}
                youId={data.you.id}
                following={youFollow.has(trader.id)}
                rank={index + 1}
                stats
              />
            </div>
          ))}
        </div>
      </section>

      {unranked.length ? (
        <section aria-label="Not ranked yet">
          <Eyebrow>Not ranked yet</Eyebrow>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {unranked.map((trader) => (
              <div key={trader.id} className="rounded-3xl border border-line bg-panel px-5 py-4">
                <TraderRow trader={trader} youId={data.you.id} following={youFollow.has(trader.id)} />
                <p className="num mt-2 pl-[3.25rem] text-xs text-muted">
                  {trader.settled} of {RANK_MIN_SETTLED} settled · {formatNgn(trader.openStake)} open
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
