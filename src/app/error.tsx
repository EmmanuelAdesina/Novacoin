"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="max-w-xl">
      <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Error state</p>
      <h1 className="mt-3 font-serif text-4xl tracking-[-0.03em]">The circuit did not load.</h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        This is a demonstration error, not a market outcome. Nothing in the demo purse was changed by this failure.
      </p>
      <button type="button" onClick={reset} className="mt-5 border border-ink px-4 py-2 text-sm">
        Try again
      </button>
      <p className="mt-4 text-xs text-faint">{error.message}</p>
    </div>
  );
}
