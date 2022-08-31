import { useState, useEffect } from "react"
import { Grid, Typography } from "@mui/material"
import { ethers } from "ethers"
import CreatePair from "./createPair"
import { getProviderOrSigner } from "../helpers/wallet"
import { ERC20_ABI, FREE_WILL_PAIR_ABI, FREE_WILL_SWAP_ABI, FREE_WILL_SWAP_ADDRESS, WETH_ADDRESS } from "../constants"
import { LiquidityForm } from "./liquidityForm"

export function Liquidity() {

  const [pools, setPools] = useState(null)

  useEffect(() => {
    getPools()
  }, [])

  const getPools = async () => {
    const provider = await getProviderOrSigner()
    const fwSwap = new ethers.Contract(FREE_WILL_SWAP_ADDRESS, FREE_WILL_SWAP_ABI, provider);
    const poolAddresses = await fwSwap.getAllPairs()
    let _pools = []
    for (const poolAddress of poolAddresses) {
      const pool = new ethers.Contract(poolAddress, FREE_WILL_PAIR_ABI, provider)
      const [reserve1, reserve2] = await pool.getReserves()
      const poolName = await pool.name()
      const token1 = await pool.token1()
      const token2 = await pool.token2()
      let symbol1, symbol2
      if(token1.toLowerCase() === WETH_ADDRESS.toLowerCase()) {
        symbol1 = 'ETH'
        const token2Contract = new ethers.Contract(token2, ERC20_ABI, provider)
        symbol2 = await token2Contract.symbol()
      } else if(token2.toLowerCase() === WETH_ADDRESS.toLowerCase()) {
        const token1Contract = new ethers.Contract(token1, ERC20_ABI, provider)
        symbol1 = await token1Contract.symbol()
        symbol2 = 'ETH'
      } else {
        const token1Contract = new ethers.Contract(token1, ERC20_ABI, provider)
        const token2Contract = new ethers.Contract(token2, ERC20_ABI, provider)
        symbol1 = await token1Contract.symbol()
        symbol2 = await token2Contract.symbol()
      }
      _pools.push({
        token1,
        token2,
        symbol1,
        symbol2,
        poolAddress,
        reserve1,
        reserve2,
        poolName
      })
    }
    setPools(_pools)
  }
  
  return(
    <>
      <Typography variant='h4'>Liquidity Pools</Typography>
      <CreatePair getPools={getPools}/>
      <Grid
        container
        columns={{ xs: 12, sm: 12, md: 12, lg: 6 }}
        direction="row"
        justifyContent="center"
        alignItems="center"
      >
        {pools?.map(pool => {
          return (
            <LiquidityForm pool={pool} getPools={getPools} key={pool.poolAddress} />
          )})
        }
      </Grid>
    </>
  )
}