"use client";
import { useEffect, useRef, useState } from "react";
import { useEthPrice } from "@/hooks/useEthPrice";
import Sparkline from "./Sparkline";

function formatPrice(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface Props {
  entryPrice?: number; // when set: draw the lock line on the chart
}

export default function PriceCard({ entryPrice }: Props) {
  const { price, prevPrice, change24h, history, loading } = useEthPrice();
  const isUp   = price >= prevPrice;
  const isPos  = change24h >= 0;
  const [flash, setFlash] = useState<"up" | "down" | null>(null);
  const prevRef = useRef(price);

  // Flash the price number only on meaningful change (>$0.005) — avoids
  // constant flashing from the lerp micro-updates
  useEffect(() => {
    if (price === 0 || prevRef.current === 0) { prevRef.current = price; return; }
    if (Math.abs(price - prevRef.current) > 0.005) {
      setFlash(price > prevRef.current ? "up" : "down");
      const t = setTimeout(() => setFlash(null), 600);
      prevRef.current = price;
      return () => clearTimeout(t);
    }
  }, [price]);

  const sparkColor = isUp ? "#90D79F" : "#F5949D";
  const hasEntry   = entryPrice !== undefined && entryPrice > 0;

  return (
    <div className="
      relative rounded-2xl border border-mega-border
      bg-mega-surface/60 backdrop-blur-sm
      overflow-hidden
    ">
      {/* Grid bg */}
      <div className="absolute inset-0 bg-grid-pattern bg-grid-sm opacity-20 pointer-events-none" />

      {/* ── Top: badge + price ──────────────────────────────────────────── */}
      <div className="relative px-6 pt-6 pb-3">
        <div className="flex items-center gap-2 mb-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mega-mint opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-mega-mint" />
          </span>
          <span className="text-xs font-mono text-mega-muted tracking-widest uppercase">
            Live ETH/USD
          </span>
          {hasEntry && (
            <span className="ml-2 text-[10px] font-mono border border-mega-peach/50 text-mega-peach px-2 py-0.5 rounded-full animate-pulse">
              ⏳ Prediction Active
            </span>
          )}
        </div>

        {/* Price + direction arrow */}
        <div className="flex items-end gap-4 mb-1">
          <div
            className={`
              font-mono text-5xl font-bold tracking-tight transition-colors duration-300
              ${flash === "up"   ? "text-mega-mint"  : ""}
              ${flash === "down" ? "text-mega-coral" : ""}
              ${!flash           ? "text-mega-text"  : ""}
            `}
          >
            {loading && price === 0 ? (
              <span className="opacity-40">Loading…</span>
            ) : (
              <>
                <span className="text-mega-muted text-3xl">$</span>
                {formatPrice(price)}
              </>
            )}
          </div>

          {price > 0 && (
            <div className={`text-2xl mb-1 transition-colors ${isUp ? "text-mega-mint" : "text-mega-coral"}`}>
              {isUp ? "▲" : "▼"}
            </div>
          )}
        </div>

        {/* 24h change */}
        {price > 0 && (
          <div className={`font-mono text-sm ${isPos ? "text-mega-mint" : "text-mega-coral"}`}>
            {isPos ? "+" : ""}{change24h.toFixed(2)}% (24h)
          </div>
        )}
      </div>

      {/* ── Chart — full card width, tall ───────────────────────────────── */}
      <div className="w-full px-3 pb-2">
        <Sparkline
          data={history}
          height={210}
          upColor={sparkColor}
          downColor={sparkColor}
          entryPrice={hasEntry ? entryPrice : undefined}
        />
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <div className="px-6 pb-4">
        <p className="text-[10px] font-mono text-mega-muted/50 tracking-widest">
          SOURCE: BINANCE · SMOOTH REALTIME · POLL 5s
        </p>
      </div>
    </div>
  );
}
