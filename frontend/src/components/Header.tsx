"use client";
import Image from "next/image";
import WalletButton from "./WalletButton";
import { useContractStats } from "@/hooks/usePredictWars";

export default function Header() {
  const { totalPlayers, totalPredictions } = useContractStats();

  return (
    <header className="
      sticky top-0 z-50
      border-b border-mega-border
      bg-mega-bg/80 backdrop-blur-md
    ">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="PredictWars"
            width={44}
            height={44}
            className="object-contain"
            priority
          />
          <div>
            <h1 className="font-mono font-bold text-mega-text text-lg leading-none">
              Predict<span className="text-mega-coral">Wars</span>
            </h1>
            <p className="text-[10px] text-mega-muted font-mono tracking-widest uppercase">
              MegaETH Testnet
            </p>
          </div>
        </div>

        {/* Stats pill */}
        <div className="hidden sm:flex items-center gap-4 text-xs font-mono text-mega-muted">
          <span>
            <span className="text-mega-mint">{totalPlayers.toString()}</span> players
          </span>
          <span className="text-mega-border">|</span>
          <span>
            <span className="text-mega-cyan">{totalPredictions.toString()}</span> predictions
          </span>
        </div>

        {/* Wallet */}
        <WalletButton />
      </div>
    </header>
  );
}
