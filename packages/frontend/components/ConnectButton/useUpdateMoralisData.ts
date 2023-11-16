import { useAppDispatch, useAppSelector } from '../../types/hooks'
import {
  MoralisConnectionStatusEnum,
  setMoralisStatus,
  setTokenAmounts,
  setWalletDisconnected,
} from '../../reducers/wallet/state'
import { useEffect, useCallback, useState } from 'react'
import { useMoralis } from 'react-moralis'

import { useAccount, useConnect, useDisconnect, useNetwork } from 'wagmi'

export function useUpdateMoralisData() {
  const { activeChain: chain } = useNetwork()
  const { isConnected: connected } = useConnect();
  
  const chainId = chain?.id;

  const { data: accountData } = useAccount();
  const { disconnect: disconnectAccount } = useDisconnect();
  const [account, setAccount] = useState(accountData?.address);
  
  useEffect(() => {
    setAccount(accountData?.address)
  }, [accountData])



  const disconnect = useCallback(() => {
      setAccount(null);
      
      disconnectAccount();
  }, []);
  
  const {
    // user,
    Moralis,
    logout,
    // isAuthenticating,
    isAuthenticated,
    isInitialized,
    authenticate
  } = useMoralis()

  
  const isInjected = accountData?.connector?.id === 'injected'

  const dispatch = useAppDispatch()
  
  const walletState = useAppSelector((state) => state.wallet)
  const signingMessage = 'Sign with Round';
  const [walletConnected, setWalletConnected] = useState(connected);

  // useEffect(() => {
  //   if(user) {
  //     console.log('user', isAuthenticated, user, user.get('ethAddress'));
  //   }
  // }, [user, isAuthenticated]);

  useEffect(() => {
    setWalletConnected(connected);
  }, [connected]);

  useEffect(() => {
    // do not test against undefined, and if moralis address is not the same as wallet address, then disconect moralis
    if(walletConnected === false && isAuthenticated) {
      logout()
      dispatch(setMoralisStatus(MoralisConnectionStatusEnum.NotAuthenticated))
    }
  }, [walletConnected, isAuthenticated]);

  // in case account switching is done in the wallet, we need to re-authenticate moralis
  const onAccountChange = useCallback(() => {
    // console.log('logging out moralis');
    logout()
    dispatch(setMoralisStatus(MoralisConnectionStatusEnum.NotAuthenticated))
  }, []);

  useEffect(() => {
    if(window.ethereum) {
      if(isInjected) {
        window.ethereum.on('accountsChanged', onAccountChange);
      } else {
        window.ethereum.removeListener('accountsChanged', onAccountChange);
      }
    }
  }, [isInjected]);

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

  /// HANDLE MORALIS AUTHENTICATION
  useEffect(() => {
    if (account && walletConnected) {
      
      if ( isInitialized && !isAuthenticated ) {
        try {
          // console.log('authenticating moralis', isInjected ? 'metamask' : 'walletconnect', account);
          authenticate( isInjected ? { signingMessage } : { signingMessage, provider: 'walletconnect' } ).then(
            (res) => {
              if(res) {
                dispatch(
                  setMoralisStatus(MoralisConnectionStatusEnum.Authenticated)
                )
              } else {
                // console.log('attempting to disconnect')
                disconnect();
                dispatch(setWalletDisconnected());

                dispatch(
                  setMoralisStatus(
                    MoralisConnectionStatusEnum.AuthenticationFailed
                  )
                )
              }
            },
            () => {

              dispatch(
                setMoralisStatus(
                  MoralisConnectionStatusEnum.AuthenticationFailed
                )
              )
            }
          )
        } catch (err) {
          // console.log(err)
        }
        return
      }
      if (
        isAuthenticated &&
        walletState.moralisConnectionStatus !=
          MoralisConnectionStatusEnum.Authenticated
      ) {
        dispatch(setMoralisStatus(MoralisConnectionStatusEnum.Authenticated))
      }
    }
  }, [account, walletConnected, isAuthenticated, isInitialized])

  useEffect(() => {
    getMoralisTokens()
  }, [walletState.chainMeta, chainId, account])
}
