import { createConfig, http } from "wagmi";
import { defineChain } from "viem";
import { injected, metaMask } from "wagmi/connectors";

// MegaETH Testnet (Chain ID: 6343)
export const megaethTestnet = defineChain({
  id: 6343,
  name: "MegaETH Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http:      ["https://carrot.megaeth.com/rpc"],
      webSocket: ["wss://carrot.megaeth.com/ws"],
    },
  },
  blockExplorers: {
    default: {
      name: "MegaETH Explorer",
      url:  "https://megaeth-testnet-v2.blockscout.com",
    },
  },
  testnet: true,
});

export const wagmiConfig = createConfig({
  chains:     [megaethTestnet],
  connectors: [injected(), metaMask()],
  transports: {
    [megaethTestnet.id]: http("https://carrot.megaeth.com/rpc"),
  },
  ssr: true,
});
