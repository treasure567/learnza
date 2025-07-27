import { ethers } from "hardhat";

async function main() {
  console.log("Deploying Learnza token...");
  const Learnza = await ethers.getContractFactory("Learnza");
  const token = await Learnza.deploy();
  await token.waitForDeployment();
  const address = await token.getAddress();
  console.log(`Learnza token deployed to: ${address}`);
  console.log("Deployment complete!");
  const balance = await token.checkBalance();
  console.log(`Balance of ${address}: ${balance}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
}); 