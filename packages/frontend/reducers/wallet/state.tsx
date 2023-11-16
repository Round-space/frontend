/* eslint-disable @typescript-eslint/no-unused-vars, no-console , react/no-unescaped-entities , @typescript-eslint/no-empty-function */
import {  createSlice, PayloadAction } from '@reduxjs/toolkit'
import { getErrorMessage } from '../../lib/utils';
import {getChainDetails} from '../../constants/addresses'

export enum WalletTypeEnum {
  MetaMask,
  WalletConnect,
  None,
}



export enum MoralisConnectionStatusEnum {
  Authenticating,
  Authenticated,
  AuthenticationFailed,
  NotAuthenticated,
  Unknown,
}

export interface ICurrency{
  token_address: string;
  symbol: string;
  isNative : boolean;
  isToken : boolean;
  chain : number;
  name: string;
  decimals: number;
  logo?: string;

}


export interface IWalletConnectMessage {
  account :string;
}
export interface INativePrice{
  value : string;
  decimals : number;
  name : string;
  symbol : string;
}

export interface IPrice{
  nativePrice?: {
      value: string;
      decimals: number;
      name: string;
      symbol: string;
  };
  usdPrice: number;
  exchangeAddress?: string;
  exchangeName?: string;
}

export interface IMoralisTokenSummary extends ICurrency{
  balance : string | null
}

export interface WalletStateType {
  currentAccount: string;
  currentAccountEnsName: string;
  currentAccountEnsAvatar: string;
  chainMeta : any | null;
  connectError: string;
  isConnected: boolean;
  correctNetwork: boolean;
  connecting: boolean;
  type: WalletTypeEnum;
  nativeBalance : string;
  nativeSymbol : string
  tokenBalance : IMoralisTokenSummary[]
  tokenPrice : IPrice
  moralisConnectionStatus: MoralisConnectionStatusEnum
}

const initialWalletState = {
  connecting: false,
  isConnected: false,
  correctNetwork: true,
  currentAccountEnsName : null,
  currentAccountEnsAvatar : null,
  chainMeta : null,
  type: WalletTypeEnum.None,
  currentAccount: null,
  connectError : null,
  nativeBalance: null,
  tokenBalance : [],
  tokenPrice : null,
  nativeSymbol : 'ETH',
  moralisConnectionStatus: MoralisConnectionStatusEnum.Unknown,
} as WalletStateType

const walletSlice = createSlice({
  name: 'wallet',
  initialState: initialWalletState,
  reducers: {
    setMoralisStatus(state,action: PayloadAction<MoralisConnectionStatusEnum>) {
        if(state.moralisConnectionStatus != action.payload)
           state.moralisConnectionStatus = action.payload;
    },
    setCorrectNetwork(state,action: PayloadAction<boolean>) {
        state.correctNetwork = action.payload;
    },
    setTokenPrice(state,action : PayloadAction<IPrice>){
      state.tokenPrice = action.payload 
    },
    setConnectingWallet(state, action: PayloadAction<WalletTypeEnum>) {
      state.type = action.payload
      state.connecting = true
    },
    setTokenAmounts(state,action: PayloadAction<IMoralisTokenSummary[]>){
      state.tokenBalance = action.payload
    },
    setCurrentAccountEnsName(state, action : PayloadAction<string>){
      state.currentAccountEnsName = action.payload;
    },
    setCurrentAccountEnsAvatar(state, action : PayloadAction<string>){
      state.currentAccountEnsAvatar = action.payload;
    },
    setWalletConnected(state, action: PayloadAction<IWalletConnectMessage>) {
      state.currentAccount = action.payload.account
      state.connecting = false
      state.isConnected = true
      state.connectError = null;
    },
    setChainId(state,action: PayloadAction<number>){
      state.chainMeta = getChainDetails(action.payload);
    },
    setNativeBalance(state, action: PayloadAction<string >) {
      state.nativeBalance = action.payload; 
    },
    setConnectingError(state, action: PayloadAction<Error>) {
      state.currentAccount = null
      state.isConnected = false
      state.connecting = false
      state.type = WalletTypeEnum.None
      state.connectError =  getErrorMessage(action.payload)
    },
    setWalletDisconnected(state) {
      state.type = WalletTypeEnum.None
      state.isConnected = false
      state.currentAccount = null
      state.nativeBalance = null
      state.currentAccountEnsAvatar = null
      state.currentAccountEnsName = null
    },
  },
  extraReducers: (builder) => {},
})

export const {
  setWalletConnected,
  setWalletDisconnected,
  setConnectingWallet,
  setConnectingError,
  setTokenAmounts,
  setNativeBalance,
  setMoralisStatus,
  setTokenPrice,
  setChainId,
  setCorrectNetwork,
  setCurrentAccountEnsName,
  setCurrentAccountEnsAvatar
} = walletSlice.actions
export default walletSlice.reducer
