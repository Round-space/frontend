//import { SupportedAlgorithm } from "@ethersproject/sha2"
import { SupportedChainId , CHAIN_INFO, MORALIS_CHAIN_NAMES } from "./chains"
import { ethers } from "ethers"

type AddressMap = { [chainId: number]: string }

export const STD_BOUNTY_ADDRESS : AddressMap = {
    [SupportedChainId.MAINNET] :'0x51598ae36102010feca5322098b22dd5b773428b',
    [SupportedChainId.RINKEBY] :'0x6ac6baf770b3ffe2ddb3c5797e47c17cebef2ec4',
    [SupportedChainId.GOERLI] :'0x97a60E136632A4E64ced25AE8ca762C2cc8bc961',
    [SupportedChainId.SEPOLIA] : '0x97a60E136632A4E64ced25AE8ca762C2cc8bc961', //BountyMetaTxRelayer : 0xF9D534f1f3fb864e768cdFf4CbB190CeA015EC63
    [SupportedChainId.POLYGON] :'0xfF7442b6FB0556f13f5234481293b0C11cD3c388',
    [SupportedChainId.POLYGON_MUMBAI] :'0xfF7442b6FB0556f13f5234481293b0C11cD3c388',
}

export const getChainDetails = (chainId ) => {
    const contractAddressData = CHAIN_INFO[chainId];
    if(contractAddressData == null) {
      console.log('Contract not supported on ChainId' +chainId);
      return {
        chainId : chainId,
        info : ethers.constants.AddressZero,
        address : ethers.constants.AddressZero,
        networkName: MORALIS_CHAIN_NAMES[chainId],
      }
    }
  
    const contractAddress = STD_BOUNTY_ADDRESS[chainId];
    const details = {
        chainId : chainId,
        info : contractAddressData,
        address : contractAddress,
        networkName: MORALIS_CHAIN_NAMES[chainId],
      };
    return details;
  } 