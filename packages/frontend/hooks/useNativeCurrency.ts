/* eslint-disable @typescript-eslint/no-unused-vars, no-console ,react/no-unescaped-entities,react/no-children-prop */
import { useMemo } from 'react'
import { AikidoCurrency } from '../constants/tokens'

export default function useNativeCurrency(): AikidoCurrency | null | undefined {
  const nativeCurrency = useMemo(
    () => AikidoCurrency.getChainCurrency(Number.parseInt(process.env.NEXT_PUBLIC_MORALIS_SERVER_NETWORK)),
    [process.env.NEXT_PUBLIC_MORALIS_SERVER_NETWORK]
  )
  return nativeCurrency
}


