"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  placePositionAction,
  postCommentAction,
  resetDemoAction,
  settleMarketAction,
  toggleFollowAction,
} from "@/app/actions";
import {
  MAX_COMMENT_LENGTH,
  MAX_NOTE_LENGTH,
  MAX_POSITION_NGN,
  MIN_POSITION_NGN,
  payoutFor,
} from "@/lib/data";
import { chanceMeaning, formatChance, formatNgn, parseNgnInput } from "@/lib/format";
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
            const result = await toggleFollowAction(handle);
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
        {pending ? "Saving…" : on ? "Following ✓" : "Follow"}
      </button>
      {error ? <span className="max-w-[14rem] text-right text-xs text-no">{error}</span> : null}
    </span>
  );
}

export type TradeOutcome = { id: string; key: string; label: string; priceBps: number };

// THE BETTING PANEL - super clear for Nigerian students
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
  const [stake, setStake] = useState("1000");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const selected = outcomes.find((o) => o.id === outcomeId) ?? outcomes[0];
  const amount = parseNgnInput(stake) ?? 0;
  const payout = selected ? payoutFor(amount, selected.priceBps) : 0;
  const profit = payout - amount;
  const validAmount = amount >= MIN_POSITION_NGN && amount <= MAX_POSITION_NGN && amount <= balance;
  const isBinary = outcomes.length === 2;

  if (status === "settled") {
    return (
      <section id="trade" className="rounded-3xl border border-line bg-panel p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Result available</p>
        <p className="mt-2 text-2xl font-bold">Winner: {settledLabel}</p>
        <p className="mt-2 text-sm leading-6 text-muted">
          This market has ended. All predictions have been settled. No more predictions can be placed.
        </p>
      </section>
    );
  }

  if (status === "closed") {
    return (
      <section id="trade" className="rounded-3xl border border-line bg-panel p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Predictions closed</p>
        <p className="mt-2 text-sm leading-6 text-muted">
          The deadline has passed. The result is pending.
        </p>
      </section>
    );
  }

  if (existing) {
    const myPayout = payoutFor(existing.stake, existing.priceBps);
    const myProfit = myPayout - existing.stake;
    return (
      <section id="trade" className="rounded-3xl border border-brand/30 bg-panel p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">Your bet</p>
        <p className="mt-2 text-2xl font-bold">{existing.label}</p>
        <div className="mt-3 rounded-2xl bg-panel-2 p-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted">You put:</span>
            <span className="num font-semibold">{formatNgn(existing.stake)}</span>
          </div>
          {existing.status === "open" ? (
            <>
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-muted">If you win, you collect:</span>
                <span className="num font-semibold text-yes">{formatNgn(myPayout)}</span>
              </div>
              <div className="mt-1 flex justify-between text-sm">
                <span className="text-muted">Your profit:</span>
                <span className="num font-semibold text-yes">+{formatNgn(myProfit)}</span>
              </div>
            </>
          ) : existing.status === "won" ? (
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-muted">You won:</span>
              <span className="num font-bold text-yes">{formatNgn(myPayout)}</span>
            </div>
          ) : (
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-muted">You lost:</span>
              <span className="num font-semibold text-no">{formatNgn(existing.stake)}</span>
            </div>
          )}
        </div>
        <p className="mt-3 text-sm text-muted">You can place only one prediction per market in this demo.</p>
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
          const result = await placePositionAction({ marketId, outcomeId, stakeRaw: stake, thesis: note });
          if (!result.ok) setError(result.error);
          else {
            setMessage(result.message);
            setNote("");
            router.refresh();
          }
        });
      }}
    >
      <p className="text-lg font-bold">Place your bet 🎯</p>
      <p className="mt-1 text-sm text-muted">Choose what you think will happen and use your demo balance.</p>

      <fieldset className="mt-5">
        <legend className="mb-2 text-sm font-medium">Which option do you choose?</legend>
        <div className={cn("grid gap-2", isBinary ? "grid-cols-2" : "grid-cols-1")}>
          {outcomes.map((outcome) => {
            const on = outcome.id === outcomeId;
            const pct = Math.round(outcome.priceBps / 100);
            return (
              <label
                key={outcome.id}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition",
                  on
                    ? "border-brand bg-brand/10 text-ink"
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
                  {on ? <span className="text-brand">●</span> : <span className="text-muted">○</span>}
                  {outcome.label}
                </span>
                <span className="text-right">
                  <span className="num block text-sm font-bold">{pct}%</span>
                  <span className="num block text-[10px] text-muted">{chanceMeaning(outcome.priceBps)}</span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <label className="mt-5 block text-sm font-medium">
        How much do you want to predict with?
        <div className="mt-2 flex items-center gap-2 rounded-2xl border border-line-2 bg-[#0f1116] px-4 focus-within:border-brand">
          <span className="text-xl font-bold text-muted">₦</span>
          <input
            className="num w-full border-0 bg-transparent px-0 py-3 text-2xl font-bold focus:outline-none"
            inputMode="numeric"
            value={stake}
            onChange={(event) => setStake(event.target.value.replace(/[^\d,₦\s]/g, ""))}
            aria-describedby="payout-note"
            placeholder="1000"
          />
        </div>
      </label>
      <div className="mt-2 flex flex-wrap gap-2">
        {[500, 1000, 5000, 20000].map((n) => (
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
        <span className="text-xs text-muted self-center">Your demo money: {formatNgn(balance)}</span>
      </div>

      {/* THE CLEAR EXPLANATION OF WHAT YOU WIN */}
      {selected && amount >= MIN_POSITION_NGN ? (
        <div id="payout-note" className="mt-4 rounded-2xl bg-yes/10 border border-yes/20 px-4 py-4">
          <p className="text-sm leading-6">
            If <strong className="text-yes">{selected.label}</strong> happens:
          </p>
          <div className="mt-2 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">You put:</span>
              <span className="num font-semibold">{formatNgn(amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">You collect back:</span>
              <span className="num font-bold text-yes">{formatNgn(payout)}</span>
            </div>
            <div className="flex justify-between border-t border-yes/20 pt-2">
              <span className="font-semibold">Your profit:</span>
              <span className="num font-bold text-yes">+{formatNgn(profit)}</span>
            </div>
          </div>
          <p className="mt-2 text-xs text-yes/80">
            If it does not happen, you lose your {formatNgn(amount)} demo stake.
          </p>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl bg-panel-2 px-4 py-3 text-sm text-muted">
          Minimum prediction is ₦{MIN_POSITION_NGN.toLocaleString("en-NG")}. Your demo balance is {formatNgn(balance)}.
        </div>
      )}

      <label className="mt-4 block text-sm font-medium">
        Why do you believe this? <span className="font-normal text-muted">(optional)</span>
        <textarea
          className="mt-2 w-full rounded-2xl border border-line-2 bg-panel-2 px-4 py-3 text-sm focus:border-brand focus:outline-none"
          rows={2}
          maxLength={MAX_NOTE_LENGTH}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Explain why you think this will happen. It will appear with your prediction."
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
          ? "Placing prediction…"
          : selected
            ? `Predict "${selected.label}" · ${formatNgn(amount || 0)}`
            : "Place prediction"}
      </button>
      <p className="mt-3 text-center text-xs text-faint">
        🎮 Demo only — {formatChance(selected?.priceBps ?? 0)} chance. NO REAL MONEY. Just practice.
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
          const result = await postCommentAction({ marketId, body });
          if (!result.ok) setError(result.error);
          else {
            setBody("");
            router.refresh();
          }
        });
      }}
    >
      <label className="block text-sm font-medium">
        <span className="sr-only">Drop comment</span>
        <textarea
          className="w-full rounded-2xl border border-line-2 bg-panel-2 px-4 py-3 text-sm focus:border-brand focus:outline-none"
          rows={2}
          maxLength={MAX_COMMENT_LENGTH}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="What do you think? Share your view."
        />
      </label>
      <div className="mt-2 flex items-center justify-between gap-3">
        <span className="text-xs text-faint">
          {body.length}/{MAX_COMMENT_LENGTH}
        </span>
        <button className={btnSmall + " bg-ink text-bg"} type="submit" disabled={pending || body.trim().length < 2}>
          {pending ? "Posting…" : "Post comment"}
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

// Demo settle button - pick who wins to see results
export function SettleControls({ marketId, outcomes }: { marketId: string; outcomes: TradeOutcome[] }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <div className="rounded-2xl border border-dashed border-gold/40 bg-gold/5 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">🎮 Demo Controls (Prototype Only)</p>
      <p className="mt-2 text-sm leading-6 text-muted">
        Choose the winner to see how the demo results affect predictions. This is a prototype; no real money is involved.
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
                const result = await settleMarketAction({ marketId, outcomeId: o.id });
                if (!result.ok) setError(result.error);
                else {
                  setMessage(result.message);
                  router.refresh();
                }
              });
            }}
            className={btnSmall + " border border-gold/50 text-gold hover:bg-gold/10"}
          >
            &ldquo;{o.label}&rdquo; wins
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
          if (!window.confirm("Reset everything? All your bets go vanish, back to square one.")) return;
          setMessage(null);
          start(async () => {
            const result = await resetDemoAction();
            if (result.ok) setMessage(result.message);
            router.refresh();
          });
        }}
        className="text-sm text-muted underline underline-offset-4 hover:text-ink"
      >
        {pending ? "Resetting…" : "Reset demo (start over)"}
      </button>
      {message ? <p className="text-xs text-muted">{message}</p> : null}
    </div>
  );
}
