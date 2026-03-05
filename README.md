# ⚡ PredictWars — MegaETH Testnet

> Real-time ETH price prediction game on MegaETH Testnet. Score-based, no real funds.

## How It Works

1. **Check** the live ETH/USD price (Binance feed, updates every 10s)
2. **Predict** HIGHER ▲ or LOWER ▼ in 5 minutes
3. **Earn** +100 points per correct prediction
4. **Climb** the on-chain leaderboard

---

## Project Structure

```
predictwarsmega/
├── contracts/         # Hardhat + Solidity
│   ├── contracts/PredictWars.sol
│   ├── scripts/deploy.js
│   ├── hardhat.config.js
│   └── package.json
│
└── frontend/          # Next.js 15 + wagmi v2
    └── src/
        ├── app/           # Next.js app router
        ├── components/    # UI components
        ├── hooks/         # wagmi + price hooks
        └── lib/           # wagmi config + ABI
```

---

## Quick Start

### 1. Deploy the Smart Contract

```bash
cd contracts
npm install

# Copy env file and add your private key
cp .env.example .env
# Edit .env → add PRIVATE_KEY=your_private_key

# Deploy to MegaETH Testnet
npm run deploy
# → Copy the contract address from the output
```

Get testnet ETH first: https://testnet.megaeth.com

### 2. Run the Frontend

```bash
cd frontend
npm install

# Set the contract address
echo "NEXT_PUBLIC_CONTRACT_ADDRESS=0xYOUR_CONTRACT_ADDRESS" > .env.local

# Dev server
npm run dev
# → http://localhost:3000
```

### 3. Add MegaETH to MetaMask

| Field       | Value                                       |
|-------------|---------------------------------------------|
| Network     | MegaETH Testnet                             |
| RPC URL     | https://carrot.megaeth.com/rpc              |
| Chain ID    | 6342                                        |
| Currency    | ETH                                         |
| Explorer    | https://megaeth-testnet-v2.blockscout.com   |

Or add via [ChainList](https://chainlist.org/chain/6342).

---

## Tech Stack

| Layer        | Tech                        |
|--------------|-----------------------------|
| Blockchain   | MegaETH Testnet (Chain 6342)|
| Smart Contract | Solidity 0.8.24, Hardhat  |
| Frontend     | Next.js 15, TypeScript      |
| Web3         | wagmi v2, viem              |
| Price Feed   | Binance REST API (off-chain)|
| Styling      | Tailwind CSS (MegaETH theme)|

---

## Contract: PredictWars.sol

### Key Functions

```solidity
// Make a prediction (Direction: 0=UP, 1=DOWN)
function predict(Direction _direction, int256 _entryPrice, string calldata _username) external

// Resolve after 5 minutes (permissionless)
function resolve(uint256 _predId, int256 _exitPrice) external

// Read leaderboard (sort off-chain)
function getLeaderboard() external view returns (...)

// Get active prediction for an address
function getActivePrediction(address _player) external view returns (...)
```

### Price Format

Prices are stored as `int256 = USD × 100` to avoid floating point.

```
$3,500.50 → 350050
$2,000.00 → 200000
```

### Scoring

- Correct prediction: **+100 points**
- Wrong prediction: **+0 points** (no penalty in V0)
- Leaderboard sorted by score descending

---

## V0 Known Limitations

- **Price oracle**: Exit price is submitted by the caller (frontend). Not fully trustless.
  → V1 will integrate Chainlink Data Feed for on-chain price verification.
- **Auto-resolve**: Browser must be open for auto-resolution; manual "Resolve" button as fallback.
- **No 1v1**: Coming in V1 — players can challenge each other directly.

## Roadmap

| Version | Features |
|---------|----------|
| **V0** (current) | Public predictions, leaderboard, score system |
| **V1** | 1v1 challenges, Chainlink oracle, streaks, badges |
| **V2** | Tournaments, weekly seasons, NFT rewards |

---

## MegaETH Network Details

- **Chain ID**: 6342
- **RPC**: https://carrot.megaeth.com/rpc
- **WebSocket**: wss://carrot.megaeth.com/ws
- **Explorer**: https://megaeth-testnet-v2.blockscout.com
- **Faucet**: https://testnet.megaeth.com
- **Block time**: ~10ms (mini blocks) / ~1s (EVM blocks)
- **TPS**: 100,000+

---

Built with ❤️ on MegaETH Testnet
