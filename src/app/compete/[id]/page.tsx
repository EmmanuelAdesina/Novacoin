import Link from "next/link";
import { notFound } from "next/navigation";
import { JoinButton, ShareButton } from "@/components/widgets";
import { Avatar, DemoChip, Kicker, RewardMark, RuleList, StatusMark, When } from "@/components/ui";
import { getCircuit } from "@/lib/circuit";
import { categoryLabel, rewardDetail } from "@/lib/format";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const circuit = await getCircuit();
  const room = circuit.rooms.find((r) => r.id === id);
  return { title: room?.title ?? "Room" };
}

export default async function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const circuit = await getCircuit();
  const room = circuit.rooms.find((r) => r.id === id);
  if (!room) notFound();
  const joined = room.standings.some((s) => s.isYou);
  const locked = room.requiresItemId && !circuit.you.holdingIds.includes(room.requiresItemId);

  return (
    <div>
      <p className="text-sm text-muted">
        <Link href="/compete" className="hover:underline">
          Compete
        </Link>{" "}
        / {room.title}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <RewardMark type={room.rewardType} />
        <StatusMark status={room.status} />
        <span className="text-[11px] uppercase tracking-[0.14em] text-muted">{categoryLabel(room.category)}</span>
        {room.sponsorName ? <DemoChip>{room.sponsorName} · fictional sponsor</DemoChip> : <DemoChip>No sponsor</DemoChip>}
      </div>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <h1 className="max-w-3xl font-serif text-4xl tracking-[-0.04em] md:text-5xl">{room.title}</h1>
        <ShareButton path={`/compete/${room.id}`} label="Copy room link" />
      </div>
      <p className="mt-4 max-w-2xl text-base leading-7">{room.summary}</p>
      <p className="mt-3 text-sm text-muted">
        {room.entrants}
        {room.spots ? ` of ${room.spots}` : ""} demonstration seats ·{" "}
        {room.status === "upcoming" ? "Starts" : room.status === "closed" ? "Ended" : "Ends"} <When value={room.status === "upcoming" ? room.startsAt : room.endsAt} />
      </p>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-clay-ink">{rewardDetail(room.rewardType)}</p>

      <div id="seat" className="mt-6">
        {locked && !joined ? (
          <div className="border border-line bg-paper p-4">
            <p className="text-sm leading-6">
              This room asks for a Season seat. The seat unlocks the room, a briefing, and a crest. It does not pay yield
              and it is not priced for checkout here.
            </p>
            <Link href="/passes#season-seat" className="mt-3 inline-block text-sm underline">
              Claim a demonstration seat
            </Link>
          </div>
        ) : (
          <JoinButton competitionId={room.id} joined={joined} closed={room.status === "closed"} />
        )}
      </div>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(260px,0.9fr)]">
        <RuleList
          items={[
            { label: "Rules", body: room.rules },
            { label: "Eligibility", body: room.eligibility },
            { label: "Scoring", body: room.scoring },
            { label: "Reward source", body: room.rewardSource },
            { label: "Prize", body: room.prizeSummary },
          ]}
        />
        <section>
          <Kicker>Demonstration sheet</Kicker>
          <h2 className="mt-2 font-serif text-2xl">Seats</h2>
          <p className="mt-1 text-xs leading-5 text-muted">
            Scores on other profiles are scripted so the room is not empty. Your seat is real inside the demo and is not
            auto-scored when a call resolves.
          </p>
          {room.standings.length === 0 ? (
            <p className="mt-4 text-sm text-muted">No seats yet.</p>
          ) : (
            <ol className="mt-3 divide-y divide-line border-y border-line">
              {room.standings.map((seat, index) => (
                <li key={seat.handle} className="flex items-center justify-between gap-3 py-3">
                  <span className="flex items-center gap-3">
                    <span className="w-6 font-serif text-xl num">{index + 1}</span>
                    <Avatar initials={seat.initials} hue={seat.hue} size={32} />
                    <Link href={`/u/${seat.handle}`} className="text-sm font-medium hover:underline">
                      {seat.displayName}
                      {seat.isYou ? " · you" : ""}
                    </Link>
                  </span>
                  <span className="text-right text-sm">
                    <span className="block num">{seat.score === null ? "Entered" : seat.score}</span>
                    <span className="text-xs text-muted">{seat.points} pts</span>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}
