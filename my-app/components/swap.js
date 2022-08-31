import { Button, ButtonBase, Divider, Grid, IconButton, InputBase, MenuItem, Paper, Select, Stack, TextField, Typography } from "@mui/material"
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import SwapVertIcon from '@mui/icons-material/SwapVert';
import { useState, useEffect } from "react"
import { SelectTokenDialog } from "./SelectTokenDialog"
import { getProviderOrSigner } from "../helpers/wallet";
import { ERC20_ABI, FREE_WILL_PAIR_ABI, FREE_WILL_SWAP_ABI, FREE_WILL_SWAP_ADDRESS, WETH_ADDRESS } from "../constants";
import { ethers, utils, BigNumber } from "ethers";
import ChangeCircleOutlinedIcon from '@mui/icons-material/ChangeCircleOutlined';
import LoadingButton from "@mui/lab/LoadingButton";

export function Swap(props) {

  const { account } = props
  const [dialogOpenOne, setDialogOpenOne] = useState(false)
  const [dialogOpenTwo, setDialogOpenTwo] = useState(false)
  const [tokenFrom, setTokenFrom] = useState({
    name: 'Ether',
    symbol: 'ETH',
    address: 'ETH'
  })
  const [tokenTo, setTokenTo] = useState({
    name: 'FreeWill USD',
    symbol: 'FUSD',
    address: '0x9c37763Ec6Cf0E9C6a3Ff6312763a831EE97C4A7'
  })
  const [inputAmount, setInputAmount] = useState('')
  const [outputAmount, setOutputAmount] = useState('')
  const [priceToken1PerToken2, setPriceToken1PerToken2] = useState('')
  const [priceToken2PerToken1, setPriceToken2PerToken1] = useState('')
  const [showPrice, setShowPrice] = useState(false)
  const [togglePrice, setTogglePrice] = useState(true)
  const [swapBtnLoading, setSwapBtnLoading] = useState(false)
  const [inputTokenBalance, setInputTokenBalance] = useState(BigNumber.from(0))
  const [outputTokenBalance, setOutputTokenBalance] = useState(BigNumber.from(0))
  const [showMaxBtn, setShowMaxBtn] = useState(false)

  useEffect(() => {
    getBalances()
    //eslint-disable-next-line
  }, [account, tokenFrom, tokenTo])
  
  const getBalances = async () => {
    if(account === '') {
      return
    }
    const provider = await getProviderOrSigner()
    if(tokenFrom.address === 'ETH') {
      setInputTokenBalance(await provider.getBalance(account))
      const outputTokenContract = new ethers.Contract(tokenTo.address, ERC20_ABI, provider)
      setOutputTokenBalance(await outputTokenContract.balanceOf(account))
    } else if(tokenTo.address === 'ETH') {
      setOutputTokenBalance(await provider.getBalance(account))
      const inputTokenContract = new ethers.Contract(tokenFrom.address, ERC20_ABI, provider)
      setInputTokenBalance(await inputTokenContract.balanceOf(account))
    } else {
      const inputTokenContract = new ethers.Contract(tokenFrom.address, ERC20_ABI, provider)
      setInputTokenBalance(await inputTokenContract.balanceOf(account))
      const outputTokenContract = new ethers.Contract(tokenTo.address, ERC20_ABI, provider)
      setOutputTokenBalance(await outputTokenContract.balanceOf(account))
    }
  }
  
  const handleDialogOpenOne = () => {
    setDialogOpenOne(true)
  }

  const handleDialogOpenTwo = () => {
    setDialogOpenTwo(true)
  }

  const handleDialogCloseOne = (value) => {
    setDialogOpenOne(false)
    setTokenFrom(value)
  }

  const handleDialogCloseTwo = (value) => {
    setDialogOpenTwo(false)
    setTokenTo(value)
  }

  const handleInterchange = () => {
    const temp = tokenFrom
    setTokenFrom(tokenTo)
    setTokenTo(temp)
    const tempAmount = inputAmount
    setInputAmount(outputAmount)
    setOutputAmount(tempAmount)
  }

  const handleMax = () => {
    setShowMaxBtn(false)
    setInputAmount(utils.formatEther(inputTokenBalance))
  }

  useEffect(() => {
    getOutputAmount()
    //eslint-disable-next-line
  }, [inputAmount])

  const getOutputAmount = async () => {
    if(inputAmount === '' || inputAmount == 0) {
      setOutputAmount('')
      setShowPrice(false)
      return
    }
    try {
      const provider = await getProviderOrSigner()
      const fwSwap = new ethers.Contract(FREE_WILL_SWAP_ADDRESS, FREE_WILL_SWAP_ABI, provider)
      let reserve1, reserve2
      let inputReserve, outputReserve
      let isInputAndToken1Same
      if(tokenFrom.address === 'ETH') {
        const pairAddress = await fwSwap.getPair(WETH_ADDRESS, tokenTo.address)
        const pairContract = new ethers.Contract(pairAddress, FREE_WILL_PAIR_ABI, provider)
        const [ reserveA, reserveB ] = await pairContract.getReserves()
        reserve1 = reserveA
        reserve2 = reserveB
        const token1 = await pairContract.token1()
        if(token1.toString().toLowerCase() === WETH_ADDRESS.toLowerCase()) {
          isInputAndToken1Same = true
        } else {
          isInputAndToken1Same = false
        }
      } else if(tokenTo.address === 'ETH') {
        const pairAddress = await fwSwap.getPair(WETH_ADDRESS, tokenFrom.address)
        const pairContract = new ethers.Contract(pairAddress, FREE_WILL_PAIR_ABI, provider)
        const [ reserveA, reserveB ] = await pairContract.getReserves()
        reserve1 = reserveA
        reserve2 = reserveB
        const token1 = await pairContract.token1()
        if(token1.toString().toLowerCase() === WETH_ADDRESS.toLowerCase()) {
          isInputAndToken1Same = false
        } else {
          isInputAndToken1Same = true
        }
      } else {
        const pairAddress = await fwSwap.getPair(tokenFrom.address, tokenTo.address)
        const pairContract = new ethers.Contract(pairAddress, FREE_WILL_PAIR_ABI, provider)
        const [ reserveA, reserveB ] = await pairContract.getReserves()
        reserve1 = reserveA
        reserve2 = reserveB
        const token1 = await pairContract.token1()
        if(token1.toString().toLowerCase() === tokenFrom.address.toLowerCase()) {
          isInputAndToken1Same = true
        } else {
          isInputAndToken1Same = false
        }
      }
      if(isInputAndToken1Same) {
        inputReserve = reserve1
        outputReserve = reserve2
      } else {
        inputReserve = reserve2
        outputReserve = reserve1
      }
      const opAmount = await fwSwap.getOutputAmount(utils.parseEther(inputAmount), inputReserve, outputReserve)
      setOutputAmount(utils.formatEther(opAmount))
      let price1 = BigNumber.from(utils.parseEther(inputAmount)).mul(BigNumber.from(utils.parseEther('1'))).div(BigNumber.from(opAmount))
      price1 = utils.formatEther(price1.sub(price1.mod(1e12)))
      let price2 = BigNumber.from(opAmount).mul(BigNumber.from(utils.parseEther('1'))).div(BigNumber.from(utils.parseEther(inputAmount)))
      price2 = utils.formatEther(price2.sub(price2.mod(1e12)))
      setPriceToken1PerToken2(price1)
      setPriceToken2PerToken1(price2)
      setShowPrice(true)
    } catch(error) {
      console.log(error)
    }
  }

  const swapTokens = async () => {
    if(inputAmount === '' || inputAmount === '0' || inputAmount === 0) {
      return
    }
    setSwapBtnLoading(true)
    try {
      const signer = await getProviderOrSigner(true)
      const fwSwap = new ethers.Contract(FREE_WILL_SWAP_ADDRESS, FREE_WILL_SWAP_ABI, signer)
      if(tokenFrom.address === 'ETH') {
        const tx = await fwSwap.swapETHForTokens(tokenTo.address, { value: utils.parseEther(inputAmount) })
        const txr = await tx.wait()
        console.log(txr)
      } else if(tokenTo.address === 'ETH') {
        const token = new ethers.Contract(tokenFrom.address, ERC20_ABI, signer)
        const allowance = await token.allowance(await signer.getAddress(), FREE_WILL_SWAP_ADDRESS)
        if(allowance < utils.parseEther(inputAmount)) {
          const approveTx = await token.approve(FREE_WILL_SWAP_ADDRESS, utils.parseEther(inputAmount))
          const approveTxr = await approveTx.wait()
          console.log(approveTxr)
        }
        const tx = await fwSwap.swapTokensForETH(tokenFrom.address, utils.parseEther(inputAmount))
        const txr = await tx.wait()
        console.log(txr)
      } else {
        const token = new ethers.Contract(tokenFrom.address, ERC20_ABI, signer)
        const allowance = await token.allowance(await signer.getAddress(), FREE_WILL_SWAP_ADDRESS)
        if(allowance < utils.parseEther(inputAmount)) {
          const approveTx = await token.approve(FREE_WILL_SWAP_ADDRESS, utils.parseEther(inputAmount))
          const approveTxr = await approveTx.wait()
          console.log(approveTxr)
        }
        const tx = await fwSwap.swapTokensForTokens(tokenFrom.address, tokenTo.address, utils.parseEther(inputAmount))
        const txr = await tx.wait()
        console.log(txr)
      }
      setInputAmount('')
      setOutputAmount('')
      getBalances()
      setSwapBtnLoading(false)
    } catch(error) {
      console.log(error)
      setSwapBtnLoading(false)
    }
  }

  return(
    <div>
      <Paper 
        elevation={0}
        sx={{ py: '20px', borderRadius: '20px' }}
      >
        <Typography variant="h5" gutterBottom component="div" textAlign='center'>
          Swap
        </Typography>
        <Divider orientation="horizontal" />
        <Stack 
          spacing={1} 
          alignItems='center'
          justifyContent='center'
          mt={4}
          mx={3}
        >
          <div>
            <Grid container>
              <Button onClick={handleDialogOpenOne}>
                {tokenFrom.symbol}
                <ExpandMoreIcon/>
              </Button>
              <Stack 
                xs={4} 
                direction="row" 
                justifyContent="center" 
                alignItems="flex-end" 
                spacing={0} 
                marginLeft='auto'
                mr={1}
              >
                <Typography variant="body2" color='gray'>
                  {`Bal: ${utils.formatEther(inputTokenBalance.sub(inputTokenBalance.mod(1e12)))}`}
                </Typography>
              </Stack>
            </Grid>
            <SelectTokenDialog
              open={dialogOpenOne}
              selectedValue={tokenFrom}
              onClose={handleDialogCloseOne}
              alreadySelected={tokenTo}
            />
            <Paper
              elevation={0}
              component='form'
              sx={{
                px: '4px',
                py: '10px',
                display: 'flex',
                alignItems: 'center',
                width: 250,
                backgroundColor: '#eae7f7',
                borderRadius: '10px'
              }}
            >
              <InputBase
                sx={{ ml: 1, flex: 1 }}
                placeholder="0.0"
                value={inputAmount}
                onChange={(e) => {
                  const regex = /^\d*\.?\d*$/
                  if (e.target.value === '' || regex.test(e.target.value)) {
                    if(e.target.value[-1] === '.') {
                      return
                    }
                    setInputAmount(e.target.value)
                    if(e.target.value === '') {
                      setShowMaxBtn(true)
                      return
                    }
                    if(utils.parseEther(e.target.value).eq(inputTokenBalance)) {
                      setShowMaxBtn(false)
                      return
                    }
                    setShowMaxBtn(true)
                  }
                }}
              />
              { showMaxBtn &&
                <ButtonBase
                  onClick={handleMax}
                  sx={{ flex: 'end', mx: 1, color: 'gray' }}
                >
                  MAX
                </ButtonBase>
              }
            </Paper>
          </div>
          <IconButton
            onClick={handleInterchange}
            color="primary"
          >
            <SwapVertIcon/>
          </IconButton>
          <div style={{ marginBottom: '20px' }}>
            <Grid container>
              <Button onClick={handleDialogOpenTwo}>
                {tokenTo.symbol}
                <ExpandMoreIcon/>
              </Button>
              <Stack 
                xs={4} 
                direction="row" 
                justifyContent="center" 
                alignItems="flex-end" 
                spacing={0} 
                marginLeft='auto'
                mr={1}
              >
                <Typography variant="body2" color='gray'>
                  {`Bal: ${utils.formatEther(outputTokenBalance.sub(outputTokenBalance.mod(1e12)))}`}
                </Typography>
              </Stack>
            </Grid>
            <SelectTokenDialog
              open={dialogOpenTwo}
              selectedValue={tokenTo}
              onClose={handleDialogCloseTwo}
              alreadySelected={tokenFrom}
            />
            <Paper
              elevation={0}
              component='form'
              sx={{ 
                px: '4px', 
                py: '10px', 
                display: 'flex', 
                alignItems: 'center', 
                width: 250,
                backgroundColor: '#eae7f7',
                borderRadius: '10px'
              }}
            >
              <InputBase
                sx={{ ml: 1, flex: 1 }}
                placeholder="0.0"
                value={outputAmount}
              />
            </Paper>
            { showPrice &&
              <Stack
                direction="row"
                justifyContent="flex-end"
                alignItems="center"
              >
                { togglePrice
                  ?
                    <Typography variant="subtitle2">
                      {`${priceToken1PerToken2} ${tokenFrom.symbol} per ${tokenTo.symbol}`}
                    </Typography>
                  :
                    <Typography variant="subtitle2">
                      {`${priceToken2PerToken1} ${tokenTo.symbol} per ${tokenFrom.symbol}`}
                    </Typography>
                }
                <Typography>{}</Typography>
                <IconButton
                  size="small"
                  onClick={() => {
                    setTogglePrice(prev => !prev)
                  }}
                >
                  <ChangeCircleOutlinedIcon color="primary"/>
                </IconButton>
              </Stack>
            }
          </div>

          <LoadingButton
            variant="contained"
            sx={{ borderRadius: "10px", width: '100%' }}
            onClick={swapTokens}
            loading={swapBtnLoading}
          >
            Swap
          </LoadingButton>
        </Stack>
      </Paper>

    </div>
  )
}