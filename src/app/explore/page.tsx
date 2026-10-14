import Link from "next/link";
import { FollowButton } from "@/components/widgets";
import { CategoryMark, DemoChip, EmptyState, Highlight, Kicker, RewardMark, When } from "@/components/ui";
import { getCircuit } from "@/lib/circuit";
import { CATEGORIES, categoryLabel, formatAccuracy, formatPrice } from "@/lib/format";

export const metadata = { title: "Explore" };

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const category = sp.category ?? "all";
  const circuit = await getCircuit();
  const needle = q.toLowerCase();
  const cat = (value: string) => category === "all" || value === category;

  const markets = circuit.markets.filter((m) => {
    if (!cat(m.category)) return false;
    if (!needle) return m.open || m.featured;
    return `${m.question} ${m.summary} ${m.category}`.toLowerCase().includes(needle);
  });
  const rooms = circuit.rooms.filter((r) => {
    if (!cat(r.category) && category !== "all") return false;
    if (category !== "all" && r.category === "mixed") return false;
    if (!needle) return r.status !== "closed";
    return `${r.title} ${r.summary} ${r.sponsorName ?? ""} ${r.prizeSummary}`.toLowerCase().includes(needle);
  });
  const people = circuit.people.filter((p) => {
    if (p.isYou) return false;
    const blob = `${p.displayName} ${p.handle} ${p.city} ${p.country} ${p.style} ${p.bestCategory ?? ""}`.toLowerCase();
    if (needle && !blob.includes(needle)) return false;
    if (category !== "all" && p.bestCategory !== category && !blob.includes(category)) return false;
    return true;
  });

  const chips = [{ id: "all", label: "All" }, ...CATEGORIES];

  return (
    <div>
      <Kicker>Explore</Kicker>
      <h1 className="mt-3 max-w-3xl font-serif text-4xl tracking-[-0.04em] md:text-5xl">Find a call, a room, or a record.</h1>
      <form action="/explore" className="mt-6 flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="explore-q">
          Search
        </label>
        <input
          id="explore-q"
          name="q"
          defaultValue={q}
          placeholder="Super Eagles, Campus, Ibrahim, rate…"
          className="w-full bg-paper px-3 py-3 text-base"
        />
        {category !== "all" ? <input type="hidden" name="category" value={category} /> : null}
        <button className="border border-ink bg-ink px-4 py-3 text-sm text-[#f6f1e7]" type="submit">
          Search
        </button>
      </form>
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {chips.map((chip) => {
          const on = category === chip.id;
          const href = `/explore?category=${chip.id}${q ? `&q=${encodeURIComponent(q)}` : ""}`;
          return (
            <Link
              key={chip.id}
              href={href}
              aria-current={on ? "page" : undefined}
              className={on ? "shrink-0 bg-forest px-3 py-1.5 text-sm text-[#f6f1e7]" : "shrink-0 border border-line bg-paper px-3 py-1.5 text-sm"}
            >
              {chip.label}
            </Link>
          );
        })}
      </div>
      <p className="mt-4 text-sm text-muted">
        {markets.length} calls · {rooms.length} rooms · {people.length} people
        {q ? ` matching “${q}”` : ""}. Demonstration data.
      </p>

      {markets.length + rooms.length + people.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Nothing matches."
            body="Try a club, a city, a room, or a category. The circuit is small on purpose — every reader is named."
            href="/calls"
            action="Browse open calls"
          />
        </div>
      ) : null}

      {markets.length > 0 ? (
        <section className="mt-8">
          <h2 className="font-serif text-2xl">Calls</h2>
          <ul className="mt-2 divide-y divide-line border-y border-line">
            {markets.slice(0, 12).map((m) => {
              const top = m.outcomes.slice().sort((a, b) => b.priceBps - a.priceBps)[0];
              return (
                <li key={m.id}>
                  <Link href={`/calls/${m.id}`} className="grid gap-2 py-3 sm:grid-cols-[1fr_auto] sm:items-baseline">
                    <span>
                      <span className="flex flex-wrap items-center gap-2">
                        <CategoryMark id={m.category} />
                        {m.resolvedLabel ? <DemoChip>Resolved {m.resolvedLabel}</DemoChip> : <DemoChip>Demo</DemoChip>}
                      </span>
                      <span className="mt-1 block font-serif text-xl leading-snug">
                        <Highlight text={m.question} query={q} />
                      </span>
                    </span>
                    <span className="text-sm text-muted">
                      {m.open ? (
                        <>
                          <When value={m.closesAt} /> · {top ? formatPrice(top.priceBps) : ""}
                        </>
                      ) : (
                        "Settled"
                      )}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {rooms.length > 0 ? (
        <section className="mt-8">
          <h2 className="font-serif text-2xl">Rooms</h2>
          <ul className="mt-2 divide-y divide-line border-y border-line">
            {rooms.map((room) => (
              <li key={room.id} className="py-3">
                <div className="flex flex-wrap gap-2">
                  <RewardMark type={room.rewardType} />
                  <span className="text-xs uppercase tracking-[0.12em] text-muted">{categoryLabel(room.category)}</span>
                </div>
                <Link href={`/compete/${room.id}`} className="mt-1 block font-serif text-2xl hover:underline">
                  <Highlight text={room.title} query={q} />
                </Link>
                <p className="text-sm text-muted">{room.prizeSummary}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {people.length > 0 ? (
        <section className="mt-8">
          <h2 className="font-serif text-2xl">People</h2>
          <ul className="mt-2 divide-y divide-line border-y border-line">
            {people.slice(0, 10).map((person) => (
              <li key={person.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <Link href={`/u/${person.handle}`}>
                  <span className="block font-medium">
                    <Highlight text={person.displayName} query={q} />
                  </span>
                  <span className="block text-xs text-muted">
                    {person.city}, {person.country} · {person.style} · {formatAccuracy(person.record.accuracy)} · demo
                  </span>
                </Link>
                <FollowButton handle={person.handle} following={circuit.you.followingHandles.includes(person.handle)} compact />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
