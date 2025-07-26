import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const PRIVATE_KEY: string = process.env.PRIVATE_KEY || "";
const ETHERSCAN_API_KEY: string = process.env.ETHERSCAN_API_KEY || "";


const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 50
      },
      viaIR: true
    }
  },
  networks: {
    hardhat: {},
    eduChainTestnet: {
      url: "https://rpc.open-campus-codex.gelato.digital",
      chainId: 656476,
      accounts: ["0x" + PRIVATE_KEY],
      gasPrice: 20000000000,
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  etherscan: {
    apiKey: {
      eduChainTestnet: ETHERSCAN_API_KEY
    },
    customChains: [
      {
        network: "eduChainTestnet",
        chainId: 656476,
        urls: {
          apiURL: "https://shannon-explorer.somnia.network/api",
          browserURL: "https://opencampus-codex.blockscout.com/",
        }
      }
    ]
  }
};

export default config;
