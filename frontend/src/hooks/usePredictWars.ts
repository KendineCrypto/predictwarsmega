"use client";
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useCallback, useEffect, useState } from "react";
import {
  CONTRACT_ADDRESS,
  PREDICT_WARS_ABI,
  priceToContract,
  STARTING_SCORE,
} from "@/lib/contract";
import { megaethTestnet } from "@/lib/wagmi";

export type Direction = 0 | 1; // 0 = UP, 1 = DOWN

export interface ActivePrediction {
  predId:       bigint;
  direction:    Direction;
  entryPrice:   number;
  bid:          bigint;
  resolveAfter: number; // Unix timestamp (seconds)
}

export interface PlayerStats {
  totalPredictions: bigint;
  wins:             bigint;
  score:            bigint;
  username:         string;
  exists:           boolean;
}

export interface LeaderboardEntry {
  address:  string;
  username: string;
  score:    bigint;
  wins:     bigint;
  total:    bigint;
  rank:     number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Contract-wide stats
// ─────────────────────────────────────────────────────────────────────────────
export function useContractStats() {
  const { data: totalPlayers } = useReadContract({
    address: CONTRACT_ADDRESS, abi: PREDICT_WARS_ABI, chainId: megaethTestnet.id,
    functionName: "getTotalPlayers",
  });
  const { data: totalPredictions } = useReadContract({
    address: CONTRACT_ADDRESS, abi: PREDICT_WARS_ABI, chainId: megaethTestnet.id,
    functionName: "getTotalPredictions",
  });
  return {
    totalPlayers:     totalPlayers     ?? 0n,
    totalPredictions: totalPredictions ?? 0n,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Leaderboard
// ─────────────────────────────────────────────────────────────────────────────
export function useLeaderboard() {
  const { data, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESS, abi: PREDICT_WARS_ABI, chainId: megaethTestnet.id,
    functionName: "getLeaderboard",
    query: { refetchInterval: 15_000 },
  });

  let entries: LeaderboardEntry[] = [];
  if (data) {
    const [addrs, usernames, scores, wins, totals] = data;
    entries = addrs
      .map((addr, i) => ({
        address:  addr,
        username: usernames[i] || addr.slice(0, 6) + "…" + addr.slice(-4),
        score: scores[i], wins: wins[i], total: totals[i], rank: 0,
      }))
      .sort((a, b) => (b.score > a.score ? 1 : b.score < a.score ? -1 : 0))
      .map((e, i) => ({ ...e, rank: i + 1 }));
  }
  return { entries, isLoading, refetch };
}

// ─────────────────────────────────────────────────────────────────────────────
// Per-player stats
// ─────────────────────────────────────────────────────────────────────────────
export function usePlayerStats(address?: `0x${string}`) {
  const { data, refetch } = useReadContract({
    address: CONTRACT_ADDRESS, abi: PREDICT_WARS_ABI, chainId: megaethTestnet.id,
    functionName: "playerStats",
    args:  address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 8_000 },
  });
  if (!data) return null;
  const [totalPredictions, wins, score, username, exists] = data;
  // Show 1000 for new players (they'll receive it on first interaction)
  return {
    totalPredictions, wins,
    score:    exists ? score : STARTING_SCORE,
    username, exists,
    refetch,
  } as PlayerStats & { refetch: () => void };
}

// ─────────────────────────────────────────────────────────────────────────────
// Active prediction (fast polling: 2s)
// ─────────────────────────────────────────────────────────────────────────────
export function useActivePrediction(address?: `0x${string}`) {
  const { data, refetch } = useReadContract({
    address: CONTRACT_ADDRESS, abi: PREDICT_WARS_ABI, chainId: megaethTestnet.id,
    functionName: "getActivePrediction",
    args:  address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 2_000 }, // 2s for fast pickup
  });

  let active: ActivePrediction | null = null;
  if (data) {
    const [isActive, predId, direction, entryPrice, bid, resolveAfter] = data;
    if (isActive) {
      active = {
        predId,
        direction:    direction as Direction,
        entryPrice:   Number(entryPrice) / 100,
        bid,
        resolveAfter: Number(resolveAfter),
      };
    }
  }
  return { active, refetch };
}

// ─────────────────────────────────────────────────────────────────────────────
// Set username action
// ─────────────────────────────────────────────────────────────────────────────
export function useSetUsername() {
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const setUsername = useCallback(
    (username: string) => {
      writeContract({
        address: CONTRACT_ADDRESS, abi: PREDICT_WARS_ABI,
        functionName: "setUsername", args: [username],
      });
    },
    [writeContract]
  );

  return { setUsername, isPending: isPending || isConfirming, isSuccess, error, reset };
}

// ─────────────────────────────────────────────────────────────────────────────
// Predict action
// ─────────────────────────────────────────────────────────────────────────────
export function usePredict() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const predict = useCallback(
    (direction: Direction, ethPrice: number, bid: bigint) => {
      writeContract({
        address: CONTRACT_ADDRESS, abi: PREDICT_WARS_ABI,
        functionName: "predict",
        args: [direction, priceToContract(ethPrice), bid],
      });
    },
    [writeContract]
  );

  return { predict, hash, isPending: isPending || isConfirming, isSuccess, error };
}

// ─────────────────────────────────────────────────────────────────────────────
// Resolve action
// ─────────────────────────────────────────────────────────────────────────────
export function useResolve() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const resolve = useCallback(
    (predId: bigint, exitPrice: number) => {
      writeContract({
        address: CONTRACT_ADDRESS, abi: PREDICT_WARS_ABI,
        functionName: "resolve",
        args: [predId, priceToContract(exitPrice)],
      });
    },
    [writeContract]
  );

  return { resolve, hash, isPending: isPending || isConfirming, isSuccess, error };
}

// ─────────────────────────────────────────────────────────────────────────────
// Countdown — accepts resolveAfter timestamp (seconds)
// ─────────────────────────────────────────────────────────────────────────────
export function useCountdown(resolveAfter: number) {
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, resolveAfter - Math.floor(Date.now() / 1000))
  );

  useEffect(() => {
    if (!resolveAfter) return;
    const tick = () =>
      setRemaining(Math.max(0, resolveAfter - Math.floor(Date.now() / 1000)));
    tick();
    const id = setInterval(tick, 500); // 500ms for snappy UI
    return () => clearInterval(id);
  }, [resolveAfter]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  return { remaining, formatted: `${mm}:${ss}`, expired: remaining === 0 };
}
