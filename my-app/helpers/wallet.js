import { ethers } from "ethers"
import Web3Modal from "web3modal"

export async function getProviderOrSigner(signer = false) {
    const web3Modal = new Web3Modal({ cacheProvider: true })
    const instance = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(instance);
    if(signer == false) {
        return provider
    }
    return provider.getSigner()
}