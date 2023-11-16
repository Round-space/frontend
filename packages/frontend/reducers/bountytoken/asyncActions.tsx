/* eslint-disable @typescript-eslint/no-unused-vars, no-console , react/no-unescaped-entities */
import {  setNewBountyCurrencyUSDPrice,
  setReadingCurrencyPrice } from './reducer'

  import {  setNewFundCurrencyUSDPrice,
    setFundReadingCurrencyPrice } from './fundReducer'
import {

  ICurrency,
} from '../wallet/state'
import { getPricingToken } from '../../constants/tokens';

import { supportedChains } from '../../constants/network'

import { Moralis } from 'moralis'

interface ITokenApi {
  getTokenPrice( options : any);
}


export function  getTokenPrice(dispatch,myToken : ICurrency,  tokenApi : ITokenApi, fundBounty : boolean = false ) {

  try{
    if (!tokenApi)
    return
    dispatch(setReadingCurrencyPrice(true))
    
    // in case wallet is not connected, then no way of knowing the current chain, so use the default one
    if( myToken.chain === undefined ) {
      myToken = {...myToken, chain: supportedChains[0]}
    }
    const pricingToken = getPricingToken(myToken);
    
    const options = {
      address: pricingToken.address,
      chain: 1
//      chain: myToken.chain == 4? 'rinkeby' : 'eth',
    };
    console.log('Calling getTokenPrice with Options:',options);
    const appId =  process.env.NEXT_PUBLIC_MORALIS_APP_ID;
    const serverUrl = process.env.NEXT_PUBLIC_MORALIS_SERVER_URL;
    Moralis.start({appId, serverUrl});
    Moralis.Cloud.run('getTokenPrice', options).then((price) => {
    
      console.log('Received Price',price);
      if(fundBounty) {
        dispatch( setNewFundCurrencyUSDPrice(price.usdPrice) );
      }

      dispatch( setNewBountyCurrencyUSDPrice(price.usdPrice) );
      
      if(fundBounty) {
        dispatch( setFundReadingCurrencyPrice(false) )
      }

      dispatch( setReadingCurrencyPrice(false) );
    })
    .catch((err) => {
      console.log(
        'Something Failed Defaulting rate to 0:',JSON.stringify(err.message)
      )
      
      if(fundBounty) {
        dispatch( setNewFundCurrencyUSDPrice(0) );
        dispatch( setFundReadingCurrencyPrice(false) );
      }

      dispatch( setNewBountyCurrencyUSDPrice(0) );
      dispatch( setReadingCurrencyPrice(false) );
      
    })

  
  }catch(err){
    console.log(err.message);
    
    if(fundBounty) {
      dispatch( setFundReadingCurrencyPrice(false) );
    }

    dispatch( setReadingCurrencyPrice(false) );

  }
}