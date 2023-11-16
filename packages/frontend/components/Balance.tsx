import { Text } from '@chakra-ui/react'
import { utils , BigNumber} from 'ethers'
import { useAppSelector } from '../types/hooks'
/**
 * Component
 */
export function Balance(): JSX.Element {
  const walletState = useAppSelector((state)=>state.wallet);

  if(walletState.nativeBalance == null)
  return <></>
  const finalBalance = walletState.nativeBalance ? utils.formatEther( BigNumber.from(walletState.nativeBalance) ).slice(0,5) : ''
  return <Text>{finalBalance}&nbsp;{walletState.nativeSymbol}</Text>
}
