import { run } from "hardhat";
import dotenv from "dotenv";

dotenv.config();

const LEARNZA_ADDRESS: string = process.env.LEARNZA_ADDRESS || "";

async function main() {
  const contractAddress = LEARNZA_ADDRESS;
  
  console.log("Verifying contract on EduChain Testnet...");
  
  try {
    await run("verify:verify", {
      address: contractAddress,
      contract: "contracts/Learnza.sol:Learnza",
      constructorArguments: [],
      network: "eduChainTestnet",
    });
    
    console.log("Contract verified successfully!");
  } catch (error) {
    console.error("Error verifying contract:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 