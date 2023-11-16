/* eslint-disable @typescript-eslint/no-unused-vars, no-console */
import { useRouter } from 'next/router'
import { useCallback, useEffect } from 'react'
import { Spacer, Center,Text, Button } from '@chakra-ui/react'
import { ethers } from 'ethers'
import { useAppDispatch, useAppSelector, RootState  } from '../../../reducers/index'
import {  IBountyState, transformToBountyData } from '../../../reducers/bounty/actions'
import { setDashboardItems } from '../../../reducers/dashboard/state'
import BountyBoard from '../../../components/board/bountyboard'
import { fetchBountiesByCreator , fetchBountyMetadataByaccount, fetchBountiesCountByCreator } from '../../../service/bounties'
import { BoardMetadataInfo } from '../../../components/board/BoardMetadataInfo'
import { IAccountMetadata } from '../../../data/model'
import { BoardStates } from '../../../components/board/BoardStates'
import { useAccount } from 'wagmi';
import { ExternalLinkIcon } from '@chakra-ui/icons'

// this function will be used to fill in the slots of the bounty board, given the page number via lazy loading
const loadBountyStates = async (allBounties, account : string, page : number, isDashboard: boolean) => {
  
  const data = await fetchBountiesByCreator(account, page, isDashboard);
  // populate the placeholders with the given page of bounties
  data.result.forEach( (bounty, index)=>{
    // get the index of the bounty
    const position = index + ((page - 1) * 12);
    // set the bounty at the index to the bounty
    allBounties[position] = transformToBountyData([bounty]);
  })
  
}

const BountyBoardPage = (props : IEditBountyProps): JSX.Element => {
  
  const { data: accountData } = useAccount();
  const account = accountData?.address

  
  const dispatch = useAppDispatch();
  
  let allBounties = [];

  // rootstate
  const dashBoardState = useAppSelector((state: RootState) => { return state.dashBoard });  
  const { board } = dashBoardState;
  const { currentAccountEnsName: ensName } = useAppSelector((state: RootState) => { return state.wallet });
  
  
  const gotoPublicView = () => {
    const url = '/space/'+board;
    // open url in a new window
    window.open(url, '_blank');
  }

  const router = useRouter();
  const isDashboard = router.pathname.includes("/dashboard");

  const moreData = async (page: number) => {
    const newBounties = [...dashBoardState.items];
    loadBountyStates(newBounties, board as string, page, isDashboard).then(() => {
      allBounties = newBounties;

      // if it is not the last page yet, then add placeholders for the next page as well
      if(allBounties.length < dashBoardState.count) {
        const diffCount = dashBoardState.count - allBounties.length;
        let placeHolderCount = 0;
        
      if(diffCount > 12) {
           placeHolderCount = 12;
        } else {
          placeHolderCount = diffCount;
        }

        for(let i = 0; i < placeHolderCount; i++) {
          allBounties.push({} as IBountyState);
        }

      }

      dispatch(setDashboardItems({count: dashBoardState.count, allBounties}));
    });
  };

  
  return (
    <>
    <Center fontSize="small" backgroundColor="gray.50" borderColor="gray.200"  p={2} mb={3} rounded="xl" flexDirection="row">
      <Text fontSize="sm">This is a preview of your Space as it appears for your contributors</Text>&nbsp;&nbsp;
      <Button size="xs" colorScheme="gray" rightIcon={<ExternalLinkIcon />} onClick={gotoPublicView}>Visit Your Space</Button>
    </Center>
    <BoardMetadataInfo dashBoard={true} ensName={ensName} ></BoardMetadataInfo>
    <Spacer my={4} />
    <BoardStates account={account}></BoardStates>
    <Spacer my={4} />
    <BountyBoard moreData={moreData} dashBoard={true} account={account}></BountyBoard>
    </>

	)

}


export interface IEditBountyProps {
  allBounties : IBountyState[];
  count: number;
  metadata : IAccountMetadata;
}


export default BountyBoardPage