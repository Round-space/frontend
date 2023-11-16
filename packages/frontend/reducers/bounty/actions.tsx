/* eslint-disable @typescript-eslint/no-unused-vars, no-console , react/no-unescaped-entities */
import {
  BountyFulfilled,
  BountyMetaFulfilled,
  ExtendedBounty,
  IAcceptedApplication,
  IBountyApplication,
  IBountyMetaFulfilled,

} from '../../data/model'
import { createAsyncThunk } from '@reduxjs/toolkit'
import Moralis from 'moralis'
import { showNotification } from '../ui-slice'
import { toBountyState } from './state'
import { IBounty } from '../../web3/contractService'
import _ from 'lodash'
import { BigNumber } from 'ethers'
// THUNK ACTION -> ALREADY INCLUDES STARTED , SUCCESS AND FAILED STATUS


function toSubmissions(metasubmissions: BountyMetaFulfilled[], submissions: BountyFulfilled[]): IExtendedBountySubmissionState[] {

  if(metasubmissions==null || metasubmissions=== undefined)
    return [];

    return metasubmissions.map((submission,index)=>{
      
      const acceptedSubmission = _.find(submissions,(f)=>{ 
        return f.data.split(',').indexOf(submission.ipfsHash) > -1
        // return submission.ipfsHash == f.data ;
      }) ;

      const baseItem = toBountySubmissionState(submission);
      const extSubmission = {
        ...baseItem,
        isAccepted : !(acceptedSubmission == undefined)} as IExtendedBountySubmissionState; 
      return extSubmission;
    });

}

export interface IBountyState   {
  databaseId : string
  name: string
  url: string | null
  requiresApproval: boolean
  requiresApplication: boolean
  voting: boolean
  publicSubmissions: boolean
  applications: IBountyApplication[]
  acceptedApplications: IAcceptedApplication[]
  externalFunding: boolean
  fulfillTxId: string | null
  metadataUrl : string | undefined | null
  data : string | undefined | null
  deadline: number | undefined 
  applicationsDeadline: number | undefined
  votingStart: number | undefined
  votingEnd: number | undefined
  votingNFT: string | undefined | null
  description: string
  bountyId:  string | null
  tokenSymbol: string
  creatorAddress: string
  creatorAddressEns: string | null
  tokenAddress: string
  tokenAmount: number
  remainTokenAmount: number
  drainTxId : string | null
  issueTxId : string | null
  creationDate : string | null
  gnosis: string | undefined | null
  isCompleted: boolean
  submissions : IExtendedBountySubmissionState[],
  chainFulfillments: any[] | undefined,
  acceptedFulfillments: any[] | undefined,
  tokenDecimals: number | undefined,
  contributions: any[]
  themeColor: string | undefined | null
  numRewards: number | undefined
}

  export interface IBountySubmissionState  {
    id: string
    data: string
    submitter: string
    fulfillmentId: string
    fulfillers: string[]
    bountyId: string
    transaction_hash: string
    confirmed : boolean
    address : string
  }


  export interface IExtendedBountySubmissionState extends IBountySubmissionState  {
    isAccepted : boolean;
  }






export const transformToBountyData = (bounties: ExtendedBounty[]) => {
  
  if (!bounties?.length) return null

  const bounty = bounties[0];
  
  bounty.id = bounty.objectId;
  const issueTxId = bounty.bountyIssued.length > 0 ? bounty.bountyIssued[0].transaction_hash : null;
  
  // const creationDate = bounty.bountyCreatedAt ? 
  //   new Date(bounty.bountyCreatedAt).toISOString() :
  const creationDate = bounty.updatedAt != null ? bounty.updatedAt.toString() : null;
  
  const bountyState = toBountyState({...bounty,
    creationDate : creationDate,
    issueTxId : issueTxId,
    themeColor: bounty.accountMetadata?.[0]?.themeColor ?? 'purple',
  }as IBounty);

  if(bountyState.bountyId === undefined)
     bountyState.bountyId = null;

  if( bountyState.bountyId == null && bounty.bountyIssued.length > 0 ){
    bountyState.bountyId = bounty.bountyIssued[0].bountyId;
  }

  if(bountyState.fulfillTxId == null && bounty.fulfillments.length > 0){
    bountyState.fulfillTxId = bounty.fulfillments[0].transaction_hash;
  }


  // check if bounty is drained
  if( bounty.bountyDrained.length > 0 ) {
    bountyState.drainTxId = bounty.bountyDrained[0].transaction_hash ;
    bountyState.isCompleted = true ;
  } 
  else
  // if sum of contributions is equal to sum of fulfillments
  // then bounty is completed
  
  if(bounty.fulfillments?.length && bounty['contributions']?.length){
    const sumOfContributions = bounty['contributions'].reduce((acc, cur) => acc + BigInt(cur.amount), BigInt(0));
    const sumOfFulfillments = bounty.fulfillments.reduce((acc, cur) => {
      return acc + cur.tokenAmounts.reduce((acc, cur) => acc + BigInt(cur), BigInt(0));
    }, BigInt(0));
    bountyState.isCompleted = sumOfContributions === sumOfFulfillments;
  } else {
    bountyState.isCompleted = false ;
  }
  
  bountyState.tokenDecimals = bounty.tokenDecimals ? bounty.tokenDecimals : 18;

  bountyState.gnosis = bounty.gnosis ? bounty.gnosis : null;
  
  bountyState.submissions = toSubmissions(bounty.metasubmissions,bounty.submissions);
  

  // get rid of non serialized data from fulfillments
  bountyState.chainFulfillments = bounty.chainFullfillments?.map((f)=>{
    const { _created_at, _updated_at, block_timestamp, ...rest } = f;
    return rest;
  }) ?? [];
      
  bountyState.acceptedFulfillments = bounty.fulfillments.map((f : any)=>{
    const { _created_at, _updated_at, block_timestamp, ...rest } = f;
    return rest;
  });

  // if(bounty.accountMetadata?.[0]?.themeColor) {
    bountyState['themeColor'] = bounty?.accountMetadata?.[0]?.themeColor ?? 'purple';
  // }

  return bountyState;
}
export const fetchBountyById = createAsyncThunk(
  'bounty/fetchByIdStatus',
  async (bountyObjectId: string, thunkAPI) => {
    try {
      const data = (await Moralis.Cloud.run('getBountyByObjectId', {
        objectId: bountyObjectId,
      })) as ExtendedBounty[]
      const result = transformToBountyData(data);
      return result
    } catch (err) {
      thunkAPI.dispatch(
        showNotification({ status: 'error', title: 'Error!', message: err })
      )
    }
  }
)



export function toBountySubmissionState(f : IBountyMetaFulfilled){
  
  if(f == null || f === undefined)
    return {
      fulfillers : [  ],
      address : null,
      bountyId : null,
      submitter : null,
      transaction_hash : '',
      fulfillmentId : '',
      confirmed : false,  
    };
  
  return {
    id: f._id,
    data :f.ipfsHash ,
    fulfillers : [ f.fulfiller ],
    address : f.fulfiller,
    bountyId : f.bountyId,
    submitter : f.fulfiller,
    transaction_hash : '',
    fulfillmentId : '',
    confirmed : true,
  } as IBountySubmissionState
}

export const fetchBountyMetaSubmissionsByBountyId = createAsyncThunk(
  'bountyMetaSubmission/fetchByBountyId',
  async (bountyId: string, thunkAPI) => {
    try {

      const query = new Moralis.Query('BountyMetaFulfilled');
      query.withCount(false).equalTo('bountyId', bountyId);
      const data = await query.find();
      const result = data.map((f) => {
        const item = {
          data :f.attributes['ipfsHash'] ,
          fulfillers : [ f.attributes['fulfiller'] ],
          address : f.attributes['fulfiller'],
          bountyId : f.attributes['bountyId'],
          submitter : f.attributes['fulfiller'],
          transaction_hash : '',
          fulfillmentId : '',
          confirmed : true,
        } as IBountySubmissionState
        return item;
      })
      return result
    } catch (err) {
      console.log('Something Failed', err)
      thunkAPI.dispatch(
        showNotification({ status: 'error', title: 'Error!', message: err })
      )
    }
  }
)

