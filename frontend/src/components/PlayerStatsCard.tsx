"use client";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { usePlayerStats, useSetUsername } from "@/hooks/usePredictWars";
import { STARTING_SCORE } from "@/lib/contract";
import { PencilIcon } from "@/components/Icons";

function winRate(wins: bigint, total: bigint): number {
  if (total === 0n) return 0;
  return Math.round((Number(wins) / Number(total)) * 100);
}

export default function PlayerStatsCard() {
  const { address, isConnected } = useAccount();
  const stats = usePlayerStats(address);
  const { setUsername, isPending: saving, isSuccess: saved, error: saveError } = useSetUsername();

  const [editing,  setEditing]  = useState(false);
  const [newName,  setNewName]  = useState("");

  // Close edit form after save succeeds
  useEffect(() => {
    if (saved) setEditing(false);
  }, [saved]);

  if (!isConnected) return null;

  const score    = stats?.score ?? STARTING_SCORE;
  const wins     = stats?.wins  ?? 0n;
  const total    = stats?.totalPredictions ?? 0n;
  const wr       = winRate(wins, total);
  const isNew    = !stats?.exists;
  const username = stats?.username ?? "";

  const handleSave = () => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed.length > 32) return;
    setUsername(trimmed);
  };

  return (
    <div className="rounded-2xl border border-mega-border bg-mega-surface/60 p-5 animate-fade-in">
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-mono text-xs text-mega-muted uppercase tracking-widest">Your Stats</h3>
        {isNew && (
          <span className="text-[10px] font-mono border border-mega-mint/40 text-mega-mint px-2 py-0.5 rounded-full">
            New Player — 1,000 pts starting
          </span>
        )}
      </div>

      {/* Username row */}
      {!editing ? (
        <div className="flex items-center gap-2 mb-4">
          {username ? (
            <>
              <span className="font-mono text-mega-text font-bold text-sm truncate max-w-[160px]">
                {username}
              </span>
              <button
                onClick={() => { setNewName(username); setEditing(true); }}
                className="text-mega-muted/50 hover:text-mega-cyan transition-colors ml-1 p-0.5"
                title="Edit name"
              >
                <PencilIcon className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <button
              onClick={() => { setNewName(""); setEditing(true); }}
              className="font-mono text-xs text-mega-cyan/70 hover:text-mega-cyan border border-mega-cyan/30 hover:border-mega-cyan/60 rounded-lg px-3 py-1 transition-all duration-150"
            >
              + Set display name
            </button>
          )}
        </div>
      ) : (
        <div className="mb-4 space-y-2">
          <input
            type="text"
            maxLength={32}
            placeholder="Display name…"
            value={newName}
            autoFocus
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") setEditing(false);
            }}
            className="
              w-full bg-mega-bg border border-mega-cyan/40 rounded-lg
              px-3 py-2 text-mega-text font-mono text-sm
              placeholder:text-mega-muted/40
              focus:outline-none focus:border-mega-cyan/70
              transition-colors
            "
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={!newName.trim() || saving}
              className="
                flex-1 py-1.5 rounded-lg
                bg-gradient-to-r from-mega-coral to-mega-peach
                font-mono font-bold text-xs text-mega-bg
                hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed
                transition-all duration-150
              "
            >
              {saving ? "Saving…" : "Save →"}
            </button>
            <button
              onClick={() => setEditing(false)}
              disabled={saving}
              className="
                flex-1 py-1.5 rounded-lg border border-mega-border
                font-mono text-xs text-mega-muted hover:text-mega-text
                transition-all duration-150 disabled:opacity-40
              "
            >
              Cancel
            </button>
          </div>
          {saveError && (
            <p className="text-mega-coral text-[10px] font-mono">
              {(saveError as Error).message?.slice(0, 60)}
            </p>
          )}
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-3">
        {/* Score */}
        <div className="text-center">
          <div className="font-mono text-2xl font-bold text-mega-peach">
            {Number(score).toLocaleString()}
          </div>
          <div className="font-mono text-[10px] text-mega-muted mt-1 uppercase tracking-wider">Score</div>
        </div>
        {/* Wins */}
        <div className="text-center">
          <div className="font-mono text-2xl font-bold text-mega-mint">{wins.toString()}</div>
          <div className="font-mono text-[10px] text-mega-muted mt-1 uppercase tracking-wider">Wins</div>
        </div>
        {/* Total */}
        <div className="text-center">
          <div className="font-mono text-2xl font-bold text-mega-text">{total.toString()}</div>
          <div className="font-mono text-[10px] text-mega-muted mt-1 uppercase tracking-wider">Total</div>
        </div>
        {/* Win rate */}
        <div className="text-center">
          <div className={`font-mono text-2xl font-bold ${wr >= 50 ? "text-mega-mint" : total === 0n ? "text-mega-muted" : "text-mega-coral"}`}>
            {total === 0n ? "—" : `${wr}%`}
          </div>
          <div className="font-mono text-[10px] text-mega-muted mt-1 uppercase tracking-wider">Win%</div>
        </div>
      </div>

      {/* Win-rate bar */}
      <div className="mt-4">
        <div className="h-1.5 bg-mega-border rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${wr >= 50 ? "bg-mega-mint" : "bg-mega-coral"}`}
            style={{ width: total === 0n ? "0%" : `${wr}%` }}
          />
        </div>
      </div>
    </div>
  );
}
