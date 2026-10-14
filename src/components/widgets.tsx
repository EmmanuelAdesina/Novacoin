"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { placePosition, postComment, resetDemo, settleMarket, toggleFollow } from "@/app/actions";
import {
  MAX_COMMENT_LENGTH,
  MAX_NOTE_LENGTH,
  MAX_POSITION_NGN,
  MIN_POSITION_NGN,
  payoutFor,
} from "@/lib/market";
import { formatCents, formatChance, formatNgn, parseNgnInput } from "@/lib/format";
import { Alert, Success, btnGhost, btnPrimary, btnSmall, cn } from "@/components/ui";

export function FollowButton({
  handle,
  following,
  size = "small",
}: {
  handle: string;
  following: boolean;
  size?: "small" | "large";
}) {
  const router = useRouter();
  // Optimistic state, valid only while the server value it was based on is unchanged.
  const [local, setLocal] = useState<{ base: boolean; on: boolean } | null>(null);
  const on = local && local.base === following ? local.on : following;
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        aria-pressed={on}
        disabled={pending}
        onClick={() => {
          setError(null);
          setLocal({ base: following, on: !on });
          start(async () => {
            const result = await toggleFollow(handle);
            if (!result.ok) {
              setLocal(null);
              setError(result.error);
              return;
            }
            router.refresh();
          });
        }}
        className={cn(
          "inline-flex items-center justify-center rounded-full font-semibold transition disabled:opacity-50",
          size === "large" ? "px-5 py-3 text-sm" : "px-3.5 py-1.5 text-xs",
          on ? "border border-line-2 text-ink hover:border-ink" : "bg-ink text-bg hover:opacity-90",
        )}
      >
        {pending ? "Saving…" : on ? "Following" : "Follow"}
      </button>
      {error ? <span className="max-w-[14rem] text-right text-xs text-no">{error}</span> : null}
    </span>
  );
}

export type TradeOutcome = { id: string; key: string; label: string; priceBps: number };

export function TradePanel({
  marketId,
  outcomes,
  balance,
  existing,
  status,
  settledLabel,
}: {
  marketId: string;
  outcomes: TradeOutcome[];
  balance: number;
  existing: { label: string; stake: number; priceBps: number; status: "open" | "won" | "lost" } | null;
  status: "open" | "closed" | "settled";
  settledLabel: string | null;
}) {
  const router = useRouter();
  const [outcomeId, setOutcomeId] = useState(outcomes[0]?.id ?? "");
  const [stake, setStake] = useState("5000");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const selected = outcomes.find((o) => o.id === outcomeId) ?? outcomes[0];
  const amount = parseNgnInput(stake) ?? 0;
  const payout = selected ? payoutFor(amount, selected.priceBps) : 0;
  const validAmount = amount >= MIN_POSITION_NGN && amount <= MAX_POSITION_NGN && amount <= balance;
  const isBinary = outcomes.length === 2;
  const tone = (key: string) => (key === "no" ? "no" : "yes");

  if (status === "settled") {
    return (
      <section id="trade" className="rounded-3xl border border-line bg-panel p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Settled</p>
        <p className="mt-2 text-2xl font-semibold tracking-[-0.02em]">Result: {settledLabel}</p>
        <p className="mt-2 text-sm leading-6 text-muted">
          This market is settled in the demo. Positions have been updated. Trading is closed.
        </p>
      </section>
    );
  }

  if (status === "closed") {
    return (
      <section id="trade" className="rounded-3xl border border-line bg-panel p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Trading closed</p>
        <p className="mt-2 text-sm leading-6 text-muted">
          The deadline has passed. The market is waiting for its result.
        </p>
      </section>
    );
  }

  if (existing) {
    return (
      <section id="trade" className="rounded-3xl border border-line bg-panel p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Your position</p>
        <p className="mt-2 text-2xl font-semibold tracking-[-0.02em]">
          {existing.label} at {formatCents(existing.priceBps)}
        </p>
        <p className="num mt-2 text-sm text-muted">
          {formatNgn(existing.stake)} staked. If {existing.label} wins, about {formatNgn(payoutFor(existing.stake, existing.priceBps))} comes back.
        </p>
        <p className="mt-3 text-sm text-muted">One position per market in this demo.</p>
      </section>
    );
  }

  return (
    <form
      id="trade"
      className="rounded-3xl border border-line bg-panel p-5 md:p-6"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        setMessage(null);
        start(async () => {
          const result = await placePosition({ marketId, outcomeId, stakeRaw: stake, thesis: note });
          if (!result.ok) setError(result.error);
          else {
            setMessage(result.message);
            setNote("");
            router.refresh();
          }
        });
      }}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Make a prediction</p>

      <fieldset className="mt-4">
        <legend className="sr-only">Outcome</legend>
        <div className={cn("grid gap-2", isBinary ? "grid-cols-2" : "grid-cols-1")}>
          {outcomes.map((outcome) => {
            const on = outcome.id === outcomeId;
            const t = tone(outcome.key);
            return (
              <label
                key={outcome.id}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition",
                  on
                    ? t === "no"
                      ? "border-no bg-no/15 text-no"
                      : "border-yes bg-yes/15 text-yes"
                    : "border-line-2 text-ink hover:border-muted",
                )}
              >
                <span className="flex items-center gap-2 font-semibold">
                  <input
                    type="radio"
                    name="outcome"
                    className="sr-only"
                    checked={on}
                    onChange={() => setOutcomeId(outcome.id)}
                  />
                  {outcome.label}
                </span>
                <span className="num text-sm font-semibold">{formatCents(outcome.priceBps)}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <label className="mt-5 block text-sm font-medium">
        Amount
        <div className="mt-2 flex items-center gap-2 rounded-2xl border border-line-2 bg-[#0f1116] px-4 focus-within:border-brand">
          <span className="text-muted">₦</span>
          <input
            className="num w-full border-0 bg-transparent px-0 py-3 text-2xl font-semibold focus:outline-none"
            inputMode="numeric"
            value={stake}
            onChange={(event) => setStake(event.target.value.replace(/[^\d,₦\s]/g, ""))}
            aria-describedby="payout-note"
          />
        </div>
      </label>
      <div className="mt-2 flex flex-wrap gap-2">
        {[1000, 5000, 20000, 100000].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setStake(String(n))}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
              amount === n ? "border-ink bg-ink text-bg" : "border-line-2 text-muted hover:text-ink",
            )}
          >
            {formatNgn(n)}
          </button>
        ))}
      </div>

      <p id="payout-note" className="mt-4 rounded-2xl bg-panel-2 px-4 py-3 text-sm leading-6">
        {selected && amount >= MIN_POSITION_NGN ? (
          <>
            If <strong>{selected.label}</strong> wins, {formatNgn(amount)} returns{" "}
            <strong className="num text-brand">{formatNgn(payout)}</strong> (profit {formatNgn(payout - amount)}). If it
            loses, the stake is gone.
          </>
        ) : (
          <>Minimum ₦{MIN_POSITION_NGN.toLocaleString("en-NG")}. Your demo balance is {formatNgn(balance)}.</>
        )}
      </p>

      <label className="mt-4 block text-sm font-medium">
        Why? <span className="font-normal text-muted">Optional</span>
        <textarea
          className="mt-2 w-full px-4 py-3 text-sm"
          rows={2}
          maxLength={MAX_NOTE_LENGTH}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Your reason, shown next to your position"
        />
      </label>

      {error ? (
        <div className="mt-4">
          <Alert>{error}</Alert>
        </div>
      ) : null}
      {message ? (
        <div className="mt-4">
          <Success>{message}</Success>
        </div>
      ) : null}

      <button
        className={cn(btnPrimary, "mt-5 w-full py-4 text-base")}
        type="submit"
        disabled={pending || !validAmount || !selected}
      >
        {pending
          ? "Placing…"
          : selected
            ? `Buy ${selected.label} · ${formatNgn(amount || 0)}`
            : "Buy"}
      </button>
      <p className="mt-3 text-center text-xs text-faint">
        Demo only. {formatChance(selected?.priceBps ?? 0)} implied chance. No real money moves.
      </p>
    </form>
  );
}

export function CommentForm({ marketId }: { marketId: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
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
            setBody("");
            router.refresh();
          }
        });
      }}
    >
      <label className="block text-sm font-medium">
        <span className="sr-only">Add a comment</span>
        <textarea
          className="w-full px-4 py-3 text-sm"
          rows={2}
          maxLength={MAX_COMMENT_LENGTH}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Say why you think it goes this way"
        />
      </label>
      <div className="mt-2 flex items-center justify-between gap-3">
        <span className="text-xs text-faint">
          {body.length}/{MAX_COMMENT_LENGTH}
        </span>
        <button className={btnSmall + " bg-ink text-bg"} type="submit" disabled={pending || body.trim().length < 2}>
          {pending ? "Posting…" : "Comment"}
        </button>
      </div>
      {error ? (
        <div className="mt-2">
          <Alert>{error}</Alert>
        </div>
      ) : null}
    </form>
  );
}

// Demo-only control: settles a market by choosing its winner. Results are simulated.
export function SettleControls({ marketId, outcomes }: { marketId: string; outcomes: TradeOutcome[] }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <div className="rounded-2xl border border-dashed border-gold/40 bg-gold/5 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">Demo only</p>
      <p className="mt-2 text-sm leading-6 text-muted">
        Settle this market to see how positions pay out. This is a simulated result, not an official outcome.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {outcomes.map((o) => (
          <button
            key={o.id}
            type="button"
            disabled={pending}
            onClick={() => {
              setError(null);
              setMessage(null);
              start(async () => {
                const result = await settleMarket({ marketId, outcomeId: o.id });
                if (!result.ok) setError(result.error);
                else {
                  setMessage(result.message);
                  router.refresh();
                }
              });
            }}
            className={btnSmall + " border border-gold/50 text-gold hover:bg-gold/10"}
          >
            Settle as {o.label}
          </button>
        ))}
      </div>
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
    </div>
  );
}

export function ResetButton() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!window.confirm("Reset the demo? Positions, follows and comments go back to the starting state.")) return;
          setMessage(null);
          start(async () => {
            const result = await resetDemo();
            setMessage(result.message);
            router.refresh();
          });
        }}
        className="text-sm text-muted underline underline-offset-4 hover:text-ink"
      >
        {pending ? "Resetting…" : "Reset demo data"}
      </button>
      {message ? <p className="text-xs text-muted">{message}</p> : null}
    </div>
  );
}
