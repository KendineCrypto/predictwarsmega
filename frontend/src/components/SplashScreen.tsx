"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { BoltIcon, TrophyIcon, CoinsIcon } from "@/components/Icons";

export default function SplashScreen({ onEnter }: { onEnter: () => void }) {
  const [visible,    setVisible]    = useState(false);
  const [exiting,    setExiting]    = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Skip if user already entered before
    if (typeof window !== "undefined" && localStorage.getItem("pw_entered")) {
      onEnter();
      return;
    }
    // Slight delay before mounting animation
    const t1 = setTimeout(() => setVisible(true), 50);
    const t2 = setTimeout(() => setShowButton(true), 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleEnter = () => {
    setExiting(true);
    localStorage.setItem("pw_entered", "1");
    setTimeout(() => {
      setVisible(false);
      onEnter();
    }, 700);
  };

  if (!visible) return null;

  return (
    <div
      className={`
        fixed inset-0 z-[100] flex flex-col items-center justify-center
        bg-mega-bg transition-all duration-700 ease-in-out
        ${exiting ? "opacity-0 scale-105" : "opacity-100 scale-100"}
      `}
    >
      {/* Animated grid */}
      <div className="absolute inset-0 grid-bg opacity-60 pointer-events-none" />

      {/* Ambient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-mega-coral/8 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-mega-mint/8 rounded-full blur-3xl animate-pulse-slow pointer-events-none" style={{ animationDelay: "1.5s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-mega-cyan/4 rounded-full blur-3xl pointer-events-none" />

      {/* Content */}
      <div className={`
        relative z-10 text-center px-8 transition-all duration-1000
        ${visible && !exiting ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
      `}>
        {/* Logo */}
        <div className="mb-8 relative inline-block" style={{
          filter: "drop-shadow(0 0 40px #F5AF9480) drop-shadow(0 0 80px #90D79F40)"
        }}>
          <Image
            src="/logo.png"
            alt="PredictWars"
            width={120}
            height={120}
            className="object-contain select-none"
            priority
          />
        </div>

        {/* Title */}
        <h1 className="font-mono font-black mb-3 tracking-tight select-none" style={{
          fontSize: "clamp(3rem, 10vw, 7rem)",
          lineHeight: 1,
        }}>
          <span
            className="text-mega-text"
            style={{ textShadow: "0 0 60px rgba(236,232,232,0.15)" }}
          >
            PREDICT
          </span>
          <br />
          <span
            className="text-mega-coral"
            style={{ textShadow: "0 0 40px #F5949D60" }}
          >
            WARS
          </span>
        </h1>

        {/* Tagline */}
        <p className="font-mono text-mega-muted text-sm md:text-base tracking-[0.2em] uppercase mb-2 mt-4">
          ETH Price Prediction Game
        </p>
        <div className="flex items-center justify-center gap-2 mb-10">
          <span className="w-1.5 h-1.5 rounded-full bg-mega-mint animate-pulse" />
          <span className="font-mono text-xs text-mega-muted/60 tracking-widest uppercase">
            MegaETH Testnet · Score-Based · No Real Funds
          </span>
        </div>

        {/* Stats pills */}
        <div className="flex items-center justify-center gap-4 mb-10 flex-wrap">
          {[
            { icon: <BoltIcon className="w-4 h-4 text-mega-peach" />,  text: "30-Second Rounds" },
            { icon: <TrophyIcon className="w-4 h-4 text-mega-peach" />, text: "On-Chain Leaderboard" },
            { icon: <CoinsIcon className="w-4 h-4 text-mega-peach" />,  text: "Start with 1,000 pts" },
          ].map((item) => (
            <div
              key={item.text}
              className="flex items-center gap-2 border border-mega-border bg-mega-surface/60 rounded-full px-4 py-1.5 backdrop-blur-sm"
            >
              {item.icon}
              <span className="font-mono text-xs text-mega-muted">{item.text}</span>
            </div>
          ))}
        </div>

        {/* Enter button */}
        <div className={`transition-all duration-500 ${showButton ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <button
            onClick={handleEnter}
            className="
              relative group
              px-10 py-4 rounded-2xl
              bg-gradient-to-r from-mega-coral to-mega-peach
              text-mega-bg font-mono font-black text-lg tracking-widest uppercase
              hover:scale-105 active:scale-95
              transition-all duration-200
              shadow-[0_0_40px_#F5949D40]
              hover:shadow-[0_0_60px_#F5949D60]
            "
          >
            START PLAYING →
          </button>
          <p className="mt-4 font-mono text-[10px] text-mega-muted/40 tracking-wider">
            Connect MetaMask when prompted
          </p>
        </div>
      </div>

      {/* Bottom MegaETH credit */}
      <div className="absolute bottom-6 left-0 right-0 text-center">
        <p className="font-mono text-[10px] text-mega-muted/30 tracking-widest uppercase">
          Built on <span className="text-mega-coral/50">MegaETH</span> Testnet · &lt;10ms blocks · 100k+ TPS
        </p>
      </div>
    </div>
  );
}
