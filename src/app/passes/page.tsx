import Link from "next/link";
import { ClaimSeatButton, ShareButton } from "@/components/widgets";
import { DemoChip, Kicker } from "@/components/ui";
import { progressFor, getCircuit } from "@/lib/circuit";
import { COPY, formatAccuracy, formatNgn, itemKindLabel } from "@/lib/format";

export const metadata = { title: "Passes" };

export default async function PassesPage() {
  const circuit = await getCircuit();
  const progress = progressFor(circuit);
  const held = new Map(circuit.holdings.filter((h) => h.userId === circuit.you.id).map((h) => [h.itemId, h]));

  return (
    <div>
      <Kicker>Passes · Circuit 01</Kicker>
      <h1 className="mt-3 max-w-3xl font-serif text-4xl tracking-[-0.04em] md:text-5xl">Access and marks. Not a shop.</h1>
      <p className="mt-3 max-w-2xl text-base leading-7">
        These are not collectibles to flip. Each one unlocks a defined use, or it is only a mark on a record. Nothing here
        can be resold, and nothing here is promised to rise in value.
      </p>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
        If this circuit earned money, the testable ideas are a season seat for rooms and a briefing, and disclosed
        sponsor rooms. Not a house edge that needs people to lose. {COPY.notAsset}
      </p>

      <ol className="mt-8 divide-y divide-line border-y border-line">
        {circuit.items.map((item, index) => {
          const mine = held.get(item.id);
          return (
            <li key={item.id} id={item.id} className="grid gap-4 py-6 md:grid-cols-[72px_1fr]">
              <span className="font-serif text-3xl text-clay-ink num">0{index + 1}</span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] uppercase tracking-[0.14em] text-muted">{itemKindLabel(item.kind)}</span>
                  {mine ? <DemoChip>Held</DemoChip> : <DemoChip>Not held</DemoChip>}
                </div>
                <h2 className="mt-1 font-serif text-3xl tracking-[-0.03em]">{item.name}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6">{item.utility}</p>
                <p className="mt-2 text-sm leading-6 text-muted">How it is earned: {item.howEarned}</p>
                {item.illustratedPriceNgn ? (
                  <p className="mt-2 text-sm">
                    Illustrated access price {formatNgn(item.illustratedPriceNgn)}. Not a checkout.
                  </p>
                ) : null}
                <p className="mt-2 text-xs text-faint">{item.boundary}</p>
                <div className="mt-3 text-sm">
                  {item.id === "readers-mark" && !mine ? (
                    <p>
                      Progress {progress.theses}/{progress.thesisTarget} theses.
                    </p>
                  ) : null}
                  {item.id === "compare-lens" && !mine ? (
                    <p>
                      Progress {progress.following}/{progress.followTarget} follows.{" "}
                      <Link href="/board" className="underline">
                        Find a record
                      </Link>
                    </p>
                  ) : null}
                  {item.id === "campus-lantern" && !mine ? (
                    <p>
                      {progress.campus ? "Seat recorded." : "No campus seat yet."}{" "}
                      <Link href="/compete/campus-circuit" className="underline">
                        Campus Circuit
                      </Link>
                    </p>
                  ) : null}
                  {item.id === "city-desk" && !mine ? (
                    <p>
                      Business record {progress.businessSettled}/{progress.businessTarget} settled
                      {progress.businessAccuracy !== null ? ` · ${formatAccuracy(progress.businessAccuracy)}` : ""}. Needs 60%.
                    </p>
                  ) : null}
                  {item.id === "season-seat" ? (
                    <div className="mt-2">
                      <ClaimSeatButton held={Boolean(mine)} />
                    </div>
                  ) : null}
                  {mine ? <p className="mt-2 text-muted">Source: {mine.source}.</p> : null}
                </div>
                <div className="mt-3">
                  <ShareButton path={`/passes#${item.id}`} label="Copy pass link" />
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
