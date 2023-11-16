/* eslint-disable @typescript-eslint/no-unused-vars, no-console , react/no-unescaped-entities */
import { AsyncThunkAction, createSlice, PayloadAction} from '@reduxjs/toolkit'
import path from 'path';
import { IAcceptedApplication, IBountyApplication } from '../../data/model';
import { IBounty } from '../../web3/contractService';
import { fetchBountyMetaSubmissionsByBountyId,  IBountyState , IBountySubmissionState, IExtendedBountySubmissionState } from './actions'

interface BountyStateType {
  creating: boolean
  waitingPayout: boolean
  waitingSubmissionConfirmation : string
  waitingDrainConfirmation : boolean
  bounty : IBountyState
  submissions : IBountySubmissionState[]
  requiresApproval: boolean
  requiresApplication: boolean
  publicSubmissions: boolean
  acceptedApplications: IAcceptedApplication[]
  error: string | null
  isLoading: boolean,
  votes: any,
  votingState: number,
  votingDates: any[],
  votingAllowed: boolean | null,
  myVote: string | null,
  isDraft: boolean | undefined,
  isExpired: boolean | undefined,
  isPending: boolean | undefined,
  allowedSubmission: boolean | undefined,
  issuers: string[] | undefined,
  approvers: string[] | undefined,
}

export const toBountyState = (bounty : any)=>{

  const result = {
    databaseId :  bounty.id,
    name: bounty.name,
    url: bounty.url ? bounty.url : null,
    requiresApproval: bounty.requiresApproval? bounty.requiresApproval : null,
    requiresApplication: bounty.requiresApplication? bounty.requiresApplication : null,
    voting: bounty.voting ? bounty.voting: null,
    publicSubmissions: bounty.publicSubmissions? bounty.publicSubmissions : null,
    acceptedApplications: bounty.acceptedApplications ? bounty.acceptedApplications: [],
    externalFunding: bounty.externalFunding? bounty.externalFunding : false,
    deadline: bounty.deadline ? bounty.deadline : 0,
    applicationsDeadline: bounty.applicationsDeadline ? bounty.applicationsDeadline : 0,
    votingStart: bounty.votingStart ? bounty.votingStart : 0,
    votingEnd: bounty.votingEnd ? bounty.votingEnd : 0,
    votingNFT: bounty.votingNFT ? bounty.votingNFT : null,
    description: bounty.description ? bounty.description : null,
    tokenSymbol: bounty.tokenSymbol ? bounty.tokenSymbol : null,
    tokenAddress: bounty.tokenAddress? bounty.tokenAddress : null,
    tokenAmount: bounty.tokenAmount? bounty.tokenAmount : null,
    gnosis: bounty.gnosis ?? undefined,
    bountyId: bounty.bountyId,
    creatorAddress: bounty.creatorAddress? bounty.creatorAddress : null ,
    remainTokenAmount: bounty.tokenAmount,
    isCompleted: bounty.isCompleted || bounty.drainTxId || (bounty.fulfillTxId && bounty.tokenAmount === 0),
    creatorAddressEns: null,
    fulfillTxId: bounty.fulfillTxId != null ?bounty.fulfillTxId : null,
    issueTxId : bounty.issueTxId,
    creationDate : bounty.creationDate,
    drainTxId: bounty.drainTxId === undefined ? null : bounty.drainTxId,
    metadataUrl : bounty.metadataUrl ? bounty.metadataUrl : null,
    submissions : [],
    numRewards: bounty.numRewards ? bounty.numRewards : 0,
  } as IBountyState
  return result
}

export interface BountyCreated{
  bountyId : string,
  txId: string | null
} 

// Workaround: cast state instead of declaring variable type
const bountyInitialState = {
  submissions : [],
  creating : false,
  isLoading : false,
  waitingSubmissionConfirmation : '',
  waitingDrainConfirmation : false,
  error : null,
  bounty : null,
  waitingPayout : false,
  votes: null,
  votingState: 0,
  votingDates: [],
  votingAllowed: null,
  myVote: null
} as BountyStateType

// IMPORTANT: REDUCERS SHOULD NEVER MUTATE STATE,
// Although here seems that we do modify state
// we are using a 3rd party lib which doesnt mutate prev state but create a new one
// see https://redux-toolkit.js.org/usage/immer-reducers
const isSameUser = (a, b) => a.data == b.data;
const onlyInLeft = (left, right, compareFunction) => 
  left.filter(leftValue =>
    !right.some(rightValue => 
      compareFunction(leftValue, rightValue)));

const workingBountySlice = createSlice({
  name: 'workingbounty',
  initialState: bountyInitialState,
  reducers: {
    setCreating(state){
      state.creating = true;
    },
    setCreateData(state,action:PayloadAction<IBounty>){
      state.bounty = toBountyState(action.payload);
    },
    setApplications(state, action:PayloadAction<IBountyApplication[]>){
      state.bounty.applications = action.payload;
    },
    setBountyContributions(state,action:PayloadAction<any[]>){
      state.bounty.contributions = action.payload;
    },
    setCreated(state, action : PayloadAction<BountyCreated>){
      state.creating = false;
      state.isPending = false;
      if(state.bounty != null && (state.bounty.bountyId === null || state.bounty.bountyId === undefined)){
        state.bounty.bountyId = action.payload.bountyId;
        state.bounty.issueTxId = action.payload.txId;          
      }
    },
    setBountyIssuersApprovers(state, action: PayloadAction<{issuers: any[], approvers: any[]}>) {
      state.issuers = action.payload.issuers
      state.approvers = action.payload.approvers
    },
    setReducedTokenBalance(state, action : PayloadAction<number>){
      state.bounty.remainTokenAmount = (state.bounty.remainTokenAmount * 10000 - action.payload * 10000) / 10000;
      if(state.bounty.remainTokenAmount === 0) {
        state.bounty.isCompleted = true;
      } else state.bounty.isCompleted = false;
    },
    setRemainTokenBalance(state, action : PayloadAction<number>){
      state.bounty.remainTokenAmount = action.payload;
    },
    setBountyIsCompleted(state, action : PayloadAction<number>){
      // note that before this is called, the remainTokenAmount has already been set
      if(!state.bounty.isCompleted) {
        state.bounty.isCompleted = action.payload > 0 && state.bounty.remainTokenAmount === 0;
      }
    },
    setTokenBalance(state, action : PayloadAction<number>){
      state.bounty.tokenAmount = action.payload;
    },
    addTokenBalance(state, action : PayloadAction<number>){
      state.bounty.tokenAmount = (state.bounty.tokenAmount * 10000 + action.payload * 10000) / 10000;
    },
    setCreatorEns(state,action : PayloadAction<string>){
      if(state.bounty){
        state.bounty.creatorAddressEns = action.payload;
      }
    },
    setWaitingPayout(state, action : PayloadAction<boolean>) {
      state.waitingPayout = action.payload;
    },
    setDraining(state, action : PayloadAction<boolean>) {
      state.waitingDrainConfirmation = action.payload;
    },
    setWaitingSubmission(state, action : PayloadAction<string> ){
      state.waitingSubmissionConfirmation = action.payload;
    },
    setValidSubmissions(state) {
      if(state?.submissions) {
        state.submissions = state?.bounty?.requiresApplication ? state.submissions.filter(({address}) => {
          return state.bounty.acceptedApplications.find(({ applicant }) => applicant.toLowerCase() === address.toLowerCase()) ? true : false
        }):state.submissions
      }
      
      if(state?.bounty?.submissions) {
        state.bounty.submissions = state?.bounty?.requiresApplication ? state.bounty.submissions.filter(({address}) => {
          return state.bounty.acceptedApplications.find(({ applicant }) => applicant.toLowerCase() === address.toLowerCase()) ? true : false
        }):state.bounty.submissions
      }
    },
    setCompleteTx(state, action : PayloadAction<{txId: string, data: string}>){
      state.bounty.fulfillTxId = action.payload.txId;
      state.bounty.submissions = state.bounty.submissions.map(submission => {
        if(action.payload.data.split(',').indexOf(submission.data) > -1)
          return {...submission, fulfillmentId: action.payload.txId, transaction_hash: action.payload.txId};
        else
          return submission;
      });
    },
    setCancelTx(state, action : PayloadAction<string>){
      state.bounty.drainTxId = action.payload;
    },
    updateSubmissionAccept(state, action : PayloadAction<string>) {
      state.bounty.submissions = state.bounty.submissions.map(submission => {
        if(action.payload.split(',').indexOf(submission.data) > -1)
          return {...submission, isAccepted: true};
        else
          return submission;
      });
    },
    addAcceptedApplication(state, action : PayloadAction<IAcceptedApplication>){
      state.bounty.acceptedApplications.push(action.payload);
    },
    addApplication(state, action : PayloadAction<IBountyApplication>){
      state.bounty.applications.push(action.payload);
    },
    setBountyCompleted(state){
      state.bounty.isCompleted = true;
      state.waitingPayout = false;
    },
    setBountyState(state , action : PayloadAction<IBountyState>){
      const bountyId =action.payload.bountyId;
      state.bounty = action.payload;
      state.creating = bountyId === null || bountyId === undefined || bountyId ==='' ;
    },
    setVotes(state, action : PayloadAction<any>){
      state.votes = action.payload;
    },
    setVotingState(state, action : PayloadAction<number>){
      state.votingState = action.payload;
    },
    setVotingDates(state, action : PayloadAction<any[]>){
      state.votingDates = action.payload;
    },
    setVotingAllowed(state, action: PayloadAction<boolean | null>) {
      state.votingAllowed = action.payload
    },
    setMyVote(state, action : PayloadAction<any>){
      state.myVote = action.payload
    },
    setMyVoteAndCount(state, action : PayloadAction<any>){
      
        if(state.myVote !== action.payload) {
            state.votes = { ...state.votes, [state.myVote]: state.votes[state.myVote] - 1, [action.payload]: state.votes[action.payload] + 1}
        } else { // toggled off
          state.votes = {...state.votes, [state.myVote]: state.votes[state.myVote] - 1}
          state.myVote = null;
          return
        }
      
      state.myVote = action.payload;
    },
    setIsDraft(state, action : PayloadAction<boolean>){
      state.isDraft = action.payload;
    },
    setIsExpired(state, action : PayloadAction<boolean>){
      state.isExpired = action.payload;
    },
    setIsPending(state, action : PayloadAction<boolean>){
      state.isPending = action.payload;
    },
    setAllowedSubmission(state, action : PayloadAction<boolean>){
      state.allowedSubmission = action.payload;
    }
  },
  extraReducers: (builder) => {
    // Add reducers for additional action types here, and handle loading state as needed
    builder.addCase(fetchBountyMetaSubmissionsByBountyId.fulfilled, (state, action) => {
      // in case the bounty requires applications, then filter out submissions from non accepted bounty applicants (just in case)
      state.submissions = state.bounty.requiresApplication ? action.payload.filter(({address}) => {
        return state.bounty.acceptedApplications.find(({ applicant }) => applicant.toLowerCase() === address.toLowerCase()) ? true : false
      }):action.payload
      
      if(state.bounty.submissions.length < state.submissions.length){
        const onlyInA = onlyInLeft(state.bounty.submissions, action.payload, isSameUser);
        const onlyInB = onlyInLeft(action.payload, state.bounty.submissions, isSameUser);

        const result = [...onlyInA, ...onlyInB];
        result[0].isAccepted = false;
        state.bounty.submissions = [...state.bounty.submissions, result[0]];
      
      }
    })
    builder.addCase(fetchBountyMetaSubmissionsByBountyId.rejected, (state,action) => {
      state.error = action.error.message;
    })
  },
})

// Create fetchBounty Action
//

export const {
    setWaitingSubmission,
    setWaitingPayout, 
    updateSubmissionAccept, 
    setRemainTokenBalance, 
    setApplications, 
    setCompleteTx,
    setCreating,
    setCreated, 
    setCreateData,
    setBountyCompleted,
    setDraining,
    setCancelTx, 
    setBountyState,
    setCreatorEns, 
    addAcceptedApplication, 
    addApplication, 
    setTokenBalance, 
    addTokenBalance, 
    setValidSubmissions, 
    setReducedTokenBalance, 
    setBountyIsCompleted, 
    setBountyContributions, 
    setVotes, 
    setVotingState, 
    setVotingDates, 
    setVotingAllowed,
    setMyVote,
    setMyVoteAndCount,
    setIsDraft,
    setIsExpired,
    setIsPending,
    setAllowedSubmission,
    setBountyIssuersApprovers
  } = workingBountySlice.actions;
export default workingBountySlice.reducer
