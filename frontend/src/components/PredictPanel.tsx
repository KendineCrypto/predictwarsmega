"use client";
import { useState, useEffect, useRef } from "react";
import { useAccount } from "wagmi";
import { usePredict, usePlayerStats } from "@/hooks/usePredictWars";
import { useEthPrice, fetchRawEthPrice } from "@/hooks/useEthPrice";
import type { Direction } from "@/hooks/usePredictWars";
import { STARTING_SCORE, PREDICTION_DURATION } from "@/lib/contract";
import WalletButton from "./WalletButton";
import Image from "next/image";
import clsx from "clsx";

const BID_PRESETS = [
  { label: "10%",    pct: 0.10 },
  { label: "25%",    pct: 0.25 },
  { label: "50%",    pct: 0.50 },
  { label: "ALL IN", pct: 1.00 },
];

interface Props {
  onPredicting?: (optimisticResolveAfter: number) => void;
  onPredicted?:  () => void;
}

export default function PredictPanel({ onPredicting, onPredicted }: Props) {
  const { isConnected, address } = useAccount();
  const { price, rawPrice }      = useEthPrice(); // price = smooth display, rawPrice = latest API
  const stats                    = usePlayerStats(address);
  const { predict, isPending, isSuccess, error } = usePredict();

  const [chosen,    setChosen]    = useState<Direction | null>(null);
  const [bidPct,    setBidPct]    = useState(0.10);
  const [customBid, setCustomBid] = useState<string>("");
  const [useCustom, setUseCustom] = useState(false);

  // ── Background price cache ────────────────────────────────────────────────
  // Poll Binance every 2s and store in a ref.
  // This lets handlePredict read a fresh price SYNCHRONOUSLY on click,
  // so writeContract (and MetaMask) is called within the trusted user-gesture
  // context — no `await` in the click handler!
  const cachedRawRef  = useRef(0);
  const [cachedRaw, setCachedRaw] = useState(0); // state copy for UI display

  useEffect(() => {
    const update = async () => {
      const raw = await fetchRawEthPrice();
      if (raw > 0) {
        cachedRawRef.current = raw;
        setCachedRaw(raw);
      }
    };
    // Seed immediately with whatever rawPrice the hook already has
    if (rawPrice > 0) { cachedRawRef.current = rawPrice; setCachedRaw(rawPrice); }
    update(); // also kick off a fresh fetch right away
    const id = setInterval(update, 2_000); // refresh every 2s in background
    return () => clearInterval(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync hook's rawPrice into cache on first arrival
  useEffect(() => {
    if (rawPrice > 0 && cachedRawRef.current === 0) {
      cachedRawRef.current = rawPrice;
      setCachedRaw(rawPrice);
    }
  }, [rawPrice]);

  const currentScore = stats?.score ?? STARTING_SCORE;
  const maxBid       = Number(currentScore);

  const computedBid = useCustom
    ? Math.min(Math.max(1, parseInt(customBid) || 1), maxBid)
    : Math.max(1, Math.round(maxBid * bidPct));

  const bidBigInt = BigInt(computedBid);

  // Tx confirmed
  useEffect(() => {
    if (isSuccess) onPredicted?.();
  }, [isSuccess]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Click handler — 100% synchronous, no await ────────────────────────────
  // Reading cachedRawRef.current is synchronous (plain object property access).
  // writeContract / MetaMask is called in the same JS tick as the user click
  // → satisfies browser "trusted gesture" requirement → MetaMask opens instantly.
  const handlePredict = (dir: Direction) => {
    if (isPending) return;

    // Best available fresh price: background cache > hook rawPrice > lerped display
    const entryPrice =
      cachedRawRef.current > 0 ? cachedRawRef.current :
      rawPrice         > 0 ? rawPrice         :
      price;

    if (entryPrice === 0) return; // no price yet — ignore click

    setChosen(dir);

    const optimisticResolveAfter =
      Math.floor(Date.now() / 1000) + PREDICTION_DURATION + 4;
    onPredicting?.(optimisticResolveAfter);

    predict(dir, entryPrice, bidBigInt); // ← MetaMask opens HERE, synchronously
  };

  if (isSuccess) return null;

  // ── Display price: cached raw is freshest, fall back to smooth display ───
  const displayPrice = cachedRaw > 0 ? cachedRaw : price;

  // ── Not connected ────────────────────────────────────────────────────────
  if (!isConnected) {
    return (
      <div className="rounded-2xl border border-mega-border bg-mega-surface/60 p-8 text-center animate-fade-in">
        <Image src="/logo.png" alt="PredictWars" width={72} height={72} className="mx-auto mb-4 object-contain" />
        <p className="text-mega-text font-mono font-bold text-lg mb-2">Connect wallet to play</p>
        <p className="text-mega-muted text-sm font-mono mb-6">
          Predict ETH price · Bet points · Dominate the leaderboard
        </p>
        <WalletButton />
        <p className="mt-4 text-[11px] font-mono text-mega-muted/50">
          New players start with <span className="text-mega-mint">1,000 pts</span>
        </p>
      </div>
    );
  }

  // ── Main panel ───────────────────────────────────────────────────────────
  return (
    <div className="rounded-2xl border border-mega-border bg-mega-surface/60 p-6 animate-fade-in space-y-5">

      {/* Title + live entry price */}
      <div className="text-center">
        <h2 className="font-mono text-mega-text text-xl font-bold mb-1">
          Will ETH be
          <span className="text-mega-mint"> HIGHER </span>
          or
          <span className="text-mega-coral"> LOWER </span>
          in <span className="text-mega-peach">30 seconds</span>?
        </h2>

        {displayPrice > 0 && (
          <p className="font-mono text-xs text-mega-muted mt-1">
            Entry price:{" "}
            <span className="text-mega-cyan font-bold">
              ${displayPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
            {/* Small freshness dot — green = just updated, dims over time */}
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-mega-mint ml-2 animate-pulse" />
          </p>
        )}
      </div>

      {/* Balance */}
      <div className="flex items-center justify-between rounded-xl border border-mega-border bg-mega-bg/50 px-4 py-3">
        <span className="font-mono text-xs text-mega-muted uppercase tracking-widest">Balance</span>
        <span className="font-mono text-xl font-bold text-mega-peach">
          {Number(currentScore).toLocaleString()}
          <span className="text-mega-muted text-sm ml-1">pts</span>
        </span>
      </div>

      {/* Bid selector */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-xs text-mega-muted uppercase tracking-widest">Bid Amount</span>
          <span className={clsx(
            "font-mono text-sm font-bold",
            computedBid > maxBid * 0.75 ? "text-mega-coral" : "text-mega-text"
          )}>
            {computedBid.toLocaleString()} pts
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-3">
          {BID_PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => { setBidPct(p.pct); setUseCustom(false); }}
              className={clsx(
                "rounded-lg border py-2 font-mono text-xs font-bold transition-all duration-150",
                !useCustom && bidPct === p.pct
                  ? "border-mega-cyan bg-mega-cyan/15 text-mega-cyan"
                  : "border-mega-border text-mega-muted hover:border-mega-cyan/50 hover:text-mega-cyan"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={maxBid}
            placeholder={`Custom (1 – ${maxBid})`}
            value={useCustom ? customBid : ""}
            onChange={(e) => { setCustomBid(e.target.value); setUseCustom(true); }}
            onFocus={() => setUseCustom(true)}
            className="
              flex-1 bg-mega-bg border border-mega-border rounded-lg
              px-3 py-2 text-mega-text font-mono text-sm
              placeholder:text-mega-muted/40
              focus:outline-none focus:border-mega-cyan/50
              transition-colors
            "
          />
          <div className="text-right text-[10px] font-mono leading-tight text-mega-muted whitespace-nowrap">
            <div className="text-mega-mint">+{computedBid.toLocaleString()} win</div>
            <div className="text-mega-coral">−{computedBid.toLocaleString()} lose</div>
          </div>
        </div>
      </div>

      {/* HIGHER / LOWER buttons */}
      <div className="grid grid-cols-2 gap-4">

        {/* HIGHER */}
        <button
          onClick={() => handlePredict(0)}
          disabled={isPending || displayPrice === 0}
          className={clsx(
            "relative rounded-xl border-2 p-5 flex flex-col items-center gap-2",
            "transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
            chosen === 0 && isPending
              ? "border-mega-mint bg-mega-mint/20"
              : "border-mega-mint/40 hover:border-mega-mint hover:bg-mega-mint/10 hover:shadow-[0_0_20px_#90D79F30]"
          )}
        >
          <span className="text-4xl">▲</span>
          <span className="font-mono font-black text-mega-mint text-xl tracking-wider">HIGHER</span>
          <span className="text-[10px] text-mega-mint/60 font-mono">+{computedBid.toLocaleString()} pts</span>
          {chosen === 0 && isPending && (
            <div className="absolute inset-0 rounded-xl flex items-center justify-center bg-mega-bg/80 backdrop-blur-sm">
              <div className="font-mono text-mega-mint text-sm animate-pulse">Confirm in MetaMask…</div>
            </div>
          )}
        </button>

        {/* LOWER */}
        <button
          onClick={() => handlePredict(1)}
          disabled={isPending || displayPrice === 0}
          className={clsx(
            "relative rounded-xl border-2 p-5 flex flex-col items-center gap-2",
            "transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
            chosen === 1 && isPending
              ? "border-mega-coral bg-mega-coral/20"
              : "border-mega-coral/40 hover:border-mega-coral hover:bg-mega-coral/10 hover:shadow-[0_0_20px_#F5949D30]"
          )}
        >
          <span className="text-4xl">▼</span>
          <span className="font-mono font-black text-mega-coral text-xl tracking-wider">LOWER</span>
          <span className="text-[10px] text-mega-coral/60 font-mono">−{computedBid.toLocaleString()} pts</span>
          {chosen === 1 && isPending && (
            <div className="absolute inset-0 rounded-xl flex items-center justify-center bg-mega-bg/80 backdrop-blur-sm">
              <div className="font-mono text-mega-coral text-sm animate-pulse">Confirm in MetaMask…</div>
            </div>
          )}
        </button>
      </div>

      {/* Errors */}
      {error && (
        <p className="text-mega-coral text-xs font-mono text-center">
          {(error as Error).message?.includes("BidTooHigh")
            ? "Bid exceeds your balance!"
            : (error as Error).message?.includes("HasActivePrediction")
            ? "You already have an active prediction!"
            : (error as Error).message?.slice(0, 100)}
        </p>
      )}

      <p className="text-center text-mega-muted/40 text-[10px] font-mono">
        Score-based · No real funds · MegaETH Testnet
      </p>
    </div>
  );
}
