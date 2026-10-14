import Link from "next/link";
import { FollowButton, JoinButton, OnboardingForm } from "@/components/widgets";
import { Avatar, CategoryMark, DemoChip, Kicker, Money, Notice, PriceBar, RewardMark, When, btnForest, btnGhost } from "@/components/ui";
import { getCircuit } from "@/lib/circuit";
import { categoryLabel, formatAccuracy, formatPrice, formatWhen, rewardDetail } from "@/lib/format";

export const metadata = { title: "Now" };

function headline(interests: string[]) {
  const named = interests.filter((id) => id !== "competitions");
  if (interests.length === 1 && interests[0] === "competitions") return "Rooms worth a seat this week.";
  if (named.length === 1) return `What's moving in ${categoryLabel(named[0]).toLowerCase()}.`;
  if (named.length > 1) return `Tuned to ${named.slice(0, 2).map((id) => categoryLabel(id).toLowerCase()).join(" and ")}.`;
  return "What's worth calling before it closes.";
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ tuned?: string; retune?: string }>;
}) {
  const sp = await searchParams;
  const circuit = await getCircuit();
  const you = circuit.you;
  const open = circuit.markets.filter((m) => m.open);

  if (!you.onboarded || sp.retune === "1") {
    return (
      <OnboardingForm
        name={you.displayName}
        city={you.city}
        interests={you.interests}
        preview={open.slice(0, 6).map((m) => ({
          id: m.id,
          question: m.question,
          category: m.category,
          when: formatWhen(m.closesAt),
        }))}
      />
    );
  }

  const topicInterests = you.interests.filter((id) => id !== "competitions");
  const ranked = open
    .map((m) => ({
      m,
      score:
        (topicInterests.includes(m.category) ? 100 : 0) +
        (m.featured ? 8 : 0) -
        new Date(m.closesAt).getTime() / 1e13,
    }))
    .sort((a, b) => b.score - a.score);
  const hero = ranked[0]?.m ?? open[0];
  const clock = open
    .filter((m) => m.id !== hero?.id)
    .sort((a, b) => new Date(a.closesAt).getTime() - new Date(b.closesAt).getTime())
    .slice(0, 6);
  const rooms = circuit.rooms
    .filter((r) => r.status !== "closed")
    .sort((a, b) => {
      const score = (room: typeof a) =>
        (you.interests.includes(room.category) ? 2 : 0) + (you.interests.includes("competitions") && room.featured ? 2 : 0) + (room.featured ? 1 : 0);
      return score(b) - score(a);
    })
    .slice(0, 3);
  const followed = new Set(you.followingHandles);
  const fromFollows = circuit.activity.filter((a) => followed.has(a.handle) && a.kind === "call").slice(0, 4);
  const people = circuit.people
    .filter((p) => !p.isYou && !followed.has(p.handle))
    .sort((a, b) => {
      const am = topicInterests.includes(a.bestCategory ?? "") ? 1 : 0;
      const bm = topicInterests.includes(b.bestCategory ?? "") ? 1 : 0;
      return bm - am || (b.record.score ?? 0) - (a.record.score ?? 0);
    })
    .slice(0, 4);
  const moves = circuit.activity.filter((a) => a.kind !== "follow").slice(0, 6);
  const lockedPass = circuit.items.find((item) => !you.holdingIds.includes(item.id));
  const yourOpen = circuit.positions.filter((p) => p.userId === you.id && !p.settled);
  const yourSeats = circuit.entries.filter((e) => e.userId === you.id && e.status !== "closed");
  const hasSeat = you.holdingIds.includes("season-seat");
  const lead = hero?.outcomes.slice().sort((a, b) => b.priceBps - a.priceBps)[0];

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div>
        <Kicker>Now · demonstration clock</Kicker>
        <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-[1.02] tracking-[-0.04em] md:text-6xl">
          {headline(you.interests)}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
          Calls can lose a demo stake. Rooms pay from a disclosed prize, or they pay nothing but standing.{" "}
          {topicInterests.length
            ? `The clock below is still the whole circuit — time does not care that you tuned to ${topicInterests.map((id) => categoryLabel(id).toLowerCase()).join(", ")}.`
            : "The clock is the whole circuit. Tune it from your record if you want a point of view."}
        </p>
        {sp.tuned === "1" ? (
          <div className="mt-4">
            <Notice>
              Tuned{you.interests.length ? ` to ${you.interests.map((id) => categoryLabel(id).toLowerCase()).join(", ")}` : ""}.
              Change it any time on your record.
            </Notice>
          </div>
        ) : null}

        {hero && lead ? (
          <article className="mt-8 border-t border-ink pt-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-serif text-sm text-clay-ink">01</span>
              <CategoryMark id={hero.category} />
              <DemoChip>Demonstration</DemoChip>
              <span className="text-sm text-muted">
                Closes <When value={hero.closesAt} />
              </span>
            </div>
            <h2 className="mt-3 max-w-3xl font-serif text-3xl leading-[1.08] tracking-[-0.03em] md:text-4xl">
              <Link href={`/calls/${hero.id}`} className="hover:underline">
                {hero.question}
              </Link>
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{hero.summary}</p>
            <div className="mt-5 grid gap-6 md:grid-cols-[180px_1fr] md:items-end">
              <div>
                <p className="text-[11px] uppercase tracking-[0.14em] text-muted">{lead.label} · illustrative</p>
                <p className="font-serif text-6xl leading-none tracking-[-0.04em] num">{formatPrice(lead.priceBps)}</p>
              </div>
              <div className="space-y-2">
                {hero.outcomes.map((o) => (
                  <PriceBar key={o.id} label={o.label} bps={o.priceBps} emphasis={o.id === lead.id} />
                ))}
              </div>
            </div>
            <p className="mt-4 text-sm text-muted">
              {hero.readerCount} demonstration readers · <Money value={hero.committed} /> committed in the demo · not live liquidity
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href={`/calls/${hero.id}#call`} className={btnForest}>
                Make a call
              </Link>
              <Link href={`/calls/${hero.id}`} className={btnGhost}>
                Read the rule
              </Link>
            </div>
          </article>
        ) : (
          <p className="mt-8 text-sm">Nothing is open on the demonstration clock.</p>
        )}

        <section className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-serif text-2xl tracking-[-0.03em]">Closing soon</h2>
            <Link href="/calls" className="text-sm text-muted hover:text-ink">
              All calls
            </Link>
          </div>
          <div className="clock-row mt-3 border-y border-line">
            {clock.map((m, index) => {
              const top = m.outcomes.slice().sort((a, b) => b.priceBps - a.priceBps)[0];
              return (
                <Link
                  key={m.id}
                  href={`/calls/${m.id}`}
                  className="min-w-[230px] border-r border-line px-4 py-4 last:border-r-0 hover:bg-paper"
                >
                  <span className="flex items-center justify-between text-[11px] uppercase tracking-[0.14em] text-muted">
                    <span>0{index + 2}</span>
                    <When value={m.closesAt} />
                  </span>
                  <span className="mt-2 block font-serif text-lg leading-snug tracking-[-0.03em]">{m.question}</span>
                  <span className="mt-3 flex items-center justify-between text-sm">
                    <CategoryMark id={m.category} />
                    <span className="num">{top ? formatPrice(top.priceBps) : ""}</span>
                  </span>
                </Link>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-faint lg:hidden">Swipe the clock.</p>
        </section>

        <section className="mt-10 grid gap-8 md:grid-cols-2">
          <div>
            <div className="flex items-end justify-between">
              <h2 className="font-serif text-2xl tracking-[-0.03em]">Rooms</h2>
              <Link href="/compete" className="text-sm text-muted hover:text-ink">
                All rooms
              </Link>
            </div>
            <ul className="mt-3 divide-y divide-line border-y border-line">
              {rooms.map((room) => {
                const joined = room.standings.some((s) => s.isYou);
                const locked = room.requiresItemId && !you.holdingIds.includes(room.requiresItemId);
                return (
                  <li key={room.id} className="py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <RewardMark type={room.rewardType} />
                      {room.sponsorName ? <DemoChip>Fictional sponsor</DemoChip> : null}
                    </div>
                    <Link href={`/compete/${room.id}`} className="mt-2 block font-serif text-2xl tracking-[-0.03em] hover:underline">
                      {room.title}
                    </Link>
                    <p className="mt-1 text-sm leading-6 text-muted">{room.summary}</p>
                    <p className="mt-2 text-xs text-faint">{rewardDetail(room.rewardType)}</p>
                    <div className="mt-3">
                      <JoinButton
                        competitionId={room.id}
                        joined={joined}
                        locked={locked ? "Needs a Season seat" : undefined}
                        closed={room.status === "closed"}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          <div>
            <h2 className="font-serif text-2xl tracking-[-0.03em]">From people you follow</h2>
            <p className="mt-1 text-sm text-muted">Sabi does not copy a call for you. Read it, then decide.</p>
            {fromFollows.length === 0 ? (
              <p className="mt-4 border border-dashed border-line px-4 py-6 text-sm leading-6 text-muted">
                Follow a record to see how they call it. That is the social layer — not a post feed.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-line border-y border-line">
                {fromFollows.map((move) => (
                  <li key={move.id} className="py-3">
                    <Link href={`/u/${move.handle}`} className="text-sm font-medium hover:underline">
                      {move.displayName}
                    </Link>
                    <p className="text-sm">{move.title}</p>
                    {move.href ? (
                      <Link href={move.href} className="text-sm text-muted hover:text-ink">
                        {move.body}
                      </Link>
                    ) : null}
                    <p className="mt-1 text-xs text-faint">
                      <When value={move.createdAt} />
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-serif text-2xl tracking-[-0.03em]">Moves on the circuit</h2>
          <ul className="mt-3 divide-y divide-line border-y border-line">
            {moves.map((move) => (
              <li key={move.id} className="grid gap-2 py-3 sm:grid-cols-[1fr_auto] sm:items-baseline">
                <p className="text-sm leading-6">
                  <Link href={`/u/${move.handle}`} className="font-medium hover:underline">
                    {move.displayName}
                  </Link>{" "}
                  <span className="text-muted">{move.title}.</span>{" "}
                  {move.href && move.body ? (
                    <Link href={move.href} className="hover:underline">
                      {move.body}
                    </Link>
                  ) : null}
                </p>
                <span className="text-xs text-faint">
                  <When value={move.createdAt} />
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10">
          <div className="flex items-end justify-between">
            <h2 className="font-serif text-2xl tracking-[-0.03em]">Records worth opening</h2>
            <Link href="/board" className="text-sm text-muted hover:text-ink">
              Full board
            </Link>
          </div>
          <ul className="mt-3 divide-y divide-line border-y border-line">
            {people.map((person) => (
              <li key={person.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <Link href={`/u/${person.handle}`} className="flex min-w-0 items-center gap-3">
                  <Avatar initials={person.initials} hue={person.hue} />
                  <span>
                    <span className="block font-medium">{person.displayName}</span>
                    <span className="block text-xs text-muted">
                      {person.city} · {person.style} · {formatAccuracy(person.record.accuracy)} on {person.record.settled} demo calls
                    </span>
                  </span>
                </Link>
                <FollowButton handle={person.handle} following={false} compact />
              </li>
            ))}
          </ul>
        </section>

        {lockedPass ? (
          <section className="mt-10 border border-line bg-paper p-5">
            <Kicker>Access, not a collectible</Kicker>
            <h2 className="mt-2 font-serif text-3xl tracking-[-0.03em]">{lockedPass.name}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6">{lockedPass.utility}</p>
            <Link href={`/passes#${lockedPass.id}`} className={`${btnGhost} mt-4`}>
              See what it unlocks
            </Link>
          </section>
        ) : null}
      </div>

      <aside className="space-y-6 lg:sticky lg:top-28">
        <section className="border border-line bg-paper p-4">
          <Kicker>Your desk</Kicker>
          <p className="mt-2 font-serif text-4xl tracking-[-0.04em]">
            <Money value={you.purse} />
          </p>
          <p className="mt-1 text-xs text-muted">Demo purse. Cannot be withdrawn, transferred, or ranked.</p>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Open calls</dt>
              <dd className="num">{yourOpen.length}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Open seats</dt>
              <dd className="num">{yourSeats.length}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Standing</dt>
              <dd className="num">{you.record.score === null ? "Unranked" : you.record.score.toFixed(1)}</dd>
            </div>
          </dl>
          <Link href="/desk" className={`${btnGhost} mt-4 w-full`}>
            Open desk
          </Link>
        </section>
        <section className="border border-line p-4">
          <Kicker>{hasSeat ? "Circuit briefing" : "Briefing locked"}</Kicker>
          {hasSeat ? (
            <div className="mt-2 text-sm leading-6">
              <p>
                Football closes first. The Super Eagles price is a named-reader price, not a crowd. The policy hold is the
                base case, and 66% is expensive if that is all you believe. Lagos After Dark is a four-way — a loud thesis
                is not a probability.
              </p>
              <p className="mt-2 text-xs text-muted">Demonstration note. No live data entered this briefing.</p>
            </div>
          ) : (
            <p className="mt-2 text-sm leading-6 text-muted">
              A season seat unlocks a weekly briefing and High Table. It is access, not a coin, and it is not for sale in
              this demo.
            </p>
          )}
        </section>
        <section className="text-sm leading-6 text-muted">
          <p className="text-ink">Standing is not your balance.</p>
          <p className="mt-1">
            The board ranks accuracy, recent form, rooms, and capped return. Ibrahim can lead with a smaller purse than
            Daniel. That is the hypothesis worth testing.
          </p>
          <Link href="/board" className="mt-2 inline-block text-ink underline">
            Read the method
          </Link>
          <Link href="/?retune=1" className="mt-1 block text-ink underline">
            Retune interests
          </Link>
        </section>
      </aside>
    </div>
  );
}
