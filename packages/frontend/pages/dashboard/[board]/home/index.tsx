/* eslint-disable @typescript-eslint/no-unused-vars, no-console */
import { Spacer } from '@chakra-ui/react'
import {  IBountyState } from '../../../../reducers/bounty/actions'
import { IAccountMetadata } from '../../../../data/model'
// import { useAccount } from 'wagmi';
import ActiveBountyList from '../../../../components/home/ActiveBountyList'
import { WalletOverview } from '../../../../components/board/WalletOverview'
import { useAppSelector, RootState } from '../../../../reducers';


const DashboardHome = (props : IEditBountyProps): JSX.Element => {
  
  // const { data: accountData } = useAccount();
  // const account = accountData?.address
  
  const dashboardState = useAppSelector((state: RootState) => { return state?.dashBoard; });

  const { board } = dashboardState;
  
  return (
    <>
    <WalletOverview account={board}></WalletOverview>
    <Spacer my={4} />
    <ActiveBountyList dashBoard={true} account={board}></ActiveBountyList>
    </>

	)
}

export interface IEditBountyProps {
  allBounties : IBountyState[];
  count: number;
  metadata : IAccountMetadata;
}

export default DashboardHome