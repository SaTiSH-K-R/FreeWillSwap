// export const FREE_WILL_SWAP_ADDRESS = '0x0c4B4f20AD3C589252B65cF2DFbdcF668E2CFe9C'

// export const FUSD_ADDRESS = '0x1A9D899b052FeD0E273a4392383A0F82e8c7441A'

// export const WETH_ADDRESS = '0x2f2874A1941Ca9CE282c7a32eBB291eAa916CE36'

// export const FWT_ADDRESS = '0x6a452177837ed4Cb4734D3F1426735F36Ba8BeBC'

const FREE_WILL_SWAP_ABI = require('./FREE_WILL_SWAP_ABI.json')
const FREE_WILL_PAIR_ABI = require('./FREE_WILL_PAIR_ABI.json')
const FUSD_ABI = require('./FUSD_ABI.json')

const FREE_WILL_SWAP_ADDRESS = '0x2Bd84eb5271fFE68bBE23AE6aE388424022754bc'

const FUSD_ADDRESS = '0x9c37763Ec6Cf0E9C6a3Ff6312763a831EE97C4A7'

const WETH_ADDRESS = '0x06f8d0d7E8ac099feCF820e0838550FFB8A24A31'

const FWT_ADDRESS = '0x7A13f09BaDd72eE9ff28FBEB4BC6979D96F47Fa1'

const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)"
]

module.exports = {
  FREE_WILL_SWAP_ABI,
  FREE_WILL_PAIR_ABI,
  FUSD_ABI,
  ERC20_ABI,
  FREE_WILL_SWAP_ADDRESS,
  FUSD_ADDRESS,
  WETH_ADDRESS,
  FWT_ADDRESS
}