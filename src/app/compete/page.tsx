import Link from "next/link";
import { JoinButton } from "@/components/widgets";
import { DemoChip, Kicker, RewardMark, StatusMark, When } from "@/components/ui";
import { getCircuit } from "@/lib/circuit";
import { rewardDetail } from "@/lib/format";

export const metadata = { title: "Compete" };

export default async function CompetePage() {
  const circuit = await getCircuit();
  const featured = circuit.rooms.find((r) => r.featured) ?? circuit.rooms[0];
  const rest = circuit.rooms.filter((r) => r.id !== featured?.id && r.status !== "closed");
  const finished = circuit.rooms.filter((r) => r.status === "closed");
  const youHold = new Set(circuit.you.holdingIds);

  return (
    <div>
      <Kicker>Compete</Kicker>
      <h1 className="mt-3 max-w-3xl font-serif text-4xl tracking-[-0.04em] md:text-5xl">Rooms with rules, not a second casino.</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
        A room is not a call. Contest prizes come from a disclosed fictional sponsor. Recognition rooms pay standing.
        Guaranteed means every finisher receives the stated mark — still not cash. Speculative gains live on Calls.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          ["Contest prize", "Top finishers only. Illustrated money. Not taken from other players."],
          ["Guaranteed recognition", "Every finisher gets the mark. Not a stipend."],
          ["Recognition only", "Points, a ribbon, a line. No purse."],
        ].map(([title, body]) => (
          <div key={title} className="border-t border-ink pt-3">
            <p className="text-sm font-medium">{title}</p>
            <p className="mt-1 text-sm leading-6 text-muted">{body}</p>
          </div>
        ))}
      </div>

      {featured ? (
        <article className="mt-8 bg-forest px-5 py-6 text-[#f6f1e7] md:px-8 md:py-8">
          <div className="flex flex-wrap items-center gap-2 text-[#e7d3a8]">
            <span className="text-[11px] uppercase tracking-[0.16em]">Featured room</span>
            <DemoChip>Fictional sponsor</DemoChip>
          </div>
          <h2 className="mt-3 font-serif text-4xl tracking-[-0.03em] md:text-5xl">{featured.title}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#e7e1d8]">{featured.summary}</p>
          <p className="mt-3 max-w-2xl text-sm leading-6">{featured.prizeSummary}</p>
          <p className="mt-2 text-xs text-[#e7d3a8]">
            Source: {featured.rewardSource}. Closes <When value={featured.endsAt} />.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href={`/compete/${featured.id}`} className="bg-[#f6f1e7] px-4 py-2.5 text-sm text-forest">
              Read the room
            </Link>
            <span className="text-sm text-[#e7e1d8]">
              {featured.entrants}
              {featured.spots ? ` of ${featured.spots}` : ""} demonstration seats
            </span>
          </div>
        </article>
      ) : null}

      <ul className="mt-8 divide-y divide-line border-y border-line">
        {rest.map((room) => {
          const joined = room.standings.some((s) => s.isYou);
          const locked = room.requiresItemId && !youHold.has(room.requiresItemId) ? "Needs a Season seat" : undefined;
          return (
            <li key={room.id} className="grid gap-4 py-5 md:grid-cols-[1fr_180px] md:items-start">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <RewardMark type={room.rewardType} />
                  <StatusMark status={room.status} />
                  {room.sponsorName ? <DemoChip>{room.sponsorName} · fictional</DemoChip> : null}
                </div>
                <Link href={`/compete/${room.id}`} className="mt-2 block font-serif text-3xl tracking-[-0.03em] hover:underline">
                  {room.title}
                </Link>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{room.summary}</p>
                <p className="mt-2 text-xs text-faint">{rewardDetail(room.rewardType)}</p>
                <p className="mt-1 text-xs text-muted">
                  {room.entrants} seated · ends <When value={room.endsAt} />
                </p>
              </div>
              <JoinButton competitionId={room.id} joined={joined} locked={locked} />
            </li>
          );
        })}
      </ul>

      {finished.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-serif text-2xl">Finished</h2>
          <ul className="mt-3 divide-y divide-line border-y border-line">
            {finished.map((room) => (
              <li key={room.id} className="py-3">
                <Link href={`/compete/${room.id}`} className="font-medium hover:underline">
                  {room.title}
                </Link>
                <p className="text-sm text-muted">{room.prizeSummary}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
