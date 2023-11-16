/* eslint-disable @typescript-eslint/no-unused-vars, no-console , react/no-unescaped-entities , @typescript-eslint/no-empty-function */
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { toCurrencyAmount} from '../../utils/bignumber'
import { ICurrencyValue, initialState } from './reducer'


const fundBountySlice = createSlice({
  name: 'fundBounty',
  initialState: initialState,
  reducers: {
    initCurrencyValue: (state, action: PayloadAction<ICurrencyValue>) => {
      console.log('Initializing Currency',action.payload);
      state.currency = action.payload.currency
      state.maxAmount = action.payload.amount
      // shift 2 decimals i.e setting inial amount to 1% of max value
      state.amount = state.maxAmount?.length > 2 ? state.maxAmount?.substr(0,state.maxAmount.length - 2) : state.maxAmount ;
      state.currencyUsdPrice = null;
    },
    setNewFundAmount: (state, action: PayloadAction<string>) => {
      const newAmount = action.payload ? Number.parseFloat(action.payload) : null;
      state.amount =  newAmount > 0 ? toCurrencyAmount(newAmount, state.currency).toString() : null;
    },
    setNewFundCurrencyUSDPrice(state, action: PayloadAction<number>) {
      state.currencyUsdPrice = action.payload
    },
    setFundReadingCurrencyPrice(state, action: PayloadAction<boolean>) {
      state.readingCurrencyPrice = action.payload
    },
  },
  extraReducers: (builder) => {},
})

export const {
  initCurrencyValue,
  setNewFundAmount,
  setFundReadingCurrencyPrice,
  setNewFundCurrencyUSDPrice,
} = fundBountySlice.actions
export default fundBountySlice.reducer
