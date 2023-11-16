/* eslint-disable @typescript-eslint/no-unused-vars, no-console , react/no-unescaped-entities */
import {  createSlice, PayloadAction} from '@reduxjs/toolkit'
import { IAccountMetadata } from '../../data/model';
import { IEditBountyItems } from '../../pages/board/[account]';
import {   IBountyState , } from '../bounty/actions'




const bountyInitialState = {
  items : [],
  count : 0,
  metadata : {
    id : null,
    name :'',
    description : '',
    imageUrl : '',
    account: null,
    website: '',
    twitter: '',
    discord: '',
    themeColor: ''
  },
  ensName: '',
};

const bountyBoardSlice = createSlice({
  name: 'bountyboard',
  initialState: bountyInitialState,
  reducers: {
    setBountyBoardItems(state, action: PayloadAction<IEditBountyItems>) {
      state.items = action.payload.allBounties;
      state.count = action.payload.count;
    },
    setBountyBoardEns(state , action : PayloadAction<string>){
      state.ensName = action.payload;
    },
    setAccountSettingsData(state, action : PayloadAction<IAccountMetadata>){
      state.metadata = action.payload;
    }
  },
  // extraReducers: (builder) => {
 
  // },
})

export const {setBountyBoardItems, setAccountSettingsData, setBountyBoardEns} = bountyBoardSlice.actions;
export default bountyBoardSlice.reducer
