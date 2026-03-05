export const CONTRACT_ADDRESS = (
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`
) ?? "0x0000000000000000000000000000000000000000";

export const priceToContract = (usd: number): bigint =>
  BigInt(Math.round(usd * 100));

export const contractToPrice = (raw: bigint): number =>
  Number(raw) / 100;

export const STARTING_SCORE      = 1000n;
export const PREDICTION_DURATION = 30;   // seconds — mirrors contract constant

export const PREDICT_WARS_ABI = [
  // ── Events ──────────────────────────────────────────────────────────────
  {
    type: "event", name: "PredictionMade",
    inputs: [
      { name: "predId",       type: "uint256", indexed: true  },
      { name: "player",       type: "address", indexed: true  },
      { name: "direction",    type: "uint8",   indexed: false },
      { name: "entryPrice",   type: "int256",  indexed: false },
      { name: "bid",          type: "uint256", indexed: false },
      { name: "resolveAfter", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event", name: "PredictionResolved",
    inputs: [
      { name: "predId",    type: "uint256", indexed: true  },
      { name: "player",    type: "address", indexed: true  },
      { name: "won",       type: "bool",    indexed: false },
      { name: "exitPrice", type: "int256",  indexed: false },
      { name: "bid",       type: "uint256", indexed: false },
      { name: "newScore",  type: "uint256", indexed: false },
    ],
  },
  {
    type: "event", name: "UsernameSet",
    inputs: [
      { name: "player",   type: "address", indexed: true  },
      { name: "username", type: "string",  indexed: false },
    ],
  },
  // ── Write ────────────────────────────────────────────────────────────────
  {
    type: "function", name: "setUsername",
    stateMutability: "nonpayable",
    inputs:  [{ name: "_username", type: "string" }],
    outputs: [],
  },
  {
    type: "function", name: "predict",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_direction",  type: "uint8"   },
      { name: "_entryPrice", type: "int256"  },
      { name: "_bid",        type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function", name: "resolve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_predId",    type: "uint256" },
      { name: "_exitPrice", type: "int256"  },
    ],
    outputs: [],
  },
  // ── Read ─────────────────────────────────────────────────────────────────
  {
    type: "function", name: "getLeaderboard",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "addrs",     type: "address[]" },
      { name: "usernames", type: "string[]"  },
      { name: "scores",    type: "uint256[]" },
      { name: "wins",      type: "uint256[]" },
      { name: "totals",    type: "uint256[]" },
    ],
  },
  {
    type: "function", name: "getActivePrediction",
    stateMutability: "view",
    inputs: [{ name: "_player", type: "address" }],
    outputs: [
      { name: "active",       type: "bool"    },
      { name: "predId",       type: "uint256" },
      { name: "direction",    type: "uint8"   },
      { name: "entryPrice",   type: "int256"  },
      { name: "bid",          type: "uint256" },
      { name: "resolveAfter", type: "uint256" },
    ],
  },
  {
    type: "function", name: "getTotalPlayers",
    stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }],
  },
  {
    type: "function", name: "getTotalPredictions",
    stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }],
  },
  {
    type: "function", name: "playerStats",
    stateMutability: "view",
    inputs:  [{ name: "", type: "address" }],
    outputs: [
      { name: "totalPredictions", type: "uint256" },
      { name: "wins",             type: "uint256" },
      { name: "score",            type: "uint256" },
      { name: "username",         type: "string"  },
      { name: "exists",           type: "bool"    },
    ],
  },
  {
    type: "function", name: "hasActivePrediction",
    stateMutability: "view",
    inputs:  [{ name: "", type: "address" }],
    outputs: [{ type: "bool" }],
  },
] as const;
