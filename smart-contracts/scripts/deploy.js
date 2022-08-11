const { ethers } = require("hardhat")

async function main() {
  const WETH = await ethers.getContractFactory('WETH')
  const FreeWillUSD = await ethers.getContractFactory('FreeWillUSD')
  const FreeWillSwap = await ethers.getContractFactory('FreeWillSwap')
  const weth = await WETH.deploy()
  await weth.deployed()
  console.log("WETH:: ", weth.address)
  const freeWillUSD = await FreeWillUSD.deploy()
  await freeWillUSD.deployed()
  console.log("FUSD:: ", freeWillUSD.address)
  const freeWillSwap = await FreeWillSwap.deploy('0x2f2874A1941Ca9CE282c7a32eBB291eAa916CE36')
  await freeWillSwap.deployed()
  console.log("FreeWillSwap", freeWillSwap.address)
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
