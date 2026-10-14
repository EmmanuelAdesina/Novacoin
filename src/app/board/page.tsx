import Link from "next/link";
import { BoardList } from "@/components/widgets";
import { Kicker } from "@/components/ui";
import { rankBoard, getCircuit } from "@/lib/circuit";
import { CATEGORIES, formatAccuracy, formatPct } from "@/lib/format";
import { METHODOLOGY, type SortId, type WindowId } from "@/lib/metrics";

export const metadata = { title: "Board" };

const WINDOWS: Array<{ id: WindowId; label: string }> = [
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" },
  { id: "season", label: "Season" },
];
const SORTS: Array<{ id: SortId; label: string }> = [
  { id: "standing", label: "Standing" },
  { id: "return", label: "Return" },
  { id: "accuracy", label: "Accuracy" },
  { id: "recent", label: "Recent" },
];

export default async function BoardPage({
  searchParams,
}: {
  searchParams: Promise<{ window?: string; category?: string; sort?: string }>;
}) {
  const sp = await searchParams;
  const window: WindowId = sp.window === "7d" || sp.window === "30d" ? sp.window : "season";
  const sort: SortId = SORTS.some((s) => s.id === sp.sort) ? (sp.sort as SortId) : "standing";
  const category = CATEGORIES.some((c) => c.id === sp.category) ? sp.category! : "all";
  const circuit = await getCircuit();
  const board = rankBoard(circuit, window, category, sort, new Date(circuit.generatedAt).getTime());

  function href(next: { window?: string; category?: string; sort?: string }) {
    const params = new URLSearchParams();
    params.set("window", next.window ?? window);
    params.set("category", next.category ?? category);
    params.set("sort", next.sort ?? sort);
    return `/board?${params.toString()}`;
  }

  function row(entry: (typeof board.ranked)[number]) {
    const score =
      sort === "return"
        ? formatPct(entry.perf.returnPct, 0)
        : sort === "accuracy"
          ? formatAccuracy(entry.perf.accuracy)
          : sort === "recent"
            ? formatAccuracy(entry.perf.recentAccuracy)
            : entry.perf.score === null
              ? "—"
              : entry.perf.score.toFixed(1);
    return {
      rank: entry.rank,
      handle: entry.person.handle,
      displayName: entry.person.displayName,
      initials: entry.person.initials,
      hue: entry.person.hue,
      city: entry.person.city,
      style: entry.person.style,
      isYou: entry.person.isYou,
      score,
      accuracy: formatAccuracy(entry.perf.accuracy),
      ret: formatPct(entry.perf.returnPct, 0),
      recent: formatAccuracy(entry.perf.recentAccuracy),
      settled: entry.perf.settled,
      thin: entry.perf.thin,
      reason: entry.reason,
      parts: `Standing parts ${entry.perf.parts.accuracy}/${entry.perf.parts.recent}/${entry.perf.parts.rooms}/${entry.perf.parts.return}.`,
    };
  }

  return (
    <div>
      <Kicker>Board</Kicker>
      <h1 className="mt-3 max-w-3xl font-serif text-4xl tracking-[-0.04em] md:text-5xl">Standing, not wealth.</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
        Demo purse is not a column. A large London purse can sit below a Lagos student. Every figure is a demonstration
        record, not an independently verified result.
      </p>
      <details className="group mt-4 max-w-2xl">
        <summary className="cursor-pointer text-sm underline">How standing is calculated</summary>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-muted">
          {METHODOLOGY.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </details>

      <div className="mt-6 flex flex-wrap gap-2">
        {WINDOWS.map((item) => (
          <Link key={item.id} href={href({ window: item.id })} className={window === item.id ? "bg-ink px-3 py-1.5 text-sm text-[#f6f1e7]" : "border border-line px-3 py-1.5 text-sm"}>
            {item.label}
          </Link>
        ))}
      </div>
      <div className="mt-3 flex gap-2 overflow-x-auto">
        <Link href={href({ category: "all" })} className={category === "all" ? "shrink-0 bg-forest px-3 py-1.5 text-sm text-[#f6f1e7]" : "shrink-0 border border-line px-3 py-1.5 text-sm"}>
          All
        </Link>
        {CATEGORIES.map((c) => (
          <Link key={c.id} href={href({ category: c.id })} className={category === c.id ? "shrink-0 bg-forest px-3 py-1.5 text-sm text-[#f6f1e7]" : "shrink-0 border border-line px-3 py-1.5 text-sm"}>
            {c.label}
          </Link>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-sm">
        {SORTS.map((item) => (
          <Link key={item.id} href={href({ sort: item.id })} className={sort === item.id ? "underline" : "text-muted"}>
            {item.label}
          </Link>
        ))}
      </div>

      <div className="mt-6">
        {board.ranked.length === 0 ? (
          <p className="border border-dashed border-line px-4 py-8 text-sm text-muted">
            Nobody has enough settled demonstration calls in this view.
          </p>
        ) : (
          <BoardList rows={board.ranked.map(row)} youHandle="you" sort={sort} />
        )}
      </div>

      {board.unranked.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-serif text-2xl">Unranked in this view</h2>
          <p className="mt-1 text-sm text-muted">Thin samples stay visible. They do not get a crown.</p>
          <BoardList rows={board.unranked.map(row)} youHandle="you" sort={sort} />
        </section>
      ) : null}
    </div>
  );
}
