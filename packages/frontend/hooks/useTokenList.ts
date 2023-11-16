import { useEffect, useMemo, useState } from 'react'

import {  IMoralisTokenSummary } from '../reducers/wallet/state'
import { ICurrencyValue } from '../reducers/bountytoken/reducer'
import useNativeCurrency from './useNativeCurrency'
import { useAccount, useNetwork } from 'wagmi'
import { supportedChains } from '../constants/network'
import { fetchBalance } from '@wagmi/core'

export const useTokenList = (accountTokens: IMoralisTokenSummary[]) => {
    const { data: accountData } = useAccount();
    const account = accountData?.address
    const { activeChain: chain } = useNetwork()
    const chainId = chain?.id;
    const nativeCurrency = useNativeCurrency();
    const [ isCorrectChain, setIsCorrectChain ] = useState(true);
    const [ nativeBalance, setNativeBalance ] = useState<any>();
    const [ userBalance, setUserBalance ] = useState<any>();
    
    const tokenList = useMemo(() => {
      // if (!chainId || !connected || !isCorrectChain || !nativeBalance) return []
      
      const nativeCurrencyToken = nativeCurrency.pricingToken;
      const wethList = [
        {
          currency: {
            chain: isCorrectChain ? chainId : supportedChains[0],
            token_address: nativeCurrencyToken.address,
            symbol: nativeCurrency.symbol,
            isNative: nativeCurrencyToken.isNative,
            isToken : false,
            decimals: nativeCurrencyToken.decimals,
            name: nativeCurrency.name,
            logo: 'images/ethereum-logo.png',
          },
          amount: nativeBalance ? nativeBalance.toString() : 0,
        } as ICurrencyValue,
      ]
  
      const accountList = accountTokens.map((t: IMoralisTokenSummary) => {
        return {
          currency: {
            chain: chainId,
            token_address: t.token_address,
            symbol: t.symbol,
            isNative: t.isNative,
            decimals: t.decimals,
            name: t.name,
          },
          amount: t.balance,
        }
      }) as ICurrencyValue[]
  
      return wethList.concat(accountList)
    }, [chainId, accountTokens, nativeBalance])

    useEffect(() => {
        if(chain) {
            setIsCorrectChain(supportedChains.includes(chain?.id));
        }
    }, [chain])
    
    
    useEffect(() => {
      let isMounted = true; 
      if(isCorrectChain && account) {
        fetchBalance({
          addressOrName: account
        }).then(res => {
          if(isMounted) {
            setUserBalance(res)
          }
        })
      }
      return () => { isMounted = false };
    }, [account, isCorrectChain])

    

    useEffect(() => {
      setNativeBalance(userBalance?.value);
    }, [userBalance])

    
    
    
    return tokenList
  }