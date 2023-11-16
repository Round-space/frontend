import { configureStore  } from '@reduxjs/toolkit'
import { useDispatch,useSelector ,TypedUseSelectorHook } from 'react-redux'
import bountiesReducer from './bounty/state'
import walletReducer from './wallet/state'
import bountyBoardReducer from './bountyboard/state'
import dashboardReducer from './dashboard/state'
import createBountyReducer from './bountytoken/reducer'
import fundBountyReducer from './bountytoken/fundReducer'
import uiReducer from './ui-slice';
import transactions from './transactions/reducer'
// ...

const store = configureStore({
  reducer: {
    bounties : bountiesReducer,
    bountyBoard : bountyBoardReducer,
    dashBoard: dashboardReducer,
    wallet : walletReducer,
    ui : uiReducer,
    createBounty : createBountyReducer,
    fundBounty: fundBountyReducer,

    transactions 
  },
  // Append bounty API middleware to store
})
export type RootState = ReturnType<typeof store.getState>


export type AppDispatch = typeof store.dispatch
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
export default store;
