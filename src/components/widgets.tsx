"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  claimSeasonSeat,
  completeOnboarding,
  joinRoom,
  leaveRoom,
  markAllNotificationsRead,
  markNotificationRead,
  placeCall,
  postComment,
  resetDemo,
  simulateResolution,
  toggleFollow,
} from "@/app/actions";
import { INTERESTS, categoryLabel, formatNgn, formatPrice, parseNgnInput, payoutFor } from "@/lib/format";
import { Alert, Success, btnClay, btnForest, btnGhost, btnQuiet } from "@/components/ui";

export function FollowButton({
  handle,
  following,
  compact = false,
}: {
  handle: string;
  following: boolean;
  compact?: boolean;
}) {
  const router = useRouter();
  const [on, setOn] = useState(following);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  useEffect(() => setOn(following), [following]);

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        className={on ? btnGhost : btnForest}
        disabled={pending}
        onClick={() => {
          setError(null);
          setOn(!on);
          start(async () => {
            const result = await toggleFollow(handle);
            if (!result.ok) {
              setOn(following);
              setError(result.error);
              return;
            }
            router.refresh();
          });
        }}
      >
        {pending ? "Saving…" : on ? (compact ? "Following" : "Following record") : compact ? "Follow" : "Follow record"}
      </button>
      {error ? <Alert>{error}</Alert> : null}
    </span>
  );
}

export function JoinButton({
  competitionId,
  joined,
  locked,
  closed,
}: {
  competitionId: string;
  joined: boolean;
  locked?: string;
  closed?: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  if (closed) return <span className="text-sm text-muted">Finished</span>;
  if (locked && !joined) {
    return <span className="text-sm text-clay-ink">{locked}</span>;
  }
  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        className={joined ? btnGhost : btnClay}
        disabled={pending}
        onClick={() => {
          setError(null);
          setMessage(null);
          start(async () => {
            const result = joined ? await leaveRoom(competitionId) : await joinRoom(competitionId);
            if (!result.ok) setError(result.error);
            else setMessage(result.message);
            router.refresh();
          });
        }}
      >
        {pending ? "Saving…" : joined ? "Leave seat" : "Take a seat"}
      </button>
      {error ? <Alert>{error}</Alert> : null}
      {message ? <Success>{message}</Success> : null}
    </span>
  );
}

export function PredictPanel({
  marketId,
  outcomes,
  purse,
  existing,
  initialKey,
  closedReason,
}: {
  marketId: string;
  outcomes: Array<{ id: string; key: string; label: string; priceBps: number }>;
  purse: number;
  existing?: { label: string; stake: number; priceBps: number } | null;
  initialKey?: string;
  closedReason?: string;
}) {
  const router = useRouter();
  const [outcomeId, setOutcomeId] = useState(
    outcomes.find((o) => o.key === initialKey)?.id ?? outcomes[0]?.id ?? "",
  );
  const [stake, setStake] = useState("5000");
  const [thesis, setThesis] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const selected = outcomes.find((o) => o.id === outcomeId) ?? outcomes[0];
  const amount = parseNgnInput(stake) ?? 0;
  const payout = selected ? payoutFor(amount, selected.priceBps) : 0;

  if (closedReason) {
    return (
      <div id="call" className="border border-line bg-paper p-5">
        <p className="text-[11px] uppercase tracking-[0.14em] text-muted">Call closed</p>
        <p className="mt-2 text-sm leading-6">{closedReason}</p>
      </div>
    );
  }
  if (existing) {
    return (
      <div id="call" className="border border-line bg-paper p-5">
        <p className="text-[11px] uppercase tracking-[0.14em] text-muted">Your demo call</p>
        <p className="mt-2 font-serif text-2xl tracking-[-0.03em]">
          {existing.label} at {formatPrice(existing.priceBps)}
        </p>
        <p className="mt-2 text-sm leading-6 text-muted">
          {formatNgn(existing.stake)} is already out of the demo purse. If this outcome resolves, about{" "}
          {formatNgn(payoutFor(existing.stake, existing.priceBps))} comes back. If it misses, nothing comes back. One
          call per question. No real money moved.
        </p>
      </div>
    );
  }

  return (
    <form
      id="call"
      className="border border-ink bg-paper p-5"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        setMessage(null);
        start(async () => {
          const result = await placeCall({ marketId, outcomeId, stakeRaw: stake, thesis });
          if (!result.ok) setError(result.error);
          else {
            setMessage(result.message);
            router.refresh();
          }
        });
      }}
    >
      <p className="text-[11px] uppercase tracking-[0.14em] text-clay-ink">Record a demo call</p>
      <p className="mt-2 text-sm leading-6 text-muted">
        Speculative demonstration. The stake can be lost in the demo purse. This is not income and not a contest prize.
      </p>
      <fieldset className="mt-4 space-y-2">
        <legend className="sr-only">Outcome</legend>
        {outcomes.map((outcome) => (
          <label key={outcome.id} className="flex cursor-pointer items-center justify-between gap-3 border border-line px-3 py-2">
            <span className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="outcome"
                checked={outcomeId === outcome.id}
                onChange={() => setOutcomeId(outcome.id)}
              />
              {outcome.label}
            </span>
            <span className="num text-sm">{formatPrice(outcome.priceBps)}</span>
          </label>
        ))}
      </fieldset>
      <label className="mt-4 block text-sm">
        Demo stake
        <input
          className="mt-1 w-full px-3 py-2"
          inputMode="numeric"
          value={stake}
          onChange={(event) => setStake(event.target.value)}
          aria-describedby="payout-note"
        />
      </label>
      <div className="mt-2 flex flex-wrap gap-2">
        {[1000, 5000, 20000].map((n) => (
          <button key={n} type="button" className={btnGhost} onClick={() => setStake(String(n))}>
            {formatNgn(n)}
          </button>
        ))}
      </div>
      <p id="payout-note" className="mt-3 text-sm leading-6">
        {selected && amount >= 500 ? (
          <>
            At {formatPrice(selected.priceBps)}, {formatNgn(amount)} could return {formatNgn(payout)} if {selected.label}{" "}
            is the resolution. Profit {formatNgn(payout - amount)}. If it misses, the stake stays spent. You lock this
            price. Demo purse available: {formatNgn(purse)}.
          </>
        ) : (
          <>Enter at least ₦500. Demo purse available: {formatNgn(purse)}.</>
        )}
      </p>
      <label className="mt-4 block text-sm">
        Thesis, optional
        <textarea
          className="mt-1 w-full px-3 py-2"
          rows={3}
          maxLength={180}
          value={thesis}
          onChange={(event) => setThesis(event.target.value)}
          placeholder="What would have to be true?"
        />
      </label>
      <p className="mt-1 text-xs text-faint">{thesis.length}/180 · five theses earn a reader's mark</p>
      {error ? (
        <div className="mt-3">
          <Alert>{error}</Alert>
        </div>
      ) : null}
      {message ? (
        <div className="mt-3">
          <Success>{message}</Success>
        </div>
      ) : null}
      <button className={`${btnClay} mt-4`} type="submit" disabled={pending || purse < 500}>
        {pending ? "Recording…" : "Record demo call"}
      </button>
    </form>
  );
}

export function CommentForm({ marketId }: { marketId: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <form
      className="mt-4"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        start(async () => {
          const result = await postComment({ marketId, body });
          if (!result.ok) setError(result.error);
          else {
            setMessage(result.message);
            setBody("");
            router.refresh();
          }
        });
      }}
    >
      <label className="block text-sm">
        Add a note
        <textarea
          className="mt-1 w-full px-3 py-2"
          rows={3}
          maxLength={320}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="A resolution question, not a slogan."
        />
      </label>
      <div className="mt-2 flex items-center justify-between gap-3">
        <span className="text-xs text-faint">{body.length}/320</span>
        <button className={btnForest} type="submit" disabled={pending}>
          {pending ? "Posting…" : "Post note"}
        </button>
      </div>
      {error ? (
        <div className="mt-2">
          <Alert>{error}</Alert>
        </div>
      ) : null}
      {message ? (
        <div className="mt-2">
          <Success>{message}</Success>
        </div>
      ) : null}
    </form>
  );
}

export function ShareButton({ path, label = "Copy link" }: { path: string; label?: string }) {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");
  const [url, setUrl] = useState("");
  return (
    <span className="inline-flex flex-col items-start gap-2">
      <button
        type="button"
        className={btnGhost}
        onClick={async () => {
          const next = `${window.location.origin}${path}`;
          setUrl(next);
          try {
            await navigator.clipboard.writeText(next);
            setState("copied");
          } catch {
            setState("error");
          }
          window.setTimeout(() => setState("idle"), 2200);
        }}
      >
        {state === "copied" ? "Link copied" : label}
      </button>
      {state === "error" ? (
        <label className="text-xs text-muted">
          Clipboard blocked. Copy this demonstration link:
          <input className="mt-1 w-full px-2 py-1 text-xs" readOnly value={url} onFocus={(e) => e.currentTarget.select()} />
        </label>
      ) : null}
    </span>
  );
}

export function ResolveTool({ marketId }: { marketId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <div className="border border-dashed border-line p-4">
      <p className="text-[11px] uppercase tracking-[0.14em] text-muted">Demonstration tool</p>
      <p className="mt-2 text-sm leading-6 text-muted">
        Simulate a resolution using the leading illustrative price. This is not the resolution source, and it is not a
        real event.
      </p>
      {open ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className={btnGhost}
            disabled={pending}
            onClick={() => {
              setError(null);
              start(async () => {
                const result = await simulateResolution(marketId);
                if (!result.ok) setError(result.error);
                else setMessage(result.message);
                router.refresh();
              });
            }}
          >
            {pending ? "Resolving…" : "Yes, simulate"}
          </button>
          <button type="button" className={btnQuiet} onClick={() => setOpen(false)}>
            Cancel
          </button>
        </div>
      ) : (
        <button type="button" className={`${btnGhost} mt-3`} onClick={() => setOpen(true)}>
          Simulate resolution
        </button>
      )}
      {error ? (
        <div className="mt-2">
          <Alert>{error}</Alert>
        </div>
      ) : null}
      {message ? (
        <div className="mt-2">
          <Success>{message}</Success>
        </div>
      ) : null}
    </div>
  );
}

export function ClaimSeatButton({ held }: { held: boolean }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, start] = useTransition();
  if (held) return <p className="text-sm text-forest">Held · demonstration grant, not a purchase.</p>;
  return (
    <div>
      <button
        type="button"
        className={btnForest}
        disabled={pending}
        onClick={() => {
          setError(null);
          start(async () => {
            const result = await claimSeasonSeat();
            if (!result.ok) setError(result.error);
            else setMessage(result.message);
            router.refresh();
          });
        }}
      >
        {pending ? "Claiming…" : "Claim demonstration seat"}
      </button>
      {error ? (
        <div className="mt-2">
          <Alert>{error}</Alert>
        </div>
      ) : null}
      {message ? (
        <div className="mt-2">
          <Success>{message}</Success>
        </div>
      ) : null}
    </div>
  );
}

export function ResetDemoButton() {
  const [armed, setArmed] = useState(false);
  const [pending, start] = useTransition();
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        className={btnGhost}
        disabled={pending}
        onClick={() => {
          if (!armed) {
            setArmed(true);
            return;
          }
          start(async () => {
            await resetDemo();
          });
        }}
      >
        {pending ? "Resetting…" : armed ? "Yes, reset the shared demo" : "Reset demonstration"}
      </button>
      {armed && !pending ? <span className="text-xs text-muted">This clears every call you recorded.</span> : null}
    </div>
  );
}

export function OnboardingForm({
  name,
  city,
  interests,
  preview,
}: {
  name: string;
  city: string;
  interests: string[];
  preview: Array<{ id: string; question: string; category: string; when: string }>;
}) {
  const [selected, setSelected] = useState<string[]>(interests);
  const [nextName, setNextName] = useState(name);
  const [nextCity, setNextCity] = useState(city);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const tuned = preview.filter((item) => selected.length === 0 || selected.includes(item.category)).slice(0, 3);
  const shown = tuned.length ? tuned : preview.slice(0, 3);
  const retune = preview.length === 0;

  function submit(skip: boolean) {
    setError(null);
    start(async () => {
      const result = await completeOnboarding({
        name: nextName,
        city: nextCity,
        interests: selected,
        skip,
      });
      if (result && !result.ok) setError(result.error);
    });
  }

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-clay-ink">Circuit 01 · Nigeria first</p>
        <h1 className="mt-3 max-w-xl font-serif text-5xl leading-[0.95] tracking-[-0.04em] md:text-6xl">
          {retune ? "Retune the circuit." : "What do you want a record in?"}
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-muted">
          Sabi — to know. Pick a few interests and the circuit opens on what is moving there. No ID, no bank account, no
          deposit. You can look around either way.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {INTERESTS.map((interest) => {
            const on = selected.includes(interest.id);
            return (
              <button
                key={interest.id}
                type="button"
                aria-pressed={on}
                className={on ? btnForest : btnGhost}
                onClick={() =>
                  setSelected((current) =>
                    current.includes(interest.id) ? current.filter((id) => id !== interest.id) : [...current, interest.id],
                  )
                }
              >
                {interest.label}
              </button>
            );
          })}
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            Demo name
            <input className="mt-1 w-full px-3 py-2" value={nextName} onChange={(e) => setNextName(e.target.value)} />
          </label>
          <label className="text-sm">
            City
            <input className="mt-1 w-full px-3 py-2" value={nextCity} onChange={(e) => setNextCity(e.target.value)} />
          </label>
        </div>
        <p className="mt-2 text-xs text-faint">A demo name, not an identity check. Leave it if Amaka is fine.</p>
        {error ? (
          <div className="mt-3">
            <Alert>{error}</Alert>
          </div>
        ) : null}
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" className={btnClay} disabled={pending} onClick={() => submit(false)}>
            {pending ? "Opening…" : "Show my circuit"}
          </button>
          <button type="button" className={btnQuiet} disabled={pending} onClick={() => submit(true)}>
            Skip and explore
          </button>
        </div>
      </div>
      <aside className={retune ? "hidden" : "border-t border-line pt-4 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0"}>
        <p className="text-[11px] uppercase tracking-[0.14em] text-muted">Already moving</p>
        <ul className="mt-3 divide-y divide-line">
          {shown.map((item) => (
            <li key={item.id} className="py-3">
              <p className="text-[11px] uppercase tracking-[0.14em] text-clay-ink">{categoryLabel(item.category)}</p>
              <p className="mt-1 font-serif text-xl leading-snug tracking-[-0.03em]">{item.question}</p>
              <p className="mt-1 text-xs text-muted">Closes {item.when} · demonstration</p>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}

export function InterestEditor({
  name,
  city,
  interests,
}: {
  name: string;
  city: string;
  interests: string[];
}) {
  return (
    <OnboardingForm name={name} city={city} interests={interests} preview={[]} />
  );
}

type ShellNote = {
  id: number;
  title: string;
  body: string;
  href: string | null;
  read: boolean;
  when: string;
};

export function NotificationBell({ notes }: { notes: ShellNote[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const unread = notes.filter((n) => !n.read).length;
  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="relative">
      <button
        type="button"
        className={btnGhost}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((v) => !v)}
      >
        Notices
        {unread > 0 ? <span className="num text-clay-ink">{unread}</span> : null}
      </button>
      {open ? (
        <div className="absolute right-0 z-40 mt-2 w-[min(92vw,380px)] border border-line bg-paper shadow-[0_18px_40px_rgba(20,18,16,0.08)]">
          <div className="flex items-center justify-between border-b border-line px-3 py-2">
            <p className="text-[11px] uppercase tracking-[0.14em] text-muted">Demonstration notices</p>
            <button
              type="button"
              className={btnQuiet}
              disabled={pending || unread === 0}
              onClick={() => {
                start(async () => {
                  await markAllNotificationsRead();
                  router.refresh();
                });
              }}
            >
              Mark read
            </button>
          </div>
          {notes.length === 0 ? (
            <p className="px-3 py-6 text-sm text-muted">No notices. A call, a seat, or a simulated outcome will land here.</p>
          ) : (
            <ul className="max-h-96 overflow-auto">
              {notes.map((note) => (
                <li key={note.id} className="border-b border-line last:border-b-0">
                  <button
                    type="button"
                    className="block w-full px-3 py-3 text-left hover:bg-sand"
                    onClick={() => {
                      start(async () => {
                        await markNotificationRead(note.id);
                        setOpen(false);
                        if (note.href) router.push(note.href);
                        else router.refresh();
                      });
                    }}
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium">{note.title}</span>
                      {!note.read ? <span className="h-1.5 w-1.5 rounded-full bg-clay" /> : null}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-muted">{note.body}</span>
                    <span className="mt-1 block text-[11px] uppercase tracking-[0.12em] text-faint">{note.when}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}

export function BoardList({
  rows,
  youHandle,
  sort,
}: {
  rows: Array<{
    rank: number | null;
    handle: string;
    displayName: string;
    initials: string;
    hue: string;
    city: string;
    style: string;
    isYou: boolean;
    score: string;
    accuracy: string;
    ret: string;
    recent: string;
    settled: number;
    thin: boolean;
    reason: string | null;
    parts: string;
  }>;
  youHandle: string;
  sort: string;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const you = rows.find((r) => r.handle === youHandle);
  return (
    <ol className="divide-y divide-line border-y border-line">
      {rows.map((row) => {
        const expanded = open === row.handle;
        return (
          <li key={row.handle} className={row.isYou ? "bg-mist/60" : undefined}>
            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 py-3">
              <span className="w-8 font-serif text-2xl num">{row.rank ?? "–"}</span>
              <Link href={`/u/${row.handle}`} className="min-w-0">
                <span className="flex items-center gap-3">
                  <span
                    className="inline-grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs text-[#f6f1e7]"
                    style={{ background: row.hue }}
                    aria-hidden
                  >
                    {row.initials}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-medium">
                      {row.displayName}
                      {row.isYou ? " · you" : ""}
                    </span>
                    <span className="block truncate text-xs text-muted">
                      {row.city} · {row.style}
                      {row.thin ? " · thin record" : ""}
                    </span>
                  </span>
                </span>
              </Link>
              <button type="button" className="text-right" onClick={() => setOpen(expanded ? null : row.handle)}>
                <span className="block font-serif text-xl num">{row.score}</span>
                <span className="text-[11px] uppercase tracking-[0.12em] text-muted">{sort === "standing" ? "standing" : sort}</span>
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 pb-3 pl-11 text-xs text-muted sm:grid-cols-4">
              <span>Accuracy {row.accuracy}</span>
              <span>Return {row.ret}</span>
              <span>Recent {row.recent}</span>
              <span className="hidden sm:inline">{row.settled} settled</span>
            </div>
            {row.reason ? <p className="pb-3 pl-11 text-xs text-faint">{row.reason}</p> : null}
            {expanded && you && !row.isYou ? (
              <p className="pb-3 pl-11 text-sm leading-6">
                You {you.accuracy} accuracy, {you.ret} return. {row.displayName.split(" ")[0]} {row.accuracy} accuracy,{" "}
                {row.ret} return. {row.parts}
              </p>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
