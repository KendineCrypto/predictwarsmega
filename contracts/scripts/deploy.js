const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying PredictWars to MegaETH Testnet...\n");

  const [deployer] = await ethers.getSigners();
  console.log("📬 Deployer:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Balance:", ethers.formatEther(balance), "ETH\n");

  if (balance === 0n) {
    console.error("❌ No balance! Get testnet ETH from https://testnet.megaeth.com");
    process.exit(1);
  }

  const PredictWars = await ethers.getContractFactory("PredictWars");
  console.log("⚙️  Deploying...");

  const contract = await PredictWars.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();

  console.log("\n✅ PredictWars deployed!");
  console.log("📄 Contract address:", address);
  console.log("🔍 Explorer:", `https://megaeth-testnet-v2.blockscout.com/address/${address}`);
  console.log("\n📋 Add to frontend/.env.local:");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
