"use client";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { usePlayerStats, useSetUsername } from "@/hooks/usePredictWars";

interface Props {
  onDone: () => void;
}

export default function UsernameModal({ onDone }: Props) {
  const { address } = useAccount();
  const stats = usePlayerStats(address);
  const { setUsername, isPending, isSuccess, error } = useSetUsername();
  const [name, setName] = useState("");
  const [visible, setVisible] = useState(false);

  // Show once wallet is connected AND player has no username yet
  useEffect(() => {
    if (!address) return;
    // stats===null means still loading; stats.username==="" means not set
    if (stats !== null && !stats.username) {
      // Small delay so the page settles first
      const t = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(t);
    }
    if (stats?.username) {
      // Already has a username — skip
      onDone();
    }
  }, [address, stats?.username, stats]); // eslint-disable-line react-hooks/exhaustive-deps

  // On success, close after brief delay
  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => { setVisible(false); onDone(); }, 800);
    }
  }, [isSuccess]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSkip = () => { setVisible(false); onDone(); };
  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setUsername(trimmed);
  };

  if (!visible) return null;

  return (
    // Backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-mega-bg/80 backdrop-blur-md"
        onClick={handleSkip}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-mega-border bg-mega-surface shadow-2xl animate-slide-up">
        {/* Top accent */}
        <div className="h-1 rounded-t-2xl bg-gradient-to-r from-mega-coral via-mega-peach to-mega-mint" />

        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">⚡</div>
            <h2 className="font-mono font-bold text-mega-text text-xl mb-1">
              Set Your Name
            </h2>
            <p className="font-mono text-mega-muted text-sm">
              This is how you&apos;ll appear on the leaderboard.
              <br />
              <span className="text-mega-cyan">Stored on-chain</span> — set once, never asked again.
            </p>
          </div>

          {/* Input */}
          <div className="mb-4">
            <input
              type="text"
              maxLength={32}
              placeholder="Enter display name…"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              autoFocus
              className="
                w-full bg-mega-bg border border-mega-border rounded-xl
                px-4 py-3 text-mega-text font-mono text-base
                placeholder:text-mega-muted/40
                focus:outline-none focus:border-mega-cyan/60
                transition-colors
              "
            />
            <p className="mt-1.5 text-[10px] font-mono text-mega-muted/50 text-right">
              {name.trim().length} / 32
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSkip}
              disabled={isPending}
              className="
                flex-1 py-2.5 rounded-xl border border-mega-border
                font-mono text-sm text-mega-muted
                hover:border-mega-muted/50 hover:text-mega-text
                transition-all duration-150 disabled:opacity-50
              "
            >
              Skip for now
            </button>
            <button
              onClick={handleSubmit}
              disabled={!name.trim() || isPending}
              className="
                flex-1 py-2.5 rounded-xl
                bg-gradient-to-r from-mega-coral to-mega-peach
                font-mono font-bold text-sm text-mega-bg
                hover:opacity-90 active:scale-95
                transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed
              "
            >
              {isPending ? "Saving…" : isSuccess ? "✓ Saved!" : "Set Name →"}
            </button>
          </div>

          {error && (
            <p className="mt-3 text-mega-coral text-xs font-mono text-center">
              {(error as Error).message?.slice(0, 80)}
            </p>
          )}

          <p className="mt-4 text-[10px] font-mono text-mega-muted/40 text-center">
            You can change your name anytime from your stats card.
          </p>
        </div>
      </div>
    </div>
  );
}
