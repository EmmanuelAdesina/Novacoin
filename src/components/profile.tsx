import Link from "next/link";
import { PositionItem, TraderRow } from "@/components/cards";
import { FollowButton } from "@/components/widgets";
import { Avatar, EmptyState, Eyebrow, btnGhost, cn } from "@/components/ui";
import type { Trader } from "@/lib/data";
import { getData } from "@/lib/data";
import { formatAccuracy, formatNgn, formatReturn, formatSignedNgn } from "@/lib/format";

export function ProfileView({ trader }: { trader: Trader & { wins?: number; settled?: number; returnRatio?: number | null; profit?: number; openCount?: number; openStake?: number; accuracy?: number | null; ranked?: boolean } }) {
  const data = getData();
  const isYou = trader.id === data.you.id;
  const youFollow = new Set(data.you.following);
  const positions = data.positions.filter((p: any) => p.trader.id === trader.id).slice(0, 12);
  const following = data.traders.filter((t) => trader.following.includes(t.id));
  const followers = data.traders.filter((t) => trader.followers.includes(t.id));
  const wins = trader.wins ?? 0;
  const settled = trader.settled ?? 0;
  const losses = settled - wins;

  return (
    <div className="space-y-10">
      <section className="glow rounded-[28px] border border-line p-6 md:p-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex items-center gap-5">
            <Avatar initials={trader.initials} hue={trader.hue} size={84} />
            <div className="min-w-0">
              <h1 className="truncate text-3xl font-bold tracking-[-0.03em] md:text-5xl">
                {isYou ? "Your Profile" : trader.name}
              </h1>
              <p className="mt-1 text-sm text-muted">
                @{trader.handle} · {trader.city}
              </p>
              <p className="mt-3 inline-flex rounded-full border border-line-2 px-3 py-1 text-xs font-medium text-muted">
                {trader.style}
              </p>
            </div>
          </div>
          {isYou ? (
            <Link href="/portfolio" className={btnGhost}>
              See my bets
            </Link>
          ) : (
            <FollowButton handle={trader.handle} following={youFollow.has(trader.id)} size="large" />
          )}
        </div>
        <p className="mt-6 max-w-2xl text-base leading-7 text-muted">{trader.bio}</p>
        <div className="num mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <span>
            <span className="font-bold text-ink">{trader.followers.length}</span> <span className="text-muted">followers</span>
          </span>
          <span>
            <span className="font-bold text-ink">{trader.following.length}</span> <span className="text-muted">following</span>
          </span>
        </div>
      </section>

      <section aria-labelledby="record-heading">
        <div className="flex items-end justify-between">
          <h2 id="record-heading" className="text-2xl font-bold tracking-[-0.02em]">
            📊 Person track record
          </h2>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          <Stat label="Profit %" value={formatReturn(trader.returnRatio ?? null)} tone={(trader.profit ?? 0) > 0 ? "yes" : (trader.profit ?? 0) < 0 ? "no" : undefined} hint={settled ? `${formatSignedNgn(trader.profit ?? 0)} total` : "No bets don end"} />
          <Stat label="How correct" value={formatAccuracy(trader.accuracy ?? null)} hint={`${wins} won · ${losses} lost`} />
          <Stat label="Bets done" value={String(settled)} hint="We get result" />
          <Stat label="Still running" value={String(trader.openCount ?? 0)} hint={`${formatNgn(trader.openStake ?? 0)} put down`} />
        </div>
        {settled ? (
          <div className="mt-4 rounded-3xl border border-line bg-panel p-5">
            <div className="flex items-center justify-between text-xs text-muted">
              <span className="text-yes font-semibold">✅ Won {wins}</span>
              <span className="text-no font-semibold">❌ Lost {losses}</span>
            </div>
            <div className="mt-2 flex h-3 overflow-hidden rounded-full bg-line">
              <div className="h-full bg-yes" style={{ width: `${(wins / settled) * 100}%` }} />
              <div className="h-full bg-no" style={{ width: `${(losses / settled) * 100}%` }} />
            </div>
            <p className="mt-3 text-xs text-faint">Na demo stats, not real life.</p>
          </div>
        ) : null}
      </section>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <section aria-labelledby="activity-heading">
          <Eyebrow>Recent activity</Eyebrow>
          <div className="mt-4 space-y-4">
            {positions.length ? (
              positions.map((p: any) => (
                <PositionItem
                  key={p.id}
                  position={p}
                  youId={data.you.id}
                  following={youFollow.has(p.trader.id)}
                />
              ))
            ) : (
              <EmptyState title="No bets yet" body="This person never put any bet." />
            )}
          </div>
        </section>

        <div className="space-y-10">
          <PeopleList title="People them follow" people={following} youFollow={youFollow} empty="Them never follow anybody." />
          <PeopleList title="People wey follow them" people={followers} youFollow={youFollow} empty="Nobody follow them yet." />
        </div>
      </div>
      {isYou ? <p className="text-xs text-faint">🎮 Na demo profile. Everything fake, just play.</p> : null}
    </div>
  );
}

function PeopleList({
  title,
  people,
  youFollow,
  empty,
}: {
  title: string;
  people: Trader[];
  youFollow: Set<string>;
  empty: string;
}) {
  const data = getData();
  return (
    <section>
      <div className="flex items-center justify-between">
        <Eyebrow>{title}</Eyebrow>
        <span className="num text-xs text-muted">{people.length}</span>
      </div>
      <div className="mt-4 space-y-3">
        {people.length ? (
          people.map((t) => (
            <TraderRow key={t.id} trader={t} youId={data.you.id} following={youFollow.has(t.id)} />
          ))
        ) : (
          <p className="text-sm text-muted">{empty}</p>
        )}
      </div>
    </section>
  );
}

function Stat({ label, value, hint, tone }: { label: string; value: string; hint: string; tone?: "yes" | "no" }) {
  return (
    <div className="rounded-2xl border border-line bg-panel p-4 md:p-5">
      <p className="text-xs font-medium text-muted">{label}</p>
      <p
        className={cn(
          "num mt-2 text-2xl font-bold tracking-[-0.02em] md:text-3xl",
          tone === "yes" && "text-yes",
          tone === "no" && "text-no",
        )}
      >
        {value}
      </p>
      <p className="num mt-1 text-xs leading-5 text-faint">{hint}</p>
    </div>
  );
}
