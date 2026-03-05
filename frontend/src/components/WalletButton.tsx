"use client";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { megaethTestnet } from "@/lib/wagmi";
import { AlertTriangleIcon } from "@/components/Icons";

function shortAddr(addr: string) {
  return addr.slice(0, 6) + "…" + addr.slice(-4);
}

export default function WalletButton() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  const isWrongNetwork = isConnected && chain?.id !== megaethTestnet.id;

  if (!isConnected) {
    const connector = connectors[0]; // injected (MetaMask)
    return (
      <button
        onClick={() => connect({ connector })}
        disabled={isPending}
        className="
          px-4 py-2 rounded-lg border border-mega-coral/60
          text-mega-coral font-mono text-sm
          hover:bg-mega-coral/10 hover:border-mega-coral
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          animate-glow-coral
        "
      >
        {isPending ? "Connecting…" : "Connect Wallet"}
      </button>
    );
  }

  if (isWrongNetwork) {
    return (
      <button
        onClick={() => switchChain({ chainId: megaethTestnet.id })}
        className="
          px-4 py-2 rounded-lg border border-yellow-400/60
          text-yellow-400 font-mono text-sm
          hover:bg-yellow-400/10 hover:border-yellow-400
          transition-all duration-200
        "
      >
        <AlertTriangleIcon className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />Switch to MegaETH
      </button>
    );
  }

  return (
    <button
      onClick={() => disconnect()}
      title="Click to disconnect"
      className="
        px-4 py-2 rounded-lg border border-mega-mint/40
        text-mega-mint font-mono text-sm
        hover:bg-mega-coral/10 hover:border-mega-coral hover:text-mega-coral
        transition-all duration-200 group
      "
    >
      <span className="group-hover:hidden">{shortAddr(address!)}</span>
      <span className="hidden group-hover:inline">Disconnect</span>
    </button>
  );
}
