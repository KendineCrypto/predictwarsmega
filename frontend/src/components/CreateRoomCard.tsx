"use client";
import { useState } from "react";
import { ShieldIcon, UsersIcon, CoinsIcon, ZapIcon, LockIcon, XIcon } from "@/components/Icons";

const FEATURES = [
  {
    icon: <LockIcon className="w-4 h-4 text-mega-cyan" />,
    title: "Private invite-only rooms",
    desc: "Only your invited opponent can join — no randos.",
  },
  {
    icon: <UsersIcon className="w-4 h-4 text-mega-mint" />,
    title: "1v1 Head-to-Head battles",
    desc: "Both players predict the same window. Best call wins.",
  },
  {
    icon: <CoinsIcon className="w-4 h-4 text-mega-peach" />,
    title: "Custom wager amounts",
    desc: "Set your stake. Winner takes all from the pot.",
  },
  {
    icon: <ZapIcon className="w-4 h-4 text-mega-coral" />,
    title: "Instant on-chain resolution",
    desc: "Results settled in seconds on MegaETH.",
  },
];

export default function CreateRoomCard() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ── Card ─────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-mega-border bg-mega-surface/60 p-5 relative overflow-hidden">
        {/* Subtle gradient bg */}
        <div className="absolute inset-0 bg-gradient-to-br from-mega-cyan/4 via-transparent to-mega-coral/4 pointer-events-none" />

        <div className="relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-[10px] text-mega-muted uppercase tracking-widest">
              Multiplayer
            </span>
            <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full border border-mega-peach/50 text-mega-peach bg-mega-peach/10 tracking-widest">
              SOON
            </span>
          </div>

          {/* Icon */}
          <div className="w-11 h-11 rounded-xl border border-mega-border bg-mega-bg/60 flex items-center justify-center mb-4">
            <ShieldIcon className="w-5 h-5 text-mega-cyan" />
          </div>

          {/* Title + desc */}
          <h3 className="font-mono font-bold text-mega-text mb-1.5">Create Room</h3>
          <p className="font-mono text-xs text-mega-muted/80 leading-relaxed mb-5">
            Challenge rivals to private head-to-head prediction battles and wager your points.
          </p>

          {/* CTA */}
          <button
            onClick={() => setOpen(true)}
            className="
              w-full py-2.5 rounded-xl
              border border-mega-cyan/30 text-mega-cyan
              font-mono text-xs font-bold tracking-wider
              hover:border-mega-cyan/70 hover:bg-mega-cyan/8
              transition-all duration-200
            "
          >
            See What's Coming →
          </button>
        </div>
      </div>

      {/* ── Modal ────────────────────────────────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-mega-bg/85 backdrop-blur-md animate-fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="w-full max-w-md rounded-2xl border border-mega-border bg-mega-surface shadow-2xl overflow-hidden">

            {/* Modal header */}
            <div className="flex items-start justify-between px-6 pt-6 pb-5 border-b border-mega-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-mega-cyan/10 border border-mega-cyan/25 flex items-center justify-center flex-shrink-0">
                  <ShieldIcon className="w-5 h-5 text-mega-cyan" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-mono font-bold text-mega-text">Private Battle Rooms</h2>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded-full border border-mega-peach/50 text-mega-peach bg-mega-peach/10">
                      V1 · COMING SOON
                    </span>
                  </div>
                  <p className="font-mono text-[10px] text-mega-muted/60 mt-0.5 uppercase tracking-widest">
                    Multiplayer Mode
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-mega-muted/50 hover:text-mega-text transition-colors p-0.5 mt-0.5"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              <p className="font-mono text-sm text-mega-muted leading-relaxed mb-5">
                Create <span className="text-mega-text font-semibold">private rooms</span> and battle opponents in real-time ETH prediction duels.
                Invite a rival, set your wager, and let the best predictor walk away with the points.
              </p>

              {/* Feature list */}
              <div className="space-y-2.5 mb-6">
                {FEATURES.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-xl border border-mega-border/70 bg-mega-bg/50 px-4 py-3"
                  >
                    <div className="mt-0.5 flex-shrink-0">{f.icon}</div>
                    <div>
                      <div className="font-mono text-xs font-semibold text-mega-text mb-0.5">{f.title}</div>
                      <div className="font-mono text-[11px] text-mega-muted/70">{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Divider + note */}
              <div className="rounded-xl border border-mega-peach/20 bg-mega-peach/5 px-4 py-3 mb-5">
                <p className="font-mono text-xs text-mega-peach/80 text-center">
                  This feature is under active development and will ship in V1.
                  <br />
                  Keep climbing the leaderboard — it matters.
                </p>
              </div>

              {/* Close */}
              <button
                onClick={() => setOpen(false)}
                className="
                  w-full py-3 rounded-xl
                  bg-gradient-to-r from-mega-coral to-mega-peach
                  font-mono font-black text-sm text-mega-bg
                  hover:opacity-90 active:scale-[0.98]
                  transition-all duration-200
                "
              >
                Got It — Back to Playing
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
