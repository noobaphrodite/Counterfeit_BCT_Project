import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  defaultNetwork: "matic",
  networks: {
    hardhat: {
    },
    holesky: {
      url: "https://ethereum-holesky.publicnode.com/",
      accounts: [process.env.PRIVATE_KEY || ""]
    }
  },
};

export default config;
