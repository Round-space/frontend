import { Contract } from '@ethersproject/contracts'
import {useMemo,} from 'react'
import { ERC20 } from "../types/typechain"
import ERC20_METADATA from '../artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json'

import { getContract } from '../utils'
import { useAccount, useNetwork, useSigner, useProvider } from 'wagmi'
import { ethers } from 'ethers'



export function useContract<T extends Contract = Contract>(
    addressOrAddressMap: string | { [chainId: number]: string } | undefined,
    ABI: any,
    withSignerIfPossible = true,
    overrideSigner = null
  ): T | null {
      
    const { data: accountData } = useAccount();
    const account = accountData?.address
    const provider = useProvider();
    const { data: signer } = useSigner();
    const { activeChain: chain } = useNetwork()
    const chainId = chain?.id;
  
    return useMemo(() => {
      if (!addressOrAddressMap || !ABI || !signer || !chainId) return null
      let address: string | undefined
      if (typeof addressOrAddressMap === 'string') address = addressOrAddressMap
      else address = addressOrAddressMap[chainId]
      if (!address) return null
      try {
        return getContract(address, ABI, withSignerIfPossible ? (overrideSigner ? overrideSigner : signer) : provider, withSignerIfPossible && account ? account : undefined)
      } catch (error) {
        console.error('Failed to get contract', error)
        return null
      }
    }, [addressOrAddressMap, ABI, signer, chainId, withSignerIfPossible, account, overrideSigner]) as T
  }

export function useTokenContract(tokenAddress?: string, withSignerIfPossible?: boolean, overrideSigner = null) {
    if(tokenAddress === ethers.constants.AddressZero) {
      return null
    }

    return useContract<ERC20>(tokenAddress, ERC20_METADATA.abi, withSignerIfPossible, overrideSigner)
  }