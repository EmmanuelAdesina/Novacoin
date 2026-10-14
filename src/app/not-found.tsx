import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-xl">
      <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Missing</p>
      <h1 className="mt-3 font-serif text-4xl tracking-[-0.03em]">That is not on the circuit.</h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        The link may be from a reset demo, or the question was never seeded. Try the clock, the board, or search.
      </p>
      <div className="mt-5 flex flex-wrap gap-4 text-sm">
        <Link href="/" className="underline">
          Now
        </Link>
        <Link href="/explore" className="underline">
          Explore
        </Link>
        <Link href="/calls" className="underline">
          Calls
        </Link>
      </div>
    </div>
  );
}
