"use client";

import { btnPrimary } from "@/components/ui";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl py-16 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Something broke</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em]">Sabi could not load this page.</h1>
      <p className="mt-3 text-sm leading-6 text-muted">Nothing was spent or changed. Try again in a moment.</p>
      <button type="button" onClick={reset} className={`${btnPrimary} mt-6`}>
        Try again
      </button>
      <p className="mt-4 text-xs text-faint">{error.message}</p>
    </div>
  );
}
