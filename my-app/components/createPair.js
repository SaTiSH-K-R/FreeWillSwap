import { Button, Grid, InputBase, Paper, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { getProviderOrSigner } from '../helpers/wallet'
import { ERC20_ABI, FREE_WILL_SWAP_ABI, FREE_WILL_SWAP_ADDRESS } from '../constants'
import { ethers, utils } from 'ethers'
import LoadingButton from '@mui/lab/LoadingButton'

export default function CreatePair(props) {

  const { getPools } = props
  const [creatingPair, setCreatingPair] = useState(false)
  const [ethPair, setEthPair] = useState(true)
  const [ethAmount, setEthAmount] = useState('')
  const [tokenAddress, setTokenAddress] = useState('')
  const [tokenAmount, setTokenAmount] = useState('')
  const [tokenAddress1, setTokenAddress1] = useState('')
  const [tokenAmount1, setTokenAmount1] = useState('')
  const [tokenAddress2, setTokenAddress2] = useState('')
  const [tokenAmount2, setTokenAmount2] = useState('')
  const [createEthPairBtnLoading, setCreateEthPairBtnLoading] = useState(false)
  const [createTokenPairBtnLoading, setCreateTokenPairBtnLoading] = useState(false)

  const handleCreatePair = () => {
    setCreatingPair(true)
  }

  const handleCancel= () => {
    setCreatingPair(false)
    setEthPair(false)
  }

  const toggleToEthPair = () => {
    setTokenAddress1('')
    setTokenAmount1('')
    setTokenAddress2('')
    setTokenAmount2('')
    setEthPair(true)
  }

  const toggleToTokenPair = () => {
    setEthAmount('')
    setTokenAddress('')
    setTokenAmount('')
    setEthPair(false)
  }

  const createEthPair = async () => {
    try {
      setCreateEthPairBtnLoading(true)
      const signer = await getProviderOrSigner(true)
      const token = new ethers.Contract(tokenAddress, ERC20_ABI, signer)
      const allowance = await token.allowance(await signer.getAddress(), FREE_WILL_SWAP_ADDRESS)
      if(allowance.lt(utils.parseEther(tokenAmount))) {
        const approveTx = await token.approve(FREE_WILL_SWAP_ADDRESS, utils.parseEther(tokenAmount))
        const approveTxr = await approveTx.wait()
        console.log(approveTxr)
      }
      const fwSwap = new ethers.Contract(FREE_WILL_SWAP_ADDRESS, FREE_WILL_SWAP_ABI, signer)
      const tx = await fwSwap.addLiquidityEth(tokenAddress, utils.parseEther(tokenAmount), { value: utils.parseEther(ethAmount) })
      const txr = await tx.wait()
      console.log(txr)
      setEthAmount('')
      setTokenAddress('')
      setTokenAmount('')
      getPools()
      setCreateEthPairBtnLoading(false)
    } catch(error) {
      console.log(error)
      setCreateEthPairBtnLoading(false)
    }
  }

  const createTokenPair = async () => {
    try {
      console.log(tokenAddress1, tokenAddress2, tokenAmount1, tokenAmount2)
      setCreateTokenPairBtnLoading(true)
      const signer = await getProviderOrSigner(true)
      const token1 = new ethers.Contract(tokenAddress1, ERC20_ABI, signer)
      const allowance1 = await token1.allowance(await signer.getAddress(), FREE_WILL_SWAP_ADDRESS)
      if(allowance1.lt(utils.parseEther(tokenAmount1))) {
        const approveTx = await token1.approve(FREE_WILL_SWAP_ADDRESS, utils.parseEther(tokenAmount1))
        const approveTxr = await approveTx.wait()
        console.log(approveTxr)
      }
      const token2 = new ethers.Contract(tokenAddress2, ERC20_ABI, signer)
      const allowance2 = await token2.allowance(await signer.getAddress(), FREE_WILL_SWAP_ADDRESS)
      if(allowance2.lt(utils.parseEther(tokenAmount2))) {
        const approveTx = await token2.approve(FREE_WILL_SWAP_ADDRESS, utils.parseEther(tokenAmount2))
        const approveTxr = await approveTx.wait()
        console.log(approveTxr)
      }
      const fwSwap = new ethers.Contract(FREE_WILL_SWAP_ADDRESS, FREE_WILL_SWAP_ABI, signer)
      const tx = await fwSwap.addLiquidity(
        tokenAddress1,
        tokenAddress2,
        utils.parseEther(tokenAmount1),
        utils.parseEther(tokenAmount2)
      )
      const txr = await tx.wait()
      console.log(txr)
      setTokenAddress1('')
      setTokenAmount1('')
      setTokenAddress2('')
      setTokenAmount2('')
      getPools()
      setCreateTokenPairBtnLoading(false)
    } catch(error) {
      console.log(error)
      setCreateTokenPairBtnLoading(false)
    }
  }
  
  return (
    <>
      { !creatingPair &&
        <Button onClick={handleCreatePair}>Create Pair</Button>
      }
      { creatingPair &&
        <Paper
          elevation={0}
          sx={{ py: '20px', borderRadius: '20px' }}
        >
          { ethPair
            ?
              <>
                <Stack
                  direction="row"
                  justifyContent="center"
                  alignItems="flex-start"
                  spacing={4}
                  m={3}
                >
                  <div>
                    <Typography pl={1}>Amount</Typography>
                    <Paper 
                      elevation={0}
                      component='form'
                      sx={{ 
                        px: '20px', 
                        py: '10px', 
                        display: 'flex', 
                        alignItems: 'center',
                        backgroundColor: '#eae7f7',
                        borderRadius: '10px'
                      }}
                    >
                      <InputBase
                        value={ethAmount}
                        onChange={(e) => {
                          const regex = /^\d*\.?\d*$/
                          if (e.target.value === '' || regex.test(e.target.value)) {
                            setEthAmount(e.target.value)
                          }
                        }}
                      ></InputBase>
                      <Typography ml={1}>ETH</Typography>
                    </Paper>
                  </div>
                </Stack>
                <Stack
                  direction="row"
                  justifyContent="center"
                  alignItems="flex-start"
                  spacing={2}
                  m={3}
                >
                  <div>
                    <Typography pl={1}>Token Address</Typography>
                    <Paper 
                      elevation={0}
                      component='form'
                      sx={{ 
                        px: '20px', 
                        py: '10px', 
                        display: 'flex', 
                        alignItems: 'center',
                        backgroundColor: '#eae7f7',
                        borderRadius: '10px'
                      }}
                    >
                      <InputBase
                        value={tokenAddress}
                        onChange={(e) => {
                          setTokenAddress(e.target.value)
                        }}
                      ></InputBase>
                    </Paper>
                  </div>
                  <div>
                    <Typography pl={1}>Amount</Typography>
                    <Paper 
                      elevation={0}
                      component='form'
                      sx={{ 
                        px: '20px',
                        py: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: '#eae7f7',
                        borderRadius: '10px'
                      }}
                    >
                      <InputBase
                        value={tokenAmount}
                        onChange={(e) => {
                          const regex = /^\d*\.?\d*$/
                          if (e.target.value === '' || regex.test(e.target.value)) {
                            setTokenAmount(e.target.value)
                          }
                        }}
                      ></InputBase>
                    </Paper>
                  </div>
                </Stack>
                <Stack
                  direction="row"
                  justifyContent="center"
                  alignItems="center"
                  spacing={2}
                  mb={2}
                >
                  <Button onClick={handleCancel}>Cancel</Button>
                  <LoadingButton
                    variant='contained'
                    onClick={createEthPair}
                    loading={createEthPairBtnLoading}
                  >
                    Create Pair
                  </LoadingButton>
                </Stack>
                <Stack>
                  <Button size='small' onClick={toggleToTokenPair}>
                    Create Token Pair
                  </Button>
                </Stack>
              </>
            :
              <>
                <Stack
                  direction="row"
                  justifyContent="center"
                  alignItems="flex-start"
                  spacing={2}
                  m={3}
                >
                  <div>
                    <Typography pl={1}>Token1 Address</Typography>
                    <Paper
                      elevation={0}
                      component='form'
                      sx={{ 
                        px: '20px', 
                        py: '10px', 
                        display: 'flex', 
                        alignItems: 'center',
                        backgroundColor: '#eae7f7',
                        borderRadius: '10px'
                      }}
                    >
                      <InputBase
                        value={tokenAddress1}
                        onChange={(e) => {
                          setTokenAddress1(e.target.value)
                        }}
                      ></InputBase>
                    </Paper>
                  </div>
                  <div>
                    <Typography pl={1}>Amount1</Typography>
                    <Paper 
                      elevation={0}
                      component='form'
                      sx={{ 
                        px: '20px', 
                        py: '10px', 
                        display: 'flex', 
                        alignItems: 'center',
                        backgroundColor: '#eae7f7',
                        borderRadius: '10px'
                      }}
                    >
                      <InputBase
                        value={tokenAmount1}
                        onChange={(e) => {
                          const regex = /^\d*\.?\d*$/
                          if (e.target.value === '' || regex.test(e.target.value)) {
                            setTokenAmount1(e.target.value)
                          }
                        }}
                      ></InputBase>
                    </Paper>
                  </div>
                </Stack>
                <Stack
                  direction="row"
                  justifyContent="center"
                  alignItems="flex-start"
                  spacing={2}
                  m={3}
                >
                  <div>
                    <Typography pl={1}>Token2 Address</Typography>
                    <Paper 
                      elevation={0}
                      component='form'
                      sx={{ 
                        px: '20px', 
                        py: '10px', 
                        display: 'flex', 
                        alignItems: 'center',
                        backgroundColor: '#eae7f7',
                        borderRadius: '10px'
                      }}
                    >
                      <InputBase
                        value={tokenAddress2}
                        onChange={(e) => {
                          setTokenAddress2(e.target.value)
                        }}
                      ></InputBase>
                    </Paper>
                  </div>
                  <div>
                    <Typography pl={1}>Amount2</Typography>
                    <Paper 
                      elevation={0}
                      component='form'
                      sx={{ 
                        px: '20px',
                        py: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: '#eae7f7',
                        borderRadius: '10px'
                      }}
                    >
                      <InputBase
                        value={tokenAmount2}
                        onChange={(e) => {
                          const regex = /^\d*\.?\d*$/
                          if (e.target.value === '' || regex.test(e.target.value)) {
                            setTokenAmount2(e.target.value)
                          }
                        }}
                      ></InputBase>
                    </Paper>
                  </div>
                </Stack>
                <Stack
                  direction="row"
                  justifyContent="center"
                  alignItems="center"
                  spacing={2}
                  mb={2}
                >
                  <Button onClick={handleCancel}>Cancel</Button>
                  <LoadingButton
                    variant='contained'
                    onClick={createTokenPair}
                    loading={createTokenPairBtnLoading}
                  >
                    Create Pair
                  </LoadingButton>
                </Stack>
                <Stack>
                  <Button
                    onClick={toggleToEthPair}
                  >
                    Create ETH Pair
                  </Button>
                </Stack>
              </>
          }
        </Paper>
      }
    </>
  )
}