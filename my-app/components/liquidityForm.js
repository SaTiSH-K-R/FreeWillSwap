import LoadingButton from "@mui/lab/LoadingButton";
import { Divider, Grid, InputBase, Paper, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { ethers, utils, BigNumber } from "ethers";
import { ERC20_ABI, FREE_WILL_SWAP_ADDRESS, WETH_ADDRESS, FREE_WILL_SWAP_ABI, FREE_WILL_PAIR_ABI } from "../constants";
import { getProviderOrSigner } from "../helpers/wallet";

export const LiquidityForm = (props) => {

  const { pool, getPools } = props
  const [addLiquidityBtnLoading, setAddLiquidityBtnLoading] = useState(false)
  const [token1Amount, setToken1Amount] = useState('')
  const [token2Amount, setToken2Amount] = useState('')
  const [lpBalance, setLpBalance] = useState(BigNumber.from(0))
  const [lpAmount, setLpAmount] = useState('')
  const [removeLiquidityBtnLoading, setRemoveLiquidityBtnLoading] = useState(false)

  useEffect(() => {
    getLP()
    //eslint-disable-next-line
  }, [pool])

  const getLP = async () => {
    const provider = await getProviderOrSigner()
    const poolContract = new ethers.Contract(pool.poolAddress, FREE_WILL_PAIR_ABI, provider)
    const _lpBalance = await poolContract.balanceOf(provider.provider.selectedAddress)
    setLpBalance(_lpBalance)
  }

  const addLiquidity = async () => {
    if(token1Amount === '' || token1Amount == '0' || token2Amount === '' || token2Amount === '0') {
      return
    }
    setAddLiquidityBtnLoading(true)
    try {
      const signer = await getProviderOrSigner(true)
      const fwSwap = new ethers.Contract(FREE_WILL_SWAP_ADDRESS, FREE_WILL_SWAP_ABI, signer)
      if(pool.token1.toLowerCase() === WETH_ADDRESS.toLowerCase()) {
        const token2Contract = new ethers.Contract(pool.token2, ERC20_ABI, signer)
        const allowance = await token2Contract.allowance(await signer.getAddress(), FREE_WILL_SWAP_ADDRESS)
        if(allowance < utils.parseEther(token2Amount)) {
          const approveTx = await token2Contract.approve(FREE_WILL_SWAP_ADDRESS, utils.parseEther(token2Amount))
          const approveTxr = await approveTx.wait()
        }
        const tx = await fwSwap.addLiquidityEth(
          pool.token2,
          utils.parseEther(token2Amount),
          { value: utils.parseEther(token1Amount) }
        )
        const txr = await tx.wait()
        console.log(txr)
      } else if(pool.token2.toLowerCase() === WETH_ADDRESS.toLowerCase()) {
        const token1Contract = new ethers.Contract(pool.token1, ERC20_ABI, signer)
        const allowance = await token1Contract.allowance(await signer.getAddress(), FREE_WILL_SWAP_ADDRESS)
        if(allowance < utils.parseEther(token1Amount)) {
          const approveTx = await token1Contract.approve(FREE_WILL_SWAP_ADDRESS, utils.parseEther(token1Amount))
          const approveTxr = await approveTx.wait()
        }
        const tx = await fwSwap.addLiquidityEth(
          pool.token1,
          utils.parseEther(token1Amount),
          { value: utils.parseEther(token2Amount) }
        )
        const txr = await tx.wait()
        console.log(txr)
      } else {
        const token1Contract = new ethers.Contract(pool.token1, ERC20_ABI, signer)
        const token2Contract = new ethers.Contract(pool.token2, ERC20_ABI, signer)
        const allowance1 = await token1Contract.allowance(await signer.getAddress(), FREE_WILL_SWAP_ADDRESS)
        const allowance2 = await token2Contract.allowance(await signer.getAddress(), FREE_WILL_SWAP_ADDRESS)
        let approveTx1, approveTx2
        if(allowance1 < utils.parseEther(token1Amount)) {
          approveTx1 = await token1Contract.approve(FREE_WILL_SWAP_ADDRESS, utils.parseEther(token1Amount))
        }
        if(allowance2 < utils.parseEther(token2Amount)) {
          approveTx2 = await token2Contract.approve(FREE_WILL_SWAP_ADDRESS, utils.parseEther(token2Amount))
        }
        const approveTxr1 = await approveTx1.wait()
        const approveTxr2 = await approveTx2.wait()
        console.log(approveTxr1)
        console.log(approveTxr2)
        const tx = await fwSwap.addLiquidity(
          pool.token1,
          pool.token2,
          utils.parseEther(token1Amount),
          utils.parseEther(token2Amount)
        )
        const txr = await tx.wait()
        console.log(txr)
      }
      getPools()
      setToken1Amount('')
      setToken2Amount('')
    } catch(error) {
      console.log(error)
      setAddLiquidityBtnLoading(false)
    }
    setAddLiquidityBtnLoading(false)
  }

  const removeLiquidity = async () => {
    if(lpAmount === '' || lpAmount == '0') {
      return
    }
    if(lpBalance.lt(utils.parseEther(lpAmount))) {
      window.alert("Insufficient LP tokens")
      return
    }
    setRemoveLiquidityBtnLoading(true)
    try {
      const signer = await getProviderOrSigner(true)
      const fwSwap = new ethers.Contract(FREE_WILL_SWAP_ADDRESS, FREE_WILL_SWAP_ABI, signer)
      if(pool.token1.toLowerCase() === WETH_ADDRESS.toLowerCase()) {
        const tx = await fwSwap.removeLiquidityEth(pool.token2, utils.parseEther(lpAmount))
        const txr = await tx.wait()
        console.log(txr)
      } else if(pool.token2.toLowerCase() === WETH_ADDRESS.toLowerCase()) {
        const tx = await fwSwap.removeLiquidityEth(pool.token1, utils.parseEther(lpAmount))
        const txr = await tx.wait()
        console.log(txr)
      } else {
        const tx = await fwSwap.removeLiquidity(pool.token1, pool.token2, utils.parseEther(lpAmount))
        const txr = await tx.wait() 
        console.log(txr)
      }
      setLpAmount('')
      getPools()
    } catch(error) {
      setRemoveLiquidityBtnLoading(false)
      console.log(error)
    }
    setRemoveLiquidityBtnLoading(false)
  }

  return (
    <Paper
      sx={{ p: 2, borderRadius: '20px', m: 1 }}
      key={pool.poolAddress}
      elevation={0}
      width='100%'
    >
      <Typography variant='h6' textAlign='center'><b>{pool.poolName}</b></Typography>
      <Divider orientation="horizontal"></Divider>
      <Typography mt={2} mb={1}>
        {`${pool.symbol1} Reserve: ${utils.formatEther(pool.reserve1.sub(pool.reserve1.mod(1e12)))} ${pool.symbol1}`}
      </Typography>
      <Typography mb={1}>
        {`${pool.symbol2} Reserve: ${utils.formatEther(pool.reserve2.sub(pool.reserve2.mod(1e12)))} ${pool.symbol2}`}
      </Typography>
      <Typography mb={2}>
        {`Your LP Tokens: ${utils.formatEther(lpBalance.sub(lpBalance.mod(1e12)))}`}
      </Typography>
      <Grid
        container
        columns={{ xs: 12, sm: 5}}
        direction="row"
        alignItems="stretch"
      >
        <Grid
          item
          style={{
            padding: '10px',
            borderStyle: 'solid',
            borderColor: 'rgba(0, 0, 0, 0.12)',
            borderWidth: '1px',
            borderRadius: '10px'
          }}
          m={1}
        >
          <Paper
            sx={{
              p: 1,
              backgroundColor: '#eae7f7',
              borderRadius: '10px',
              width: 250,
              display: 'flex'
            }}
            elevation={0}
          >
            <InputBase
              sx={{ flex: 1 }}
              value={token1Amount}
              onChange={(e) => {
                const regex = /^\d*\.?\d*$/
                if (e.target.value === '' || regex.test(e.target.value)) {
                  setToken1Amount(e.target.value)
                  if(e.target.value[-1] === '.') {
                    return
                  }
                  if(e.target.value === '' || e.target.value == '0') {
                    setToken2Amount('')
                    return
                  }
                  const optimalAmount2 = pool.reserve2.mul(utils.parseEther(e.target.value)).div(pool.reserve1)
                  setToken2Amount(utils.formatEther(optimalAmount2))
                }
              }}
            ></InputBase>
            <Typography sx={{ flex: 'end', ml: 2, color: 'gray' }}>{pool.symbol1}</Typography>
          </Paper>
          <Paper
            sx={{
              p: 1,
              backgroundColor: '#eae7f7',
              borderRadius: '10px',
              width: 250,
              mt: 2,
              display: 'flex'
            }}
            elevation={0}
          >
            <InputBase
              sx={{ flex: 1 }}
              value={token2Amount}
              onChange={(e) => {
                const regex = /^\d*\.?\d*$/
                if (e.target.value === '' || regex.test(e.target.value)) {
                  setToken2Amount(e.target.value)
                  if(e.target.value[-1] === '.') {
                    return
                  }
                  if(e.target.value === '' || e.target.value == '0') {
                    setToken1Amount('')
                    return
                  }
                  const optimalAmount1 = pool.reserve1.mul(utils.parseEther(e.target.value)).div(pool.reserve2)
                  setToken1Amount(utils.formatEther(optimalAmount1))
                }
              }}
            ></InputBase>
            <Typography sx={{ flex: 'end', ml: 2, color: 'gray' }}>{pool.symbol2}</Typography>
          </Paper>
          <Stack direction='row' justifyContent='center' mt={2}>
            <LoadingButton
              loading={addLiquidityBtnLoading}
              variant='contained'
              onClick={(pool) => addLiquidity(pool)}
            >Add Liquidity</LoadingButton>
          </Stack>
        </Grid>
        <Grid
          item
          style={{
            padding: '10px',
            borderStyle: 'solid',
            borderColor: 'rgba(0, 0, 0, 0.12)',
            borderWidth: '1px',
            borderRadius: '10px'
          }}
          m={1}
        >
          <Paper
            sx={{
              p: 1,
              backgroundColor: '#eae7f7',
              borderRadius: '10px',
              width: 250,
              display: 'flex'
            }}
            elevation={0}
          >
            <InputBase
              sx={{ flex: 1 }}
              value={lpAmount}
              onChange={(e) => {
                const regex = /^\d*\.?\d*$/
                if (e.target.value === '' || regex.test(e.target.value)) {
                  setLpAmount(e.target.value)
                }
              }}
            ></InputBase>
            <Typography sx={{ flex: 'end', ml: 2, color: 'gray' }}>LP</Typography>
          </Paper>
          <Stack direction='row' justifyContent='center' mt={2}>
            <LoadingButton
              loading={removeLiquidityBtnLoading}
              variant='contained'
              onClick={(pool) => removeLiquidity(pool)}
            >Remove Liquidity</LoadingButton>
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  )
}