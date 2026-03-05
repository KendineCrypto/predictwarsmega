"use client";
import { useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";
import {
  useActivePrediction,
  useCountdown,
  useResolve,
  usePlayerStats,
} from "@/hooks/usePredictWars";
import { useEthPrice, fetchRawEthPrice } from "@/hooks/useEthPrice";
import { CheckIcon, XIcon } from "@/components/Icons";

function fmt(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Snapshot captured right before resolving — avoids stale-closure issues
interface PredSnapshot { direction: number; entryPrice: number; exitPrice: number; bid?: bigint }

interface Props {
  onResolved?: () => void;
  optimisticResolveAfter?: number | null;
}

export default function ActivePrediction({ onResolved, optimisticResolveAfter }: Props) {
  const { address } = useAccount();
  const { active, refetch }             = useActivePrediction(address);
  const { price, rawPrice }             = useEthPrice(); // ← no arg; rawPrice for resolve
  const { resolve, isPending: resolving, isSuccess, error } = useResolve();
  const stats = usePlayerStats(address);

  const [resolved, setResolved] = useState(false);
  const [result,   setResult]   = useState<{ won: boolean; diff: number } | null>(null);
  const [snap,     setSnap]     = useState<PredSnapshot | null>(null);

  // Ref guard: prevents auto-resolve from firing more than once even if
  // countdown.expired re-triggers the effect (e.g. from other dep changes).
  const resolveStartedRef = useRef(false);

  const resolveAfterTs = active?.resolveAfter ?? optimisticResolveAfter ?? 0;
  const countdown      = useCountdown(resolveAfterTs);

  // ── Auto-resolve when countdown hits 0 ────────────────────────────────
  // IMPORTANT: we fetch a FRESH raw price from Binance at resolution time.
  // Using the lerped `price` here could submit a price that lags behind the
  // actual market by several seconds, leading to wrong win/loss outcomes.
  useEffect(() => {
    if (!countdown.expired) return;
    if (!active)              return;
    if (resolveStartedRef.current) return; // already fired — do not re-run
    if (resolved)             return;

    resolveStartedRef.current = true; // lock immediately, before any await

    const doResolve = async () => {
      // Fetch a fresh price directly from Binance — most accurate possible
      const exitPrice = await fetchRawEthPrice();
      const exitP     = exitPrice > 0 ? exitPrice : rawPrice; // fallback to last known raw
      if (exitP === 0) return; // no price at all — bail

      setSnap({
        direction:  active.direction,
        entryPrice: active.entryPrice,
        exitPrice:  exitP,
        bid:        active.bid,
      });
      resolve(active.predId, exitP);
    };

    doResolve();
  // Intentionally narrow deps: only trigger when expired/active/resolved change.
  // rawPrice and resolve are stable enough; resolveStartedRef.current guards re-runs.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown.expired, active, resolved]);

  // ── Handle successful resolution ──────────────────────────────────────
  useEffect(() => {
    if (!isSuccess) return;
    const s = snap;
    if (!s) return;
    const won = s.direction === 0
      ? s.exitPrice > s.entryPrice
      : s.exitPrice < s.entryPrice;
    setResult({ won, diff: s.exitPrice - s.entryPrice });
    setResolved(true);
    setTimeout(() => { refetch(); onResolved?.(); }, 3000);
  }, [isSuccess]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Nothing to show ───────────────────────────────────────────────────
  if (!active && !optimisticResolveAfter && !resolved) return null;

  // ── PENDING STATE (tx in flight, not yet polled from chain) ───────────
  if (!active && !!optimisticResolveAfter && !resolved) {
    return (
      <div className="rounded-2xl border-2 border-mega-cyan/40 bg-mega-cyan/5 p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-xs font-mono text-mega-muted tracking-widest uppercase mb-1">
              Prediction Submitted
            </div>
            <div className="text-mega-cyan font-mono text-sm font-bold animate-pulse">
              Confirming on MegaETH…
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-xs text-mega-muted mb-0.5">Window closes in</div>
            <div className="font-mono text-2xl font-bold text-mega-text">
              {countdown.formatted}
            </div>
          </div>
        </div>
        <div className="h-1 bg-mega-border rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-mega-coral via-mega-peach to-mega-cyan rounded-full animate-pulse"
            style={{ width: "60%" }}
          />
        </div>
        <p className="mt-4 text-center text-mega-muted/50 font-mono text-xs">
          MegaETH confirms in ~1 second
        </p>
      </div>
    );
  }

  // Live PnL uses the SMOOTHED price for display only (looks nice on chart)
  // Resolution always uses rawPrice / fresh fetch — never the smoothed value.
  const displayActive = active;
  const priceDiff     = price - (displayActive?.entryPrice ?? 0);
  const diffColor     = priceDiff >= 0 ? "text-mega-mint" : "text-mega-coral";
  const isUpBet       = (displayActive?.direction ?? snap?.direction) === 0;
  const betWinning    = isUpBet ? priceDiff > 0 : priceDiff < 0;

  // ── RESULT SCREEN ─────────────────────────────────────────────────────
  if (resolved && result !== null) {
    return (
      <div className={`
        rounded-2xl border-2 p-8 text-center animate-slide-up
        ${result.won ? "border-mega-mint bg-mega-mint/5" : "border-mega-coral bg-mega-coral/5"}
      `}>
        <div className={`
          w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center border-2
          ${result.won
            ? "border-mega-mint bg-mega-mint/10 shadow-[0_0_30px_#90D79F30]"
            : "border-mega-coral bg-mega-coral/10 shadow-[0_0_30px_#F5949D30]"}
        `}>
          {result.won
            ? <CheckIcon className="w-10 h-10 text-mega-mint" />
            : <XIcon className="w-10 h-10 text-mega-coral" />}
        </div>
        <h2 className={`font-mono text-3xl font-bold mb-2 ${result.won ? "text-mega-mint" : "text-mega-coral"}`}>
          {result.won ? "YOU WON!" : "YOU LOST"}
        </h2>
        <p className="text-mega-muted font-mono text-sm mb-4">
          ETH moved {result.diff >= 0 ? "+" : ""}{fmt(result.diff)} · You predicted{" "}
          <span className={snap?.direction === 0 ? "text-mega-mint" : "text-mega-coral"}>
            {snap?.direction === 0 ? "HIGHER ▲" : "LOWER ▼"}
          </span>
        </p>

        {/* Entry vs exit price comparison */}
        <div className="rounded-xl border border-mega-border bg-mega-bg/50 px-4 py-3 mb-4 font-mono text-xs text-mega-muted grid grid-cols-3 gap-2">
          <div className="text-center">
            <div className="uppercase tracking-widest mb-1">Entry</div>
            <div className="text-mega-peach font-bold">${fmt(snap?.entryPrice ?? 0)}</div>
          </div>
          <div className="text-center">
            <div className="uppercase tracking-widest mb-1">Exit</div>
            <div className={`font-bold ${result.diff >= 0 ? "text-mega-mint" : "text-mega-coral"}`}>
              ${fmt(snap?.exitPrice ?? 0)}
            </div>
          </div>
          <div className="text-center">
            <div className="uppercase tracking-widest mb-1">Move</div>
            <div className={`font-bold ${result.diff >= 0 ? "text-mega-mint" : "text-mega-coral"}`}>
              {result.diff >= 0 ? "+" : ""}{fmt(result.diff)}
            </div>
          </div>
        </div>

        <div className={`inline-flex gap-6 rounded-xl border px-6 py-3 mb-2 ${result.won ? "border-mega-mint/30 bg-mega-mint/10" : "border-mega-coral/30 bg-mega-coral/10"}`}>
          <div className="text-center">
            <div className="text-[10px] font-mono text-mega-muted uppercase tracking-widest mb-1">
              {result.won ? "Won" : "Lost"}
            </div>
            <div className={`font-mono font-black text-2xl ${result.won ? "text-mega-mint" : "text-mega-coral"}`}>
              {result.won ? "+" : "-"}{snap?.bid ? Number(snap.bid).toLocaleString() : "?"} pts
            </div>
          </div>
          {stats && (
            <div className="text-center border-l border-mega-border pl-6">
              <div className="text-[10px] font-mono text-mega-muted uppercase tracking-widest mb-1">Balance</div>
              <div className="font-mono font-bold text-2xl text-mega-peach">{Number(stats.score).toLocaleString()}</div>
            </div>
          )}
        </div>
        <p className="mt-4 text-mega-muted/50 font-mono text-xs">Loading next round…</p>
      </div>
    );
  }

  // ── ACTIVE PREDICTION ─────────────────────────────────────────────────
  return (
    <div className={`
      rounded-2xl border-2 p-6 animate-fade-in
      ${betWinning ? "border-mega-mint/50 bg-mega-mint/5" : "border-mega-coral/50 bg-mega-coral/5"}
    `}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-mega-muted tracking-widest uppercase">Active Prediction</span>
          <span className={`
            text-[10px] font-mono px-2 py-0.5 rounded-full border
            ${betWinning
              ? "border-mega-mint/40 text-mega-mint bg-mega-mint/10"
              : "border-mega-coral/40 text-mega-coral bg-mega-coral/10"}
          `}>
            {betWinning ? "WINNING" : "LOSING"}
          </span>
        </div>
        <div className="text-right">
          <div className="font-mono text-xs text-mega-muted">Resolves in</div>
          <div className={`font-mono text-2xl font-bold ${
            countdown.remaining <= 5 && !countdown.expired ? "text-mega-peach animate-pulse" :
            countdown.expired ? "text-mega-peach animate-pulse" : "text-mega-text"
          }`}>
            {countdown.expired ? "RESOLVING…" : countdown.formatted}
          </div>
        </div>
      </div>

      {/* Prediction badge */}
      <div className="flex items-center justify-between mb-4">
        <div className={`
          flex items-center gap-3 rounded-xl border px-4 py-3
          ${isUpBet ? "border-mega-mint/40 bg-mega-mint/10" : "border-mega-coral/40 bg-mega-coral/10"}
        `}>
          <span className={`text-3xl ${isUpBet ? "text-mega-mint" : "text-mega-coral"}`}>
            {isUpBet ? "▲" : "▼"}
          </span>
          <div>
            <div className={`font-mono font-bold text-lg ${isUpBet ? "text-mega-mint" : "text-mega-coral"}`}>
              {isUpBet ? "HIGHER" : "LOWER"}
            </div>
            <div className="text-mega-muted font-mono text-xs">Your prediction</div>
          </div>
        </div>

        <div className="text-right space-y-1">
          <div>
            <div className="font-mono text-xs text-mega-muted mb-0.5">Entry Price</div>
            <div className="font-mono text-xl text-mega-text">${fmt(displayActive?.entryPrice ?? 0)}</div>
          </div>
          {displayActive?.bid && (
            <div className="rounded-lg border border-mega-border bg-mega-bg/50 px-3 py-1 text-right">
              <div className="font-mono text-[10px] text-mega-muted">Bid</div>
              <div className="font-mono text-sm font-bold text-mega-peach">
                {Number(displayActive.bid).toLocaleString()} pts
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Live PnL — uses smoothed price for display; resolution uses raw */}
      {price > 0 && (
        <div className="rounded-xl border border-mega-border bg-mega-bg/50 p-3 grid grid-cols-3 gap-2">
          <div>
            <div className="text-[10px] font-mono text-mega-muted uppercase tracking-widest">Current Price</div>
            <div className="font-mono text-mega-text font-bold">${fmt(price)}</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] font-mono text-mega-muted uppercase tracking-widest">vs Entry</div>
            <div className={`font-mono font-bold ${diffColor}`}>
              {priceDiff >= 0 ? "+" : ""}{fmt(priceDiff)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-mono text-mega-muted uppercase tracking-widest">Potential</div>
            <div className={`font-mono font-bold ${betWinning ? "text-mega-mint" : "text-mega-coral"}`}>
              {betWinning ? "+" : "-"}{displayActive?.bid ? Number(displayActive.bid).toLocaleString() : "?"} pts
            </div>
          </div>
        </div>
      )}

      {/* Manual resolve — also fetches fresh price */}
      {countdown.expired && !resolving && displayActive && !resolveStartedRef.current && (
        <button
          onClick={async () => {
            if (resolveStartedRef.current) return;
            resolveStartedRef.current = true;
            const exitP = await fetchRawEthPrice();
            const exitPrice = exitP > 0 ? exitP : rawPrice;
            if (exitPrice === 0) return;
            setSnap({
              direction:  displayActive.direction,
              entryPrice: displayActive.entryPrice,
              exitPrice,
              bid:        displayActive.bid,
            });
            resolve(displayActive.predId, exitPrice);
          }}
          className="
            mt-4 w-full py-3 rounded-xl
            border border-mega-peach text-mega-peach font-mono font-bold
            hover:bg-mega-peach/10 transition-all duration-200
          "
        >
          Resolve Now
        </button>
      )}

      {resolving && (
        <div className="mt-4 text-center text-mega-muted font-mono text-sm animate-pulse">
          Submitting resolution to MegaETH…
        </div>
      )}

      {error && (
        <p className="mt-2 text-mega-coral text-xs font-mono text-center">
          {(error as Error).message?.includes("TooEarly")
            ? "Too early to resolve — wait for the countdown"
            : (error as Error).message?.slice(0, 100)}
        </p>
      )}
    </div>
  );
}
