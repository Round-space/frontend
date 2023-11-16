import { ICurrency } from "../reducers/wallet/state"
import { Currency , Ether , Token } from "@uniswap/sdk-core"

export const toCurrency = ( tokenBalance : ICurrency) : undefined | Currency =>{

    if(tokenBalance === undefined || tokenBalance == null || tokenBalance.chain === undefined || tokenBalance.chain === null)
        return undefined;
    
    if(tokenBalance.isNative )
        return  Ether.onChain(tokenBalance.chain);
    
    return new Token(tokenBalance.chain,tokenBalance.token_address,tokenBalance.decimals,tokenBalance.symbol,tokenBalance.name);

} 