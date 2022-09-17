import { Alert, AppBar, Box, Button, IconButton, Link, Menu, MenuItem, Stack, Toolbar, Typography } from '@mui/material';
import { useState, useEffect } from 'react'
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import GitHubIcon from '@mui/icons-material/GitHub'
import MenuIcon from '@mui/icons-material/Menu'

export default function Header(props) {

	const { _setAccount } = props
	const [connected, setConnected] = useState(false)
	const [account, setAccount] = useState('')
	const [network, setNetwork] = useState(null)
	const [web3Modal, setWeb3Modal] = useState(null)
	const [navMenuOpen, setNavMenuOpen] = useState(false)

	const handleOpenNavMenu = () => {
		setNavMenuOpen(true)
	}

	const handleCloseNavMenu = () => {
		setNavMenuOpen(false)
	}
	
	useEffect(() => {
		const web3modal = new Web3Modal({ 
			network: 'goerli',
			cacheProvider: true 
		})
		setWeb3Modal(web3modal)
		// eslint-disable-next-line
	}, []);
	
	useEffect(() => {
		if(web3Modal !== null && web3Modal.cachedProvider) {
			connectWallet()
		}
		// eslint-disable-next-line
	}, [web3Modal])

	useEffect(() => {
		if(web3Modal !== null && account !== '') {
			(async () => {
				const provider = await web3Modal.connect()
				provider.on("accountsChanged", handleAccountChange)
				provider.on("chainChanged", handleChainChange)
			})()
		}
		return async () => {
			if(web3Modal !== null && account !== '') {
				const provider = await web3Modal.connect()
				provider.removeListener("accountsChanged", handleAccountChange)
				provider.removeListener("chainChanged", handleChainChange)
			}
		}
		// eslint-disable-next-line
	}, [web3Modal, account])

	const handleAccountChange = (accounts) => {
		if (accounts.length === 0) {
			web3Modal.clearCachedProvider()
			setConnected(false)
			setAccount('')
		}
		else if (accounts[0] !== account) {
			setAccount(accounts[0])
		}
	}

	const handleChainChange = (chainId) => {
		setNetwork(chainId)
	}

	const connectWallet = async () => {
		const instance = await web3Modal.connect()
		setConnected(true)
		setAccount(instance.selectedAddress)
		_setAccount(instance.selectedAddress)
		setNetwork(instance.chainId)
		const provider = new ethers.providers.Web3Provider(instance)
	}

	const disconnectWallet = async () => {
		web3Modal.clearCachedProvider()
		setConnected(false)
	}

	return(
		<Box>
			<AppBar
				position="sticky"
				sx={{backgroundColor: "#319AEB"}}
			>
				{ network !== null && network !== '0x5' &&
				<Alert
					variant='filled'
					severity='warning'
					sx={{justifyContent: 'center', borderRadius: 0}}
				>
					Switch to Goerli Testnet
				</Alert>
			}
				<Toolbar>
					<Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={navMenuOpen}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
							<MenuItem onClick={handleCloseNavMenu}>
								<Link
									href="https://freewillfinance.vercel.app"
									underline="hover"
									sx={{color: '#319AEB'}}
									target='_blank'
									rel="noopener"
								>
									FreeWill Swap(DEX)
								</Link>
							</MenuItem>
							<MenuItem onClick={handleCloseNavMenu}>
								<Link
									href="https://github.com/SaTiSH-K-R/FreeWillSwap"
									underline="hover"
									sx={{color: '#319AEB'}}
									target='_blank'
									rel="noopener"
								>
									<Stack direction='row'>
										<Typography>Github Repo</Typography>
										<GitHubIcon />
									</Stack>
								</Link>
							</MenuItem>
							<MenuItem onClick={handleCloseNavMenu}>
								<Link
									href="https://www.linkedin.com/in/SatishKR1/"
									underline="hover"
									sx={{color: '#319AEB'}}
									target='_blank'
									rel="noopener"
									aria-label='See my Profile'
								>
									<Stack direction='row'>
										<Typography>LinkedIn</Typography>
										<LinkedInIcon />
									</Stack>
								</Link>
							</MenuItem>
							<MenuItem onClick={handleCloseNavMenu}>
									<Link
										href="https://goerlifaucet.com/"
										underline="hover"
										sx={{color: '#319AEB'}}
										target='_blank'
										rel="noopener"
									>
										Goerli Faucet
									</Link>
							</MenuItem>
            </Menu>
          </Box>
					<Typography
						variant="h5"
						component="div"
						sx={{ flexGrow: 1, color: "white", display: {xs: 'none', md: 'block'} }}
					>
						Freewill Swap
					</Typography>
					<Stack
						spacing={3}
						direction='row'
						sx={{
							display: { xs: 'none', md: 'flex' },
							mr: 3
						}}
					>
						<Link
							href="https://github.com/SaTiSH-K-R/FreeWillSwap"
							underline="hover"
							sx={{color: 'white'}}
							target='_blank'
							rel="noopener"
						>
							<Stack direction='row'>
								<Typography>Github Repo</Typography>
								<GitHubIcon />
							</Stack>
						</Link>
						<Link
							href="https://www.linkedin.com/in/SatishKR1/"
							underline="hover"
							sx={{color: 'white'}}
							target='_blank'
							rel="noopener"
							aria-label='See my Profile'
						>
							<Stack direction='row'>
								<Typography>LinkedIn</Typography>
								<LinkedInIcon />
							</Stack>
						</Link>
						<Link
							href="https://freewillfinance.vercel.app"
							underline="hover"
							sx={{color: 'white'}}
							target='_blank'
							rel="noopener"
						>
							FreeWill Finance(DeFi)
						</Link>
						<Link
							href="https://goerlifaucet.com/"
							underline="hover"
							sx={{color: 'white'}}
							target='_blank'
							rel="noopener"
						>
							Goerli Faucet
						</Link>
					</Stack>
					{
						connected && account !== ''
						? 
							<Button
								variant='contained'
								sx={{ borderRadius: "10px" }}
								onClick={disconnectWallet}
							>
								{`${account.substring(0, 8)}.....${account.substring(37, 42)}`}
							</Button>
						:
							<Button
								variant='contained'
								sx={{ borderRadius: "10px" }}
								onClick={connectWallet}
							>
								Connect Wallet
							</Button>
					}
				</Toolbar>
			</AppBar>
		</Box>
	)
}