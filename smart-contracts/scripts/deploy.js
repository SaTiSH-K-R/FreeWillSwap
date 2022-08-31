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
  const freeWillSwap = await FreeWillSwap.deploy(weth.address)
  await freeWillSwap.deployed()
  console.log("FreeWillSwap:: ", freeWillSwap.address)

  //adding ETH/FUSD liquidity
  // const approveTx = await freeWillUSD.approve(freeWillSwap.address, ethers.utils.parseEther('200000'))
  // await approveTx.wait()
  // const tx = await freeWillSwap.addLiquidityEth(freeWillUSD.address, ethers.utils.parseEther('100000'), {value: ethers.utils.parseEther('100')})
  // const txr = await tx.wait()
  // console.log(txr)

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
