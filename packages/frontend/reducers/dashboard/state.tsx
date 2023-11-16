/* eslint-disable @typescript-eslint/no-unused-vars, no-console , react/no-unescaped-entities */
import {  createSlice, PayloadAction} from '@reduxjs/toolkit'
import { IEditBountyItems } from '../../pages/board/[account]/index';
import { IAccountMetadata } from '../../data/model';



const dashboardInitialState = {
  items : [],
  count: 0,
  board: null,
  metadata : {
    id : null,
    name :'',
    description : '',
    imageUrl : '',
    account: null,
    gnosis: null,
    email: null,
    urlname: null,
    website : '',
    twitter : '',
    themeColor: '',
    discord : ''
  },
  useTemplate : null,
  allBounties: [],
  availableBounties : [],
  draftBounties : [],
  subscribers: null,
  collaborators: null,
  canBoards: null,
  ensDirectory: []
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: dashboardInitialState,
  reducers: {
    setBoard(state , action : PayloadAction<string>){
      state.board = action.payload;
    },
    setCanBoards(state , action : PayloadAction<any[] | null>){
      state.canBoards = action.payload;
    },
    setDashboardItems(state , action : PayloadAction<IEditBountyItems>){
      state.items = action.payload.allBounties;
      state.count = action.payload.count;
    },
    setDashboardMetaData(state , action : PayloadAction<IAccountMetadata>){
      state.metadata = action.payload;
    },
    setAvailableBounties(state , action : PayloadAction<any[]>){
      state.availableBounties = action.payload;
    },
    appendAvailableBounty(state , action : PayloadAction<any>){
      state.availableBounties.push(action.payload);
    },
    setDraftBounties(state , action : PayloadAction<any[]>){
      state.draftBounties = action.payload;
    },
    appendDraftBounty(state , action : PayloadAction<any>){
      state.draftBounties.push(action.payload);
    },
    setUseTemplate(state , action : PayloadAction<number | null >){
      state.useTemplate = action.payload;
    },
    setAllBounties(state , action : PayloadAction<any[]>){
      state.allBounties = action.payload;
    },
    setSubscribers(state , action : PayloadAction<any[]>){
      state.subscribers = action.payload;
    },
    setCollaborators(state , action : PayloadAction<any[]>){
      state.collaborators = action.payload;
    },
    addCollaborator(state , action : PayloadAction<any>){
      state.collaborators.push(action.payload);
    },
    removeCollaborator(state , action : PayloadAction<any>){
      state.collaborators = state.collaborators.filter((f)=>{ return f.objectId != action.payload});
    },
    addToEnsDirectory(state , action : PayloadAction<{address: string, ensName: string | null}>){
      // check if already exists
      const exists = state.ensDirectory.filter((f)=>{ return f.address == action.payload.address});
      if(exists.length > 0){
        return;
      }
      state.ensDirectory.push(action.payload);
    }
  }
})

export const { setBoard, setCanBoards, setDashboardItems, setDashboardMetaData, setCollaborators, setAvailableBounties, setDraftBounties, appendAvailableBounty, appendDraftBounty, setUseTemplate, setAllBounties, setSubscribers, addCollaborator, removeCollaborator, addToEnsDirectory} = dashboardSlice.actions;
export default dashboardSlice.reducer
