import { setNativeBalance } from '../../reducers/wallet/state'
import { useAppDispatch, useAppSelector } from '../../types/hooks'
import { useEffect, useState } from 'react'
import { useAccount, useBalance, useConnect, useNetwork } from 'wagmi';
import { supportedChains } from '../../constants/network';

export function useUpdateEtherBalance() {
  const dispatch = useAppDispatch()
  const walletState = useAppSelector((state) => state.wallet)
  const { data: accountData } = useAccount();
  const account = accountData?.address
  const { activeChain: chain } = useNetwork()
  const { isConnected: connected } = useConnect();

  const [ isCorrectChain, setIsCorrectChain ] = useState(true);

  useEffect(() => {
      if(chain) {
          setIsCorrectChain(supportedChains.includes(chain?.id));
      }
  }, [chain])

  const { data: userBalance } = useBalance({
    addressOrName: account,
    enabled: !!account
  });
  

  useEffect(() => {
    if ( connected && isCorrectChain && userBalance ) {
      const strBalance = userBalance.value.toString()
      if (
        walletState.nativeBalance != null &&
        walletState.nativeBalance == strBalance
      )
        return
      dispatch(setNativeBalance(strBalance))
    }
  }, [userBalance])
}
