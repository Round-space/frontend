import { Token, WETH9 } from '@uniswap/sdk-core'
import { ICurrency } from '../reducers/wallet/state'
import { SupportedChainId, isTestChain, MORALIS_CHAIN_NAMES } from './chains'
import ethereumLogoUrl from '../assets/images/ethereum-logo.png'

export const AMPL = new Token(
  SupportedChainId.MAINNET,
  '0xD46bA6D942050d489DBd938a2C909A5d5039A161',
  9,
  'AMPL',
  'Ampleforth'
)

export const DAI = new Token(
  SupportedChainId.MAINNET,
  '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  18,
  'DAI',
  'Dai Stablecoin'
)
export const DAI_ARBITRUM_ONE = new Token(
  SupportedChainId.ARBITRUM_ONE,
  '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
  18,
  'DAI',
  'Dai stable coin'
)
export const DAI_OPTIMISM = new Token(
  SupportedChainId.OPTIMISM,
  '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
  18,
  'DAI',
  'Dai stable coin'
)
export const USDC = new Token(
  SupportedChainId.MAINNET,
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  6,
  'USDC',
  'USD//C'
)
export const USDC_ARBITRUM = new Token(
  SupportedChainId.ARBITRUM_ONE,
  '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
  6,
  'USDC',
  'USD//C'
)
export const USDC_OPTIMISM = new Token(
  SupportedChainId.OPTIMISM,
  '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
  6,
  'USDC',
  'USD//C'
)
export const USDT = new Token(
  SupportedChainId.MAINNET,
  '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  6,
  'USDT',
  'Tether USD'
)
export const USDT_ARBITRUM_ONE = new Token(
  SupportedChainId.ARBITRUM_ONE,
  '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
  6,
  'USDT',
  'Tether USD'
)
export const USDT_OPTIMISM = new Token(
  SupportedChainId.OPTIMISM,
  '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
  6,
  'USDT',
  'Tether USD'
)
export const WBTC = new Token(
  SupportedChainId.MAINNET,
  '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
  8,
  'WBTC',
  'Wrapped BTC'
)
export const WBTC_ARBITRUM_ONE = new Token(
  SupportedChainId.ARBITRUM_ONE,
  '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
  8,
  'WBTC',
  'Wrapped BTC'
)
export const WBTC_OPTIMISM = new Token(
  SupportedChainId.OPTIMISM,
  '0x68f180fcCe6836688e9084f035309E29Bf0A2095',
  8,
  'WBTC',
  'Wrapped BTC'
)
export const FEI = new Token(
  SupportedChainId.MAINNET,
  '0x956F47F50A910163D8BF957Cf5846D573E7f87CA',
  18,
  'FEI',
  'Fei USD'
)
export const TRIBE = new Token(
  SupportedChainId.MAINNET,
  '0xc7283b66Eb1EB5FB86327f08e1B5816b0720212B',
  18,
  'TRIBE',
  'Tribe'
)
export const FRAX = new Token(
  SupportedChainId.MAINNET,
  '0x853d955aCEf822Db058eb8505911ED77F175b99e',
  18,
  'FRAX',
  'Frax'
)
export const FXS = new Token(
  SupportedChainId.MAINNET,
  '0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0',
  18,
  'FXS',
  'Frax Share'
)
export const renBTC = new Token(
  SupportedChainId.MAINNET,
  '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D',
  8,
  'renBTC',
  'renBTC'
)
export const ETH2X_FLI = new Token(
  SupportedChainId.MAINNET,
  '0xAa6E8127831c9DE45ae56bB1b0d4D4Da6e5665BD',
  18,
  'ETH2x-FLI',
  'ETH 2x Flexible Leverage Index'
)

export const MATIC =  new Token(
  SupportedChainId.MAINNET,
  '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',
  18,
  'MATIC',
  'Matic'
);

export const WETH9_EXTENDED: { [chainId: number]: Token } = {
  ...WETH9,
  [SupportedChainId.OPTIMISM]: new Token(
    SupportedChainId.OPTIMISM,
    '0x4200000000000000000000000000000000000006',
    18,
    'WETH',
    'Wrapped Ether'
  ),
  [SupportedChainId.OPTIMISTIC_KOVAN]: new Token(
    SupportedChainId.OPTIMISTIC_KOVAN,
    '0x4200000000000000000000000000000000000006',
    18,
    'WETH',
    'Wrapped Ether'
  ),
  [SupportedChainId.ARBITRUM_ONE]: new Token(
    SupportedChainId.ARBITRUM_ONE,
    '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    18,
    'WETH',
    'Wrapped Ether'
  ),
  [SupportedChainId.ARBITRUM_RINKEBY]: new Token(
    SupportedChainId.ARBITRUM_RINKEBY,
    '0xB47e6A5f8b33b3F17603C83a0535A9dcD7E32681',
    18,
    'WETH',
    'Wrapped Ether'
  ),
  [SupportedChainId.GOERLI]: new Token(
    SupportedChainId.GOERLI,
    '0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6',
    18,
    'WETH',
    'Wrapped Ether'
  ),
  [SupportedChainId.SEPOLIA]: new Token(
    SupportedChainId.SEPOLIA,
    '0x7b79995e5f793a07bc00c21412e50ecae098e7f9',
    18,
    'WETH',
    'Wrapped Ether'
  ),
}


export const PRICING_TOKENS = [
  DAI,
  WETH9[1],
  USDC,
  USDT,
  USDC
]
export interface IPricingToken{
  moralischain :string;
  address : string
}
export function getPricingToken(token:ICurrency) : IPricingToken{
  if(isTestChain(token.chain)){
      if(token.isNative)
      return{
        address : WETH9[1].address,
        moralischain:'eth'
      }
      //Find Token with same name 
      const match = PRICING_TOKENS.findIndex(p=>p.symbol == token.symbol);
      if(match>=0){
        return { address : PRICING_TOKENS[match].address , 
          moralischain :'eth'}
      }
  }
  const moralisChain = MORALIS_CHAIN_NAMES[token.chain];
  return { address : token.token_address,
    moralischain: moralisChain,
  };
  
}





export class AikidoCurrency  implements ICurrency {
  decimals: number
  symbol: string
  isNative: boolean
  isToken: boolean
  pricingToken: Token
  chainId: number
  chain: number;
  name: string;
  logo: string; 


  constructor (symbol:string ,name: string ,pricingToken:Token, chainId : number)  {

     this.decimals = 18;
     this.symbol = symbol;
     this.name =name;
     this.isNative = true,
     this.isToken = false,
     this.pricingToken = pricingToken;
     this.chainId = chainId;
     this.logo = ethereumLogoUrl.src;
  }

  public get token_address(){
      return  this.pricingToken?.address;
  }

  private static _cached: { [chainId: number]: AikidoCurrency } = {}


  public static getChainCurrency(chainId: number): AikidoCurrency {
      if(this._cached[chainId])
        return this._cached[chainId];

        let newInstance = null;
        if(chainId == SupportedChainId.POLYGON_MUMBAI || chainId == SupportedChainId.POLYGON ){
          newInstance = new AikidoCurrency('MATIC','Matic',MATIC,chainId);
        }
    
        if (chainId in WETH9_EXTENDED){
          const wrappedEtherToken = WETH9_EXTENDED[chainId];
          newInstance = new AikidoCurrency('ETH','Ethereum',wrappedEtherToken,chainId);

        } 
        if(newInstance === null)
          throw new Error('Unsupported chain ID :' + chainId)

        this._cached[chainId] = newInstance;

        return newInstance;
  }
}


