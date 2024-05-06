import { ethers } from "hardhat";

async function main() {
  //deploy SupplyChainNFT contract 
  const SupplyChainNFT = await ethers.getContractFactory("SupplyChainNFT");
  const supplyChainNFT = await SupplyChainNFT.deploy();
  await supplyChainNFT.deployed();
  console.log("SupplyChainNFT deployed to:", supplyChainNFT.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
