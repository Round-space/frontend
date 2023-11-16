import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import { useMemo } from 'react'
import { useTokenAllowance } from '@usedapp/core'

export function useFormattedTokenAllowance(token?: Token, owner?: string, spender?: string): CurrencyAmount<Token> | undefined {
 
  const allowance = useTokenAllowance(token?.address, owner, spender);
  return useMemo(
    () => (token && allowance ? CurrencyAmount.fromRawAmount(token, allowance.toString()) : undefined),
    [token, allowance]
  )
}
