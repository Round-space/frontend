import {utils, BigNumber} from 'ethers'
import { ICurrency } from '../reducers/wallet/state';


export function toDecimal( str : string , currency: ICurrency) : number{

    if(currency == null || currency.decimals == null)
    return 0;
    const formatted = utils.formatUnits(str,currency.decimals);
    return Number.parseFloat(formatted);
}

export function toCurrencyAmount( newAmount : number , currency: ICurrency) : BigNumber | string | null{

    if(currency == null || currency.decimals == null || newAmount ==null  || Number.isNaN(newAmount))
        return null;

    if( newAmount.toString().indexOf('.') > -1 || newAmount.toString().indexOf('e-') > -1 ) {
        return (newAmount * 10**currency.decimals).toFixed().toString();
    } else {
        return utils.parseUnits(newAmount.toString(),currency.decimals)
    }
    
}