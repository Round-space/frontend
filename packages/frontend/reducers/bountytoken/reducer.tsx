/* eslint-disable @typescript-eslint/no-unused-vars, no-console , react/no-unescaped-entities , @typescript-eslint/no-empty-function */
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ICurrency } from '../wallet/state'
import { toCurrencyAmount} from '../../utils/bignumber'

export interface CreateBountyStateType {
  currency: ICurrency // NativeCurrency || Token
  amount: string | null
  maxAmount: string
  currencyUsdPrice: number | null
  readingCurrencyPrice: boolean
}

export const initialState = {
  currency: null,
  amount: null,
  maxAmount: null,
  currencyUsdPrice: null,
  readingCurrencyPrice: false,
} as CreateBountyStateType

export interface ICurrencyValue {
  amount: string
  currency: ICurrency
}
const createBountySlice = createSlice({
  name: 'createBounty',
  initialState: initialState,
  reducers: {
    initCurrencyValue: (state, action: PayloadAction<ICurrencyValue>) => {
      console.log('Initializing Currency',action.payload);
      state.currency = action.payload.currency
      state.maxAmount = action.payload.amount
      // shift 2 decimals i.e setting inial amount to 1% of max value
      // state.amount = '0';//state.maxAmount?.length > 2 ? state.maxAmount?.substr(0,state.maxAmount.length - 2) : state.maxAmount ;
      state.currencyUsdPrice = null;
    },
    setNewBountyAmount: (state, action: PayloadAction<string>) => {
      const newAmount = action.payload ? Number.parseFloat(action.payload) : null;
      state.amount =  newAmount > 0 ? toCurrencyAmount(newAmount, state.currency).toString() : null;
    },
    setNewBountyMaxAmount: (state, action: PayloadAction<string>) => {
      state.maxAmount = action.payload
    },
    setNewBountyCurrencyUSDPrice(state, action: PayloadAction<number>) {
      state.currencyUsdPrice = action.payload
    },
    setReadingCurrencyPrice(state, action: PayloadAction<boolean>) {
      state.readingCurrencyPrice = action.payload
    },
  },
  extraReducers: (builder) => {},
})

export const {
  initCurrencyValue,
  setNewBountyAmount,
  setReadingCurrencyPrice,
  setNewBountyCurrencyUSDPrice,
  setNewBountyMaxAmount
} = createBountySlice.actions
export default createBountySlice.reducer
