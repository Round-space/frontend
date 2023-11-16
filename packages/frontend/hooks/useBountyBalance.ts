import { BigNumber } from '@ethersproject/bignumber';
import { useAccount, useBalance, useNetwork } from 'wagmi';
import { utils } from 'ethers';
import { useState, useEffect } from 'react';
import { supportedChains } from '../constants/network';


export  function useMaxBalance(isNative : boolean, tokenAddress:string = null, decimals = 18 ) : number {
    const { data: accountData } = useAccount();
    const account = accountData?.address
    const { activeChain: chain } = useNetwork()
    const [ isCorrectChain, setIsCorrectChain ] = useState(true);
    useEffect(() => {
        if(chain) {
            setIsCorrectChain(supportedChains.includes(chain?.id));
        }
    }, [chain])
    const [ tokenBalance, setTokenBalance ] = useState<any>();

    const { data: userBalance, isLoading: loading } = useBalance({
        addressOrName: account,
        enabled: !!account,
        token: tokenAddress
    });

    useEffect(() => {
        if(!loading && isCorrectChain) {
            setTokenBalance(userBalance);
        } else {
            setTokenBalance(null);
        }
    }, [loading, userBalance, isCorrectChain])

    if(!account)
        return 0;

    if(isNative)
        return Number.parseFloat(utils.formatEther( userBalance ? userBalance.value : '0' ));

    return Number.parseFloat(utils.formatUnits(tokenBalance ? tokenBalance.value : '0', BigNumber.from(decimals)));
}


