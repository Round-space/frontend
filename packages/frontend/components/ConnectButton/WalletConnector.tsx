import React, { useEffect, useState } from 'react'

import { useAccount, useNetwork, useConnect, useProvider } from 'wagmi';

import { useAppDispatch, useAppSelector } from '../../types/hooks'
import { setCurrentAccountEnsAvatar, setCurrentAccountEnsName, setNativeBalance, setTokenAmounts } from '../../reducers/wallet/state'

import {
  setChainId,
  setConnectingError,
  setConnectingWallet,
  
  setWalletConnected,
  WalletTypeEnum
} from '../../reducers/wallet/state'

import { UserMenu } from './UserMenu'
import { useMoralis} from 'react-moralis';

import { fetchBalance } from '@wagmi/core';
import { supportedChains } from '../../constants/network';
import { useQueryEnsName } from '../../hooks/useQueryEnsName';
import { useQueryEnsAvatar } from '../../hooks/useQueryEnsAvatar';

export const WalletConnector = (props) => {
  
  const dispatch = useAppDispatch();
  
  const { activeChain: chain } = useNetwork()
  const chainId = chain?.id
  const { data: accountData } = useAccount();
  const account = accountData?.address
  const { isConnected: connected, error } = useConnect();
  
  const [lastAccount, setLastAccount] = useState(account);

  const [ isCorrectChain, setIsCorrectChain ] = useState(true);

  useEffect(() => {
      if(chain) {
          setIsCorrectChain(supportedChains.includes(chain?.id));
      }
  }, [chain])

  
  const walletState = useAppSelector((state) => state.wallet)

  
  const provider = useProvider()
  
  const ensName = useQueryEnsName( account );
  const ensAvatar = useQueryEnsAvatar( account );

  useEffect(() => {
      dispatch(setCurrentAccountEnsName(ensName))
  }, [ensName, account]);

  useEffect(() => {
    dispatch(setCurrentAccountEnsAvatar(ensAvatar))
}, [ensAvatar, account]);

  useEffect(() => {
      if(account && provider?.network?.chainId) {
          fetchBalance({
            addressOrName: account
          }).then((res) => {
            if ( connected && isCorrectChain && res ) {
              const strBalance = res.value.toString()
              if (
                walletState.nativeBalance != null &&
                walletState.nativeBalance == strBalance
              )
                return
              dispatch(setNativeBalance(strBalance))
            }
          })
      }
  }, [provider?.network?.chainId, account])


  const {
    Moralis,
    isInitialized
  } = useMoralis()

  useEffect(() => {
    if(chainId )  {
      dispatch(setChainId(chainId))
    }
  }, [chainId])

  useEffect(() => {
    if(error) {
      dispatch(setConnectingError(error))
    }
  }, [error])

  useEffect(() => {
    if(connected) {
      switch(accountData?.connector?.id) {
        case 'metaMask':
          dispatch(setConnectingWallet(WalletTypeEnum.MetaMask));
          break;
        case 'walletConnect':
          dispatch(setConnectingWallet(WalletTypeEnum.WalletConnect));
          break;
      }
    } else {
      dispatch(setConnectingWallet(WalletTypeEnum.None));
    }
  }, [accountData?.connector?.id, connected])

  useEffect(() => {
    if(connected && account) {
      // in case of address switching in same wallet
      if(account !== lastAccount) {
        setLastAccount(account)
      }
      dispatch(setWalletConnected({ account }))
    }
  }, [connected, account])

  

  const getMoralisTokens = async () => {
    try {
      if (walletState.chainMeta != null && isInitialized) {
        
        const options = {
          chain: walletState.chainMeta?.chainId,
          address: account,
        }
        //TODO: GET BALANCES FROM ERC CONTRACTS USING HOOK
        const appId =  process.env.NEXT_PUBLIC_MORALIS_APP_ID;
        const serverUrl = process.env.NEXT_PUBLIC_MORALIS_SERVER_URL;
        Moralis.start({appId, serverUrl});
        const tokenBalances = await Moralis.Cloud.run('getTokenBalances', options)
        dispatch(
          setTokenAmounts(
            tokenBalances.map((m) => {
              return {
                ...m,
                decimals: Number.parseFloat(m.decimals),
                isNative: false,
                isToken: true,
                chain: chainId,
              }
            })
          )
        )
      }
    } catch (err) {
      // console.log(err)
    }
  }

  useEffect(() => {
    getMoralisTokens()
  }, [walletState.chainMeta, chainId, account])
  

  return (
    <UserMenu simpleButton={props.simpleButton}></UserMenu>
  )
}