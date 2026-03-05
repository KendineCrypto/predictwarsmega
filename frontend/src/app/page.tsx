"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useAccount } from "wagmi";
import Header from "@/components/Header";
import PriceCard from "@/components/PriceCard";
import PredictPanel from "@/components/PredictPanel";
import ActivePrediction from "@/components/ActivePrediction";
import Leaderboard from "@/components/Leaderboard";
import PlayerStatsCard from "@/components/PlayerStatsCard";
import CreateRoomCard from "@/components/CreateRoomCard";
import SplashScreen from "@/components/SplashScreen";
import UsernameModal from "@/components/UsernameModal";
import { EyeIcon, BoltIcon, TrophyIcon } from "@/components/Icons";
import { useActivePrediction } from "@/hooks/usePredictWars";

export default function HomePage() {
  const { address, isConnected } = useAccount();
  const { active, refetch } = useActivePrediction(address);
  const [key,                    setKey]                    = useState(0);
  const [splashed,               setSplashed]               = useState(false);
  const [usernameDone,           setUsernameDone]           = useState(false);
  const [optimisticResolveAfter, setOptimisticResolveAfter] = useState<number | null>(null);

  useEffect(() => {
    if (active) setOptimisticResolveAfter(null);
  }, [active]);

  const handlePredicting = (ts: number) => setOptimisticResolveAfter(ts);
  const handlePredicted  = () => refetch();
  const handleResolved   = () => {
    setOptimisticResolveAfter(null);
    setTimeout(() => { refetch(); setKey((k) => k + 1); }, 3500);
  };

  const showActive = isConnected && (!!active || !!optimisticResolveAfter);

  return (
    <div className="min-h-screen bg-mega-bg grid-bg">
      {!splashed && <SplashScreen onEnter={() => setSplashed(true)} />}

      {isConnected && !usernameDone && (
        <UsernameModal onDone={() => setUsernameDone(true)} />
      )}

      <Header />

      {/* Ambient glow orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-mega-coral/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-mega-mint/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-mega-cyan/5 rounded-full blur-3xl" />
      </div>

      <main className="relative z-10 max-w-6xl mx-auto px-4 py-8 space-y-8">

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 border border-mega-border rounded-full px-4 py-1.5 mb-6 bg-mega-surface/50">
            <span className="w-1.5 h-1.5 rounded-full bg-mega-mint animate-pulse" />
            <span className="text-xs font-mono text-mega-muted tracking-widest uppercase">
              MegaETH Testnet · Score-Based · No Real Funds
            </span>
          </div>
          <h1 className="font-mono text-5xl md:text-7xl font-black tracking-tight mb-4">
            <span className="text-mega-text">PREDICT</span>
            <span className="text-mega-coral glow-coral">WARS</span>
          </h1>
          <p className="text-mega-muted font-mono text-base md:text-lg max-w-xl mx-auto">
            Will ETH be higher or lower in 30 seconds?
            <br />
            Predict correctly, earn points, climb the leaderboard.
          </p>
        </div>

        {/* ── Main game grid ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: live price + game panel */}
          <div className="lg:col-span-2 space-y-6">
            <PriceCard entryPrice={active?.entryPrice} />
            <div key={key}>
              {showActive ? (
                <ActivePrediction
                  onResolved={handleResolved}
                  optimisticResolveAfter={optimisticResolveAfter}
                />
              ) : (
                <PredictPanel
                  onPredicting={handlePredicting}
                  onPredicted={handlePredicted}
                />
              )}
            </div>
          </div>

          {/* Right: player stats + create room */}
          <div className="lg:col-span-1 space-y-6">
            <PlayerStatsCard />
            <CreateRoomCard />
          </div>
        </div>

        {/* ── Leaderboard — full-width module ───────────────────────────── */}
        <section>
          <Leaderboard />
        </section>

        {/* ── How It Works ──────────────────────────────────────────────── */}
        <HowItWorks />

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <footer className="pb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Image src="/logo.png" alt="" width={20} height={20} className="object-contain opacity-50" />
            <span className="font-mono text-mega-muted text-sm">
              Built on <span className="text-mega-coral">MegaETH</span> Testnet
            </span>
          </div>
          <p className="text-mega-muted/40 font-mono text-xs">
            Score-based game · No real funds at stake · V0 · Oracle integration in V1
          </p>
          <div className="flex items-center justify-center gap-6 mt-4">
            <a href="https://megaeth-testnet-v2.blockscout.com" target="_blank" rel="noreferrer"
              className="text-xs font-mono text-mega-muted/50 hover:text-mega-cyan transition-colors">
              MegaETH Explorer ↗
            </a>
            <a href="https://testnet.megaeth.com" target="_blank" rel="noreferrer"
              className="text-xs font-mono text-mega-muted/50 hover:text-mega-cyan transition-colors">
              Get Testnet ETH ↗
            </a>
            <a href="https://docs.megaeth.com" target="_blank" rel="noreferrer"
              className="text-xs font-mono text-mega-muted/50 hover:text-mega-cyan transition-colors">
              MegaETH Docs ↗
            </a>
          </div>
        </footer>

      </main>
    </div>
  );
}

function HowItWorks() {
  return (
    <div className="rounded-2xl border border-mega-border bg-mega-surface/40 p-6">
      <h3 className="font-mono text-xs text-mega-muted uppercase tracking-widest mb-5">
        How It Works
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          {
            step: "01",
            icon: <EyeIcon className="w-5 h-5" />,
            title: "Check the price",
            desc: "Live ETH/USD price feeds directly from Binance.",
            color: "text-mega-cyan",
          },
          {
            step: "02",
            icon: <BoltIcon className="w-5 h-5" />,
            title: "Predict",
            desc: "Will ETH be HIGHER or LOWER in exactly 30 seconds?",
            color: "text-mega-peach",
          },
          {
            step: "03",
            icon: <TrophyIcon className="w-5 h-5" />,
            title: "Earn points",
            desc: "Win your bid in points per correct prediction. Climb the leaderboard!",
            color: "text-mega-mint",
          },
        ].map((item) => (
          <div key={item.step} className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className={`font-mono text-xs ${item.color} opacity-50`}>{item.step}</span>
              <span className={item.color}>{item.icon}</span>
            </div>
            <div className="font-mono text-mega-text text-sm font-semibold">{item.title}</div>
            <div className="font-mono text-mega-muted text-xs leading-relaxed">{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
