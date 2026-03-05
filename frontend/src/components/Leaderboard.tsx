"use client";
import { useState } from "react";
import { useAccount } from "wagmi";
import { useLeaderboard } from "@/hooks/usePredictWars";
import { TrophyIcon, RefreshIcon, SearchIcon } from "@/components/Icons";

const RANK_COLORS = [
  "text-yellow-500 border-yellow-500/50 bg-yellow-500/10",
  "text-slate-400  border-slate-400/50  bg-slate-400/10",
  "text-amber-600  border-amber-600/50  bg-amber-600/10",
];

const PODIUM_LABELS = [
  { rank: 1, height: "h-20", color: "border-yellow-500/40 bg-yellow-500/5",  label: "1st", dot: "bg-yellow-500" },
  { rank: 2, height: "h-14", color: "border-slate-400/40  bg-slate-400/5",   label: "2nd", dot: "bg-slate-400" },
  { rank: 3, height: "h-10", color: "border-amber-600/40  bg-amber-600/5",   label: "3rd", dot: "bg-amber-600" },
];

function shortAddr(addr: string) {
  return addr.slice(0, 6) + "…" + addr.slice(-4);
}
function winRate(wins: bigint, total: bigint): string {
  if (total === 0n) return "—";
  return Math.round((Number(wins) / Number(total)) * 100) + "%";
}

/* ── Empty / few-players state ─────────────────────────────────────────── */
function EmptyState({ entries }: { entries: ReturnType<typeof useLeaderboard>["entries"] }) {
  const filled = entries.slice(0, 3);

  return (
    <div className="py-10 px-6 text-center">
      {/* Podium visualization */}
      <div className="flex items-end justify-center gap-3 mb-8">
        {[PODIUM_LABELS[1], PODIUM_LABELS[0], PODIUM_LABELS[2]].map((p) => {
          const player = filled.find((e) => e.rank === p.rank);
          return (
            <div key={p.rank} className="flex flex-col items-center gap-2 w-24">
              {/* Avatar slot */}
              <div className={`
                w-12 h-12 rounded-full border-2 flex items-center justify-center
                transition-all duration-300
                ${player
                  ? "border-mega-cyan/60 bg-mega-cyan/10"
                  : "border-dashed border-mega-border bg-mega-surface/40"}
              `}>
                {player ? (
                  <span className="font-mono text-xs font-bold text-mega-cyan truncate px-1">
                    {player.username.slice(0, 3).toUpperCase() || "?"}
                  </span>
                ) : (
                  <span className="font-mono text-lg text-mega-muted/30">?</span>
                )}
              </div>

              {/* Username / empty */}
              <span className="font-mono text-[10px] text-mega-muted/60 truncate w-full text-center">
                {player ? player.username : "Open"}
              </span>

              {/* Bar */}
              <div className={`w-full rounded-t-lg border ${p.color} ${p.height} flex items-center justify-center`}>
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${p.dot} ${player ? "opacity-100" : "opacity-20 animate-pulse"}`} />
                  <span className="font-mono text-[10px] font-bold" style={{ color: "inherit" }}>{p.label}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Message */}
      <div className="max-w-xs mx-auto">
        {entries.length === 0 ? (
          <>
            <p className="font-mono font-bold text-mega-text mb-1">No rankings yet</p>
            <p className="font-mono text-xs text-mega-muted leading-relaxed">
              Be the first player to predict and claim the top spot. Connect your wallet and start playing!
            </p>
          </>
        ) : (
          <>
            <p className="font-mono font-bold text-mega-text mb-1">
              {3 - filled.length} spot{3 - filled.length !== 1 ? "s" : ""} remaining in the top 3
            </p>
            <p className="font-mono text-xs text-mega-muted leading-relaxed">
              The leaderboard is just getting started. Keep predicting to climb the ranks.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────────────── */
export default function Leaderboard() {
  const { entries, isLoading, refetch } = useLeaderboard();
  const { address } = useAccount();
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? entries.filter((e) =>
        e.username.toLowerCase().includes(search.toLowerCase()) ||
        e.address.toLowerCase().includes(search.toLowerCase())
      )
    : entries;

  const showEmptyState = !isLoading && entries.length < 4;

  return (
    <div className="rounded-2xl border border-mega-border bg-mega-surface/60 overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-mega-border">
        <div className="flex items-center gap-3">
          <TrophyIcon className="w-5 h-5 text-mega-peach" />
          <h2 className="font-mono font-bold text-mega-text text-lg">Rankings</h2>
          {!isLoading && entries.length > 0 && (
            <span className="font-mono text-[10px] text-mega-muted border border-mega-border rounded-full px-2.5 py-0.5">
              {entries.length} {entries.length === 1 ? "player" : "players"}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-mega-muted/40 pointer-events-none" />
            <input
              type="text"
              placeholder="Search player…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
                pl-8 pr-3 py-1.5 rounded-lg
                bg-mega-bg border border-mega-border
                text-mega-text font-mono text-xs
                placeholder:text-mega-muted/30
                focus:outline-none focus:border-mega-cyan/50
                transition-colors w-44
              "
            />
          </div>
          <button
            onClick={() => refetch()}
            className="p-1.5 text-mega-muted hover:text-mega-cyan transition-colors rounded-lg hover:bg-mega-surface"
            title="Refresh"
          >
            <RefreshIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="py-16 text-center">
          <TrophyIcon className="w-8 h-8 text-mega-muted/20 mx-auto mb-3 animate-pulse" />
          <span className="text-mega-muted font-mono text-sm animate-pulse">Loading rankings…</span>
        </div>

      ) : showEmptyState && !search ? (
        <EmptyState entries={entries} />

      ) : filtered.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-mega-muted font-mono text-sm mb-2">
            No players matching &ldquo;{search}&rdquo;
          </p>
          <button
            onClick={() => setSearch("")}
            className="font-mono text-xs text-mega-cyan/70 hover:text-mega-cyan transition-colors"
          >
            Clear search
          </button>
        </div>

      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-mega-border bg-mega-bg/30">
                <th className="text-left   px-5 py-3 text-[10px] font-mono text-mega-muted/50 uppercase tracking-widest w-16">#</th>
                <th className="text-left   px-5 py-3 text-[10px] font-mono text-mega-muted/50 uppercase tracking-widest">Player</th>
                <th className="text-right  px-5 py-3 text-[10px] font-mono text-mega-muted/50 uppercase tracking-widest">Score</th>
                <th className="text-right  px-5 py-3 text-[10px] font-mono text-mega-muted/50 uppercase tracking-widest hidden sm:table-cell">Wins</th>
                <th className="text-right  px-5 py-3 text-[10px] font-mono text-mega-muted/50 uppercase tracking-widest hidden sm:table-cell">Total</th>
                <th className="text-right  px-5 py-3 text-[10px] font-mono text-mega-muted/50 uppercase tracking-widest">Win%</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => {
                const isMe = address?.toLowerCase() === entry.address.toLowerCase();
                return (
                  <tr
                    key={entry.address}
                    className={`
                      border-b border-mega-border/30 transition-colors
                      ${isMe ? "bg-mega-cyan/5 border-l-2 border-l-mega-cyan" : "hover:bg-mega-surface/80"}
                    `}
                  >
                    <td className="px-5 py-3.5">
                      {entry.rank <= 3 ? (
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full border font-mono font-bold text-xs ${RANK_COLORS[entry.rank - 1]}`}>
                          {entry.rank}
                        </span>
                      ) : (
                        <span className="font-mono text-sm text-mega-muted">{entry.rank}</span>
                      )}
                    </td>

                    <td className="px-5 py-3.5">
                      <div className={`font-mono text-sm font-medium ${isMe ? "text-mega-cyan" : "text-mega-text"}`}>
                        {entry.username}
                        {isMe && (
                          <span className="ml-2 text-[10px] border border-mega-cyan/40 text-mega-cyan px-1.5 py-0.5 rounded-full">YOU</span>
                        )}
                      </div>
                      <div className="font-mono text-[10px] text-mega-muted/40 mt-0.5">{shortAddr(entry.address)}</div>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <span className={`font-mono font-bold text-sm ${entry.rank === 1 ? "text-mega-peach" : "text-mega-text"}`}>
                        {Number(entry.score).toLocaleString()}
                      </span>
                      <span className="font-mono text-mega-muted text-xs ml-1">pts</span>
                    </td>

                    <td className="px-5 py-3.5 text-right font-mono text-sm text-mega-mint hidden sm:table-cell">
                      {entry.wins.toString()}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono text-sm text-mega-muted hidden sm:table-cell">
                      {entry.total.toString()}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <span className={`font-mono text-sm ${
                        Number(entry.total) > 0 && Number(entry.wins) / Number(entry.total) >= 0.5
                          ? "text-mega-mint" : "text-mega-muted"
                      }`}>
                        {winRate(entry.wins, entry.total)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <div className="px-6 py-3 border-t border-mega-border/50 flex items-center justify-between">
        <span className="text-[10px] font-mono text-mega-muted/40">
          {search && filtered.length !== entries.length
            ? `${filtered.length} of ${entries.length} players`
            : entries.length > 0 ? `${entries.length} players total` : ""}
        </span>
        <span className="text-[10px] font-mono text-mega-muted/40">
          Win = +bid pts · Loss = −bid pts
        </span>
      </div>
    </div>
  );
}
