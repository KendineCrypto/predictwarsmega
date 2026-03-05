"use client";
import { useState, useEffect, useRef } from "react";

export interface EthPriceData {
  price:     number;   // smoothly lerped display price  (for chart + UI number)
  rawPrice:  number;   // latest raw Binance price       (USE THIS for on-chain resolve!)
  prevPrice: number;   // previous raw price             (for ▲/▼ direction arrow)
  change24h: number;
  history:   number[]; // pure live ring-buffer          (HISTORY_MAX × LERP_MS of data)
  loading:   boolean;
  error:     string | null;
}

// ── Tuning ───────────────────────────────────────────────────────────────────
const LERP_MS     = 100;   // state-update cadence (ms) — ~10 fps, smooth enough
const LERP_ALPHA  = 0.08;  // per-frame fraction closed → slow, gentle drift
const HISTORY_MAX = 350;   // ~35 s of live data (covers one 30 s prediction window)
const PRICE_POLL  = 5_000; // raw Binance poll interval (ms)

// ── Endpoints ────────────────────────────────────────────────────────────────
const BINANCE_TICKER = "https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT";
const BINANCE_24H    = "https://api.binance.com/api/v3/ticker/24hr?symbol=ETHUSDT";
const COINGECKO      = "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true";

// ─────────────────────────────────────────────────────────────────────────────
// Direct one-shot fetch of the raw Binance price.
// Exported so ActivePrediction can use it at resolve time for maximum accuracy.
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchRawEthPrice(): Promise<number> {
  try {
    const res  = await fetch(BINANCE_TICKER, { cache: "no-store" });
    const data = await res.json();
    return parseFloat(data.price);
  } catch {
    try {
      const res  = await fetch(COINGECKO, { cache: "no-store" });
      const data = await res.json();
      return data.ethereum.usd as number;
    } catch {
      return 0;
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
export function useEthPrice(): EthPriceData {
  // Refs — mutated in intervals, never cause re-renders on their own
  const rawRef     = useRef(0);   // latest API price (no lag)
  const dispRef    = useRef(0);   // lerped displayed price
  const prevRawRef = useRef(0);   // previous API price (for direction)
  const histRef    = useRef<number[]>([]);
  const readyRef   = useRef(false);

  // React state — drives re-renders (only at LERP_MS cadence)
  const [price,     setPrice]     = useState(0);
  const [rawPrice,  setRawPrice]  = useState(0);
  const [prevPrice, setPrevPrice] = useState(0);
  const [change24h, setChange24h] = useState(0);
  const [history,   setHistory]   = useState<number[]>([]);
  const [loading,   setLoading]   = useState(true);

  // ── 1. Raw price poll (every PRICE_POLL ms) ──────────────────────────────
  useEffect(() => {
    const poll = async () => {
      try {
        const res  = await fetch(BINANCE_TICKER, { cache: "no-store" });
        const data = await res.json();
        const raw  = parseFloat(data.price);

        // First load: also grab 24h stats.
        // NOTE: We intentionally do NOT pre-seed history with klines.
        // Klines span 60 min → huge price range → entry-price lock line
        // gets squished against current price, making it invisible.
        // A pure live ring-buffer gives a tight range where the lock line
        // is clearly distinct from the current price.
        if (!readyRef.current) {
          try {
            const res24 = await fetch(BINANCE_24H, { cache: "no-store" });
            const d24   = await res24.json();
            setChange24h(parseFloat(d24.priceChangePercent));
          } catch { /* silent */ }

          // Snap display to raw on first load — no weird initial lerp
          dispRef.current = raw;
          setPrice(raw);
          readyRef.current = true;
        }

        prevRawRef.current = rawRef.current || raw;
        setPrevPrice(prevRawRef.current);
        rawRef.current = raw;
        setRawPrice(raw);
        setLoading(false);
      } catch {
        // CoinGecko fallback
        try {
          const res  = await fetch(COINGECKO, { cache: "no-store" });
          const data = await res.json();
          rawRef.current = data.ethereum.usd as number;
          setRawPrice(rawRef.current);
          setChange24h(data.ethereum.usd_24h_change ?? 0);
          if (!readyRef.current) {
            dispRef.current = rawRef.current;
            setPrice(rawRef.current);
            readyRef.current = true;
          }
          setLoading(false);
        } catch { /* silent */ }
      }
    };

    poll();
    const id = setInterval(poll, PRICE_POLL);
    return () => clearInterval(id);
  }, []);

  // ── 2. Lerp loop — updates display price + ring buffer ──────────────────
  useEffect(() => {
    const id = setInterval(() => {
      const raw = rawRef.current;
      if (raw === 0) return;

      // Gently lerp toward raw price
      const cur  = dispRef.current || raw;
      const next = cur + (raw - cur) * LERP_ALPHA;
      dispRef.current = next;
      setPrice(next);

      // Ring buffer — pure live prices, no historical klines mixed in
      const h       = histRef.current;
      const updated = h.length >= HISTORY_MAX
        ? [...h.slice(1), next]
        : [...h, next];
      histRef.current = updated;
      setHistory(updated);
    }, LERP_MS);

    return () => clearInterval(id);
  }, []);

  // ── 3. 24h refresh every 30 s ───────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const res  = await fetch(BINANCE_24H, { cache: "no-store" });
        const data = await res.json();
        setChange24h(parseFloat(data.priceChangePercent));
      } catch { /* silent */ }
    }, 30_000);
    return () => clearInterval(id);
  }, []);

  return { price, rawPrice, prevPrice, change24h, history, loading, error: null };
}
