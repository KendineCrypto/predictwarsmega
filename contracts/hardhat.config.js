require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x" + "0".repeat(64);

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    megaeth: {
      url: "https://carrot.megaeth.com/rpc",
      chainId: 6343,
      accounts: [PRIVATE_KEY],
      gasPrice: "auto",
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
  },
  // Blockscout verification (no API key needed)
  etherscan: {
    apiKey: {
      megaeth: "placeholder",
    },
    customChains: [
      {
        network: "megaeth",
        chainId: 6343,
        urls: {
          apiURL: "https://megaeth-testnet-v2.blockscout.com/api",
          browserURL: "https://megaeth-testnet-v2.blockscout.com",
        },
      },
    ],
  },
};
