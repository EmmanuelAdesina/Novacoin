import Link from "next/link";
import { notFound } from "next/navigation";
import { FollowButton, OnboardingForm, ShareButton } from "@/components/widgets";
import { Avatar, DemoChip, Kicker, Money, StandingParts, Stat, When, moneyTone } from "@/components/ui";
import { getCircuit, personByHandle } from "@/lib/circuit";
import {
  COPY,
  categoryLabel,
  formatAccuracy,
  formatPct,
  formatSignedNgn,
  itemKindLabel,
} from "@/lib/format";

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const circuit = await getCircuit();
  const person = personByHandle(circuit, handle);
  return { title: person ? person.displayName : "Record" };
}

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ retune?: string }>;
}) {
  const { handle } = await params;
  const sp = await searchParams;
  const circuit = await getCircuit();
  const person = personByHandle(circuit, handle);
  if (!person) notFound();
  const you = circuit.you;
  const activity = circuit.activity.filter((a) => a.userId === person.id).slice(0, 8);
  const seats = circuit.entries.filter((e) => e.userId === person.id);
  const held = circuit.items.filter((item) => person.holdingIds.includes(item.id));
  const followers = person.followerHandles
    .map((id) => circuit.people.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const following = person.followingHandles
    .map((id) => circuit.people.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Avatar initials={person.initials} hue={person.hue} size={64} />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <DemoChip>{person.isYou ? "Your demo seat" : "Demonstration profile"}</DemoChip>
              <span className="text-[11px] uppercase tracking-[0.14em] text-muted">{person.level}</span>
            </div>
            <h1 className="mt-2 font-serif text-4xl tracking-[-0.04em] md:text-5xl">{person.displayName}</h1>
            <p className="mt-1 text-sm text-muted">
              {person.city}, {person.country} · {person.style}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {person.isYou ? null : <FollowButton handle={person.handle} following={you.followingHandles.includes(person.handle)} />}
          <ShareButton path={`/u/${person.handle}`} label="Copy record link" />
        </div>
      </div>
      <p className="mt-4 max-w-2xl text-sm leading-6">{person.bio}</p>
      <p className="mt-2 text-xs text-faint">{COPY.notVerified}</p>
      {!person.isYou && person.followers === 0 ? (
        <p className="mt-2 text-sm text-muted">No demonstration profile follows this record. Purse is not a following strategy.</p>
      ) : null}

      <section className="mt-8 grid gap-6 border-y border-ink py-5 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Settled calls" value={person.record.settled} hint={person.record.thin ? "Thin record" : "Demo calls"} />
        <Stat label="Accuracy" value={formatAccuracy(person.record.accuracy)} hint={`${person.record.correct} called`} />
        <Stat
          label="Realized P&L"
          value={<span className={moneyTone(person.record.pnl)}>{formatSignedNgn(person.record.pnl)}</span>}
          hint="Not withdrawable"
        />
        <Stat label="Return" value={formatPct(person.record.returnPct, 0)} hint="On settled stakes" />
      </section>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-2">
        <StandingParts parts={person.record.parts} score={person.record.score} />
        <div>
          <Kicker>By category</Kicker>
          {person.categories.length === 0 ? (
            <p className="mt-3 text-sm text-muted">No settled calls yet.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {person.categories.map((cat) => (
                <li key={cat.category}>
                  <div className="flex justify-between text-sm">
                    <span>{categoryLabel(cat.category)}</span>
                    <span className="num">
                      {formatAccuracy(cat.accuracy)} · {cat.settled}
                    </span>
                  </div>
                  <div className="mt-1 h-1 bg-mist">
                    <div className="h-1 bg-forest" style={{ width: `${Math.round((cat.accuracy ?? 0) * 100)}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {!person.isYou ? (
        <section className="mt-8 border border-line bg-paper p-4">
          <Kicker>Compare</Kicker>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <CompareCol label="You" accuracy={you.record.accuracy} ret={you.record.returnPct} score={you.record.score} settled={you.record.settled} />
            <CompareCol
              label={person.displayName.split(" ")[0] ?? person.displayName}
              accuracy={person.record.accuracy}
              ret={person.record.returnPct}
              score={person.record.score}
              settled={person.record.settled}
            />
          </div>
          <p className="mt-3 text-xs text-muted">
            Compare is open in this demo so it can be tested. The compare lens mark is earned by following five records.
          </p>
        </section>
      ) : null}

      <section className="mt-8 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="font-serif text-2xl">Rooms</h2>
          {seats.length === 0 ? (
            <p className="mt-2 text-sm text-muted">No seats.</p>
          ) : (
            <ul className="mt-2 divide-y divide-line border-y border-line">
              {seats.map((seat) => (
                <li key={seat.competitionId} className="py-3 text-sm">
                  <Link href={`/compete/${seat.competitionId}`} className="font-medium hover:underline">
                    {seat.title}
                  </Link>
                  <p className="text-muted">
                    {seat.score === null ? "Entered" : `Score ${seat.score}`} · {seat.points} points · {seat.status}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h2 className="font-serif text-2xl">Marks</h2>
          {held.length === 0 ? (
            <p className="mt-2 text-sm text-muted">No marks yet.</p>
          ) : (
            <ul className="mt-2 divide-y divide-line border-y border-line">
              {held.map((item) => (
                <li key={item.id} className="py-3">
                  <Link href={`/passes#${item.id}`} className="font-medium hover:underline">
                    {item.name}
                  </Link>
                  <p className="text-sm text-muted">
                    {itemKindLabel(item.kind)} · {item.utility}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="mt-8 grid gap-8 lg:grid-cols-2">
        <PeopleList title={`${person.followers} followers`} people={followers} empty="Nobody follows this record yet." />
        <PeopleList title={`${person.following} following`} people={following} empty="Not following anyone." />
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-2xl">Recent activity</h2>
        <ul className="mt-2 divide-y divide-line border-y border-line">
          {activity.map((item) => (
            <li key={item.id} className="py-3 text-sm">
              <span className="font-medium">{item.title}</span>
              {item.href && item.body ? (
                <Link href={item.href} className="block text-muted hover:underline">
                  {item.body}
                </Link>
              ) : null}
              <span className="text-xs text-faint">
                <When value={item.createdAt} />
              </span>
            </li>
          ))}
        </ul>
      </section>

      {person.isYou ? (
        <section className="mt-10 border-t border-line pt-6">
          <div className="mb-4 flex flex-wrap gap-4 text-sm">
            <Link href="/desk" className="underline">
              Desk
            </Link>
            <Link href="/passes" className="underline">
              Passes
            </Link>
            <span className="text-muted">
              Demo purse <Money value={person.purse} /> · not a rank
            </span>
          </div>
          {sp.retune === "1" ? (
            <OnboardingForm name={you.displayName} city={you.city} interests={you.interests} preview={[]} />
          ) : (
            <Link href="/u/you?retune=1" className="text-sm underline">
              Retune interests or demo name
            </Link>
          )}
        </section>
      ) : null}
    </div>
  );
}

function CompareCol({
  label,
  accuracy,
  ret,
  score,
  settled,
}: {
  label: string;
  accuracy: number | null;
  ret: number | null;
  score: number | null;
  settled: number;
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className="mt-1 font-serif text-3xl num">{score === null ? "—" : score.toFixed(1)}</p>
      <p className="text-sm text-muted">
        {formatAccuracy(accuracy)} accuracy · {formatPct(ret, 0)} return · {settled} settled
      </p>
    </div>
  );
}

function PeopleList({
  title,
  people,
  empty,
}: {
  title: string;
  people: Array<{ handle: string; displayName: string; city: string; initials: string; hue: string }>;
  empty: string;
}) {
  return (
    <div>
      <h2 className="font-serif text-2xl">{title}</h2>
      {people.length === 0 ? (
        <p className="mt-2 text-sm text-muted">{empty}</p>
      ) : (
        <ul className="mt-2 divide-y divide-line border-y border-line">
          {people.map((person) => (
            <li key={person.handle} className="flex items-center gap-3 py-2">
              <Avatar initials={person.initials} hue={person.hue} size={28} />
              <Link href={`/u/${person.handle}`} className="text-sm hover:underline">
                {person.displayName}
                <span className="text-muted"> · {person.city}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
