import Link from "next/link";
import { btnPrimary } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl py-16 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Not found</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em]">We could not find that page.</h1>
      <p className="mt-3 text-sm leading-6 text-muted">The market or trader may have moved, or the link is out of date.</p>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/markets" className={btnPrimary}>
          Explore markets
        </Link>
      </div>
    </div>
  );
}
