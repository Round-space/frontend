import { createStore, Store } from 'redux'
import reducer, {
  initialState,
  CreateBountyStateType,
  initCurrencyValue,
  setNewBountyAmount,
  setReadingCurrencyPrice,
  setNewBountyCurrencyUSDPrice,
  ICurrencyValue
} from './reducer'

const nativeToken =  {
  isNative: true,
  logo: '/images/ethereum-logo.png',
  name: 'Ether',
  symbol: 'ETH',
  decimals : 18,
  token_address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
} 

describe('create bounty reducer', () => {
  
  let store: Store<CreateBountyStateType>

  beforeEach(() => {
    store = createStore(reducer, initialState)
  })

  describe('initCurrencyValue', () => {

    const currencyValue = {
      currency : nativeToken,
      amount : '10000000000000'
    } as ICurrencyValue;
    it('should initialize balance', () => {
      store.dispatch(
        initCurrencyValue(currencyValue)
      )
      const createState = store.getState();
      expect(createState?.currency).toEqual(currencyValue.currency);
      expect(createState?.maxAmount).toEqual(currencyValue.amount);
    })

    it('should not throw decimal',()=>{
          const amount = "20487091719840954";
          const currency = {
          chain: 1,
          decimals: 18,
          isNative: true,
          name: "Ether",
          symbol: "ETH",
          token_address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
        };
      
        store.dispatch(
          initCurrencyValue({amount:amount,currency:currency} as ICurrencyValue)
        )
        const createState = store.getState();
        expect(createState?.amount).toEqual("204870917198409");
        expect(createState?.maxAmount).toEqual("20487091719840954");
  
    })

  });
  describe('setNewBountyAmount', () => {


    const currencyValue = {
      currency : nativeToken,
      amount : '1000000'
    } as ICurrencyValue;
    it('should set amount', () => {
      store.dispatch(initCurrencyValue(currencyValue))
      let createState = store.getState();

      expect(currencyValue.amount).toEqual('1000000');

      store.dispatch(setNewBountyAmount('2'));
      createState = store.getState();
      expect(createState?.currency).toEqual(currencyValue.currency);
      expect(createState.amount).toEqual('2000000000000000000');
    })
  })

  describe('setReadingCurrencyPrice', () => {


    it('should set flag', () => {
      store.dispatch(setReadingCurrencyPrice(true))
      let createState = store.getState();

      expect(createState.readingCurrencyPrice).toBe(true);

      store.dispatch(setReadingCurrencyPrice(false));
      createState = store.getState();
      expect(createState.readingCurrencyPrice).toBe(false);

    })
  })

  describe('setNewBountyCurrencyUSDPrice', () => {


    it('should set price', () => {
      const price = 4555.55;
      store.dispatch(setNewBountyCurrencyUSDPrice(price))
      const createState = store.getState();
      expect(createState.currencyUsdPrice).toEqual(price);

    })
  })
})
