import { useState, useEffect } from 'react'
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { ethers, providers } from 'ethers';
import Web3Modal from 'web3modal';

export default function Header(props) {

	const { _setAccount } = props
	const [connected, setConnected] = useState(false)
	const [account, setAccount] = useState('')
	const [network, setNetwork] = useState('')
	const [web3Modal, setWeb3Modal] = useState(null)
	
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
		console.log(accounts)
		if (accounts.length === 0) {
			web3Modal.clearCachedProvider()
			setConnected(false)
			setAccount('')
		}
		else if (accounts[0] !== account) {
			console.log(accounts[0])
			setAccount(accounts[0])
		}
	}

	const handleChainChange = (chainId) => {
		if(chainId !== '0x5') {
			window.alert("Please swith to Goerli Network")
		}
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
				sx={{backgroundColor: "white"}}
			>
				<Toolbar>
					<Typography
						variant="h5"
						component="div"
						sx={{ flexGrow: 1, color: "black" }}
					>
						Freewill Swap
					</Typography>
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