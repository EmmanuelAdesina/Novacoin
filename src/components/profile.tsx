import Link from "next/link";
import { PositionItem, TraderRow } from "@/components/cards";
import { FollowButton } from "@/components/widgets";
import { Avatar, EmptyState, Eyebrow, btnGhost, cn } from "@/components/ui";
import type { Data, Trader } from "@/lib/data";
import { formatAccuracy, formatNgn, formatReturn, formatSignedNgn } from "@/lib/format";

export function ProfileView({ data, trader }: { data: Data; trader: Trader }) {
  const isYou = trader.id === data.you.id;
  const youFollow = new Set(data.you.following);
  const positions = data.positions.filter((p) => p.trader.id === trader.id).slice(0, 12);
  const following = data.traders.filter((t) => trader.following.includes(t.id));
  const followers = data.traders.filter((t) => trader.followers.includes(t.id));
  const wins = trader.wins;
  const losses = trader.settled - trader.wins;

  return (
    <div className="space-y-10">
      <section className="glow rounded-[28px] border border-line p-6 md:p-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex items-center gap-5">
            <Avatar initials={trader.initials} hue={trader.hue} size={84} />
            <div className="min-w-0">
              <h1 className="truncate text-3xl font-semibold tracking-[-0.03em] md:text-5xl">
                {isYou ? "Your profile" : trader.name}
              </h1>
              <p className="mt-1 text-sm text-muted">
                {isYou ? `${trader.name} · ` : ""}@{trader.handle} · {trader.city}, {trader.country}
              </p>
              <p className="mt-3 inline-flex rounded-full border border-line-2 px-3 py-1 text-xs font-medium text-muted">
                {trader.style}
              </p>
            </div>
          </div>
          {isYou ? (
            <Link href="/portfolio" className={btnGhost}>
              View portfolio
            </Link>
          ) : (
            <FollowButton handle={trader.handle} following={youFollow.has(trader.id)} size="large" />
          )}
        </div>
        <p className="mt-6 max-w-2xl text-base leading-7 text-muted">{trader.bio}</p>
        <div className="num mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <span>
            <span className="font-semibold text-ink">{trader.followers.length}</span> <span className="text-muted">followers</span>
          </span>
          <span>
            <span className="font-semibold text-ink">{trader.following.length}</span> <span className="text-muted">following</span>
          </span>
        </div>
      </section>

      <section aria-labelledby="record-heading">
        <div className="flex items-end justify-between">
          <h2 id="record-heading" className="text-2xl font-semibold tracking-[-0.02em]">
            Track record
          </h2>
          <span className="rounded-full border border-gold/40 bg-gold/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-gold">
            Demo record
          </span>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          <Stat label="Return" value={formatReturn(trader.returnRatio)} tone={trader.profit > 0 ? "yes" : trader.profit < 0 ? "no" : undefined} hint={trader.settled ? `${formatSignedNgn(trader.profit)} on ${formatNgn(trader.invested)} staked` : "Nothing settled yet"} />
          <Stat label="Accuracy" value={formatAccuracy(trader.accuracy)} hint={`${wins} won · ${losses} lost`} />
          <Stat label="Settled" value={String(trader.settled)} hint="Positions with a result" />
          <Stat label="Open" value={String(trader.openCount)} hint={`${formatNgn(trader.openStake)} at stake`} />
        </div>
        {trader.settled ? (
          <div className="mt-4 rounded-3xl border border-line bg-panel p-5">
            <div className="flex items-center justify-between text-xs text-muted">
              <span>Won {wins}</span>
              <span>Lost {losses}</span>
            </div>
            <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-line">
              <div className="h-full bg-yes" style={{ width: `${(wins / trader.settled) * 100}%` }} />
              <div className="h-full bg-no" style={{ width: `${(losses / trader.settled) * 100}%` }} />
            </div>
            <p className="mt-3 text-xs text-faint">Based on settled demo positions. Not a verified real-world record.</p>
          </div>
        ) : null}
        {!trader.ranked && trader.settled > 0 ? (
          <p className="mt-3 text-xs text-faint">Not on the leaderboard yet. Traders need 3 settled positions to rank.</p>
        ) : null}
      </section>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <section aria-labelledby="activity-heading">
          <Eyebrow>Recent activity</Eyebrow>
          <h2 id="activity-heading" className="sr-only">
            Recent activity
          </h2>
          <div className="mt-4 space-y-4">
            {positions.length ? (
              positions.map((p) => (
                <PositionItem
                  key={p.id}
                  position={p}
                  youId={data.you.id}
                  following={youFollow.has(p.trader.id)}
                />
              ))
            ) : (
              <EmptyState title="No positions yet" body="Recent positions will appear here." />
            )}
          </div>
        </section>

        <div className="space-y-10">
          <PeopleList title="Following" people={following} data={data} youFollow={youFollow} empty="Not following anyone yet." />
          <PeopleList title="Followers" people={followers} data={data} youFollow={youFollow} empty="No followers yet." />
        </div>
      </div>
      {isYou ? <p className="text-xs text-faint">This profile is part of the demo. Balances and records are simulated.</p> : null}
    </div>
  );
}

function PeopleList({
  title,
  people,
  data,
  youFollow,
  empty,
}: {
  title: string;
  people: Trader[];
  data: Data;
  youFollow: Set<string>;
  empty: string;
}) {
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
          "num mt-2 text-2xl font-semibold tracking-[-0.02em] md:text-3xl",
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

