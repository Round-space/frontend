/* eslint-disable @typescript-eslint/no-unused-vars, no-console ,react/no-unescaped-entities,react/no-children-prop */
import { MaxUint256 } from '@ethersproject/constants'
import { TransactionResponse } from '@ethersproject/providers'
import {Currency, CurrencyAmount  } from '@uniswap/sdk-core'
// import { shortenTransactionHash } from '@usedapp/core'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAccount, useNetwork } from 'wagmi'
// import { RootState, useAppSelector } from '../reducers'


import { TransactionType } from '../reducers/transactions/actions'
import { useHasPendingApproval, useIsTransactionConfirmed, useTransactionAdder } from '../reducers/transactions/hooks'
import { calculateGasMargin } from '../utils/calculateGasMargin'
import { useTokenContract } from './useContract'
// import { useFormattedTokenAllowance } from './useFormattedTokenAllowance'

export enum ApprovalState {
  UNKNOWN = 'UNKNOWN',
  NOT_APPROVED = 'NOT_APPROVED',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
}

// returns a variable indicating the state of the approval and a function which approves if necessary or early returns
export function useApproveCallback(
  amountToApprove?: CurrencyAmount<Currency>,
  spender?: string,
  overrideAddress = null,
  overrideSigner = null
): [ApprovalState, () => Promise<void>, boolean] {
  
  const { data: accountData } = useAccount();
  const account = overrideAddress ? overrideAddress : accountData?.address;
  const { activeChain: chain } = useNetwork();
  const chainId = chain?.id;
  const token = amountToApprove?.currency?.isToken ? amountToApprove.currency : undefined
  
  const tokenContract = useTokenContract(token?.address, true, overrideSigner)
  
  const [approving, setApproving] = useState<boolean>(false);
  
  // const bountyState = useAppSelector((state: RootState) => { return state.bounties; });
  
  // const [lastTokenAmount, setLastTokenAmount] = useState(bountyState?.bounty?.tokenAmount);
  // const currentAllowance = useFormattedTokenAllowance(token, account ?? undefined, spender)
  const [currentAllowance, setCurrentAllowance] = useState(null);
  useEffect(() => {
    
    if(tokenContract && account && spender) {

      tokenContract.allowance(account ?? undefined, spender ?? undefined).then(allowance => {
    
        setCurrentAllowance(CurrencyAmount.fromRawAmount(token, allowance.toString()));
      }).catch((e) => {
        console.log('error allowance', e);
        setCurrentAllowance(null);
      })
    }
    else {
      setCurrentAllowance(null);
    }
  }, [tokenContract, account, spender]);

  // The below may be required if approval is taken for exact amounts, but for now we'll just use the max
  // useEffect(() => {
  //   if(bountyState?.bounty?.tokenAmount > lastTokenAmount) {
  //     setCurrentAllowance(null);
  //   }
  // }, [bountyState?.bounty?.tokenAmount])
  

  const pendingApproval = useHasPendingApproval(token?.address, spender)
  
  // check the current approval status
  const approvalState: ApprovalState = useMemo(() => {
    if (!amountToApprove || !spender) return ApprovalState.UNKNOWN
    if (amountToApprove.currency.isNative) return ApprovalState.APPROVED
    // we might not have enough data to know whether or not we need to approve
    if (!currentAllowance) return ApprovalState.UNKNOWN

    // amountToApprove will be defined if currentAllowance is
    return currentAllowance.lessThan(amountToApprove)
      ? pendingApproval 
        ? ApprovalState.PENDING
        : ApprovalState.NOT_APPROVED
      : ApprovalState.APPROVED
  }, [amountToApprove, currentAllowance, pendingApproval, spender])

  
  
  const addTransaction = useTransactionAdder()

  const approve = useCallback(async ( ): Promise<void> => {
    
    if (approvalState !== ApprovalState.NOT_APPROVED) {
      console.error('approve was called unnecessarily')
      return
    }
    if (!chainId) {
      console.error('no chainId')
      return
    }

    if (!token) {
      console.error('no token')
      return
    }

    if (!tokenContract) {
      console.error('tokenContract is null')
      return
    }

    if (!amountToApprove) {
      console.error('missing amount to approve')
      return
    }

    if (!spender) {
      console.error('no spender')
      return
    }

    

    let useExact = false
    const estimatedGas = await tokenContract.estimateGas.approve(spender, MaxUint256)
    .catch(() => {
      // general fallback for tokens who restrict approval amounts
      useExact = true
      return tokenContract.estimateGas.approve(spender, amountToApprove.quotient.toString())
    })
    
    return tokenContract
      .approve(spender, useExact ? amountToApprove.quotient.toString() : MaxUint256, {
        gasLimit: calculateGasMargin(chainId, estimatedGas),
      })
      .then((response: TransactionResponse) => {
        if(response.hash) {
          setApproving(true);
          // wait for Approval event
          tokenContract.on('Approval', async function (owner, aspender, value, event) {

            if( owner === account && aspender === spender ) {
              tokenContract.allowance(owner ?? undefined, aspender ?? undefined).then(allowance => {
                // console.log('latest allowance', allowance.toString())
                setCurrentAllowance(CurrencyAmount.fromRawAmount(token, allowance.toString()));
              }).catch(() => {
                setCurrentAllowance(null);
              }).finally(() => {
                setApproving(false);
              });
              tokenContract.removeAllListeners('Approval');
            }
          });
          
        }
        addTransaction(response, { type: TransactionType.APPROVAL, tokenAddress: token.address, spender })
      })
      .catch((error: Error) => {
        console.debug('Failed to approve token', error)
        throw error
      })
  }, [approvalState, token, tokenContract, amountToApprove, account, spender, addTransaction, chainId])

  return [approvalState, approve, approving]
}

