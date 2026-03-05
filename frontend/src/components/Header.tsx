"use client";
import Image from "next/image";
import WalletButton from "./WalletButton";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="
      sticky top-0 z-50
      border-b border-mega-border
      bg-mega-bg/80 backdrop-blur-md
    ">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="PredictWars"
            width={40}
            height={40}
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

        {/* Right: theme toggle + wallet */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <WalletButton />
        </div>

      </div>
    </header>
  );
}
