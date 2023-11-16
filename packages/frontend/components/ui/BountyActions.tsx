/* eslint-disable @typescript-eslint/no-unused-vars, no-console , react/no-unescaped-entities */
import {
  Box,
  
  Flex,
  
  Text,
  
  Spacer,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  useToast,
  Button,
  Checkbox,
  HStack,
  
} from '@chakra-ui/react'
import { useState, useEffect, useCallback } from 'react'
import WidgetBot from '@widgetbot/react-embed'
import { utils, constants, BigNumber } from 'ethers';
import WaitingPanel from './WaitingPanel'
import { useAppDispatch, useAppSelector } from '../../reducers/index'
import { RootState } from '../../reducers/index'
import SubmissionUpdate from './SubmissionUpdate'
import { fetchBountyMetaSubmissionsByBountyId } from '../../reducers/bounty/actions'
import { acceptBountyMetaFulfillment } from '../../reducers/bounty/asyncActions'
import CancelBounty from './CancelBounty'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { moralisAuthentication, truncateHash } from "../../lib/utils";
import { trim } from '../../utils/formatting'

import ShareTab from './ShareTab'
import { toBountyState } from '../../reducers/bounty/state'
import { getDiscordData } from '../../utils/discord'
import BountySubmissionForm from './BountySubmissionForm'
import BountyReward from './BountyReward'
import { useAccount, useNetwork, useSigner } from 'wagmi';
import BountyApplicationForm from './BountyApplicationForm';
import BountyApplication from './BountyApplication';
import { useMoralis, useMoralisQuery } from 'react-moralis';
import { submitAcceptApplication } from '../../reducers/bounty/asyncActions'
import Moralis from 'moralis';
// import { BountyApplication as BountyApplicationModel } from '../../data/model'
import { ExternalFunding } from './ExternalFunding';
import { useRouter } from 'next/router';

import useVoting from '../../hooks/useVoting';


function BountyActions({isOwner, ...props}): JSX.Element {
  const emptyContent = <></>
  const dispatch = useAppDispatch();
  const bountyState = useAppSelector((state: RootState) => { return state.bounties; });
  const walletState = useAppSelector((state: RootState) => { return state.wallet; });
  const { votingState, votingDates } = useVoting();
  const { data: accountData } = useAccount();

  const account = accountData?.address
  const { activeChain: chain } = useNetwork()
  const chainId = chain?.id
  const { data: signer } = useSigner();
  // const [isOwner, setIsOwner] = useState(false);

  const isWalletConnect = accountData?.connector?.id === "walletConnect"

  const {
    authenticate,
    isAuthenticated,
    user
  } = useMoralis();

  const toast = useToast();
  
  
  const [hasApplied, setHasApplied] = useState(null);
  const [allowedSubmission, setAllowedSubmission] = useState(false);
  const [allowApplication, setAllowApplication] = useState(false);
  // const applicationsQuery = new Moralis.Query(BountyApplicationModel);
  
  const { fetch: fetchBounty } = useMoralisQuery(
    "Bounty",
    (query) => query.equalTo("objectId", bountyState?.bounty?.databaseId),
    [],
    { autoFetch: false }
  );

  const numSubmissions = bountyState.submissions.length;
  const router = useRouter();
  const { bid } = router.query;
  const gotoEditDraft = useCallback(() => {
    router.push('/bounty/create/' + bid)
  }, [])
  
  // the fundBounty currency is the one that the bid was originally created with
  const fundingTokenState = useAppSelector((state) => state.fundBounty);

  useEffect(() => {
    if (bountyState.bounty != null && bountyState.bounty.bountyId != null) {
      dispatch(fetchBountyMetaSubmissionsByBountyId(bountyState.bounty.bountyId.toString()))
    }
  }, [bountyState.bounty, bountyState.waitingSubmissionConfirmation, bountyState.waitingDrainConfirmation, bountyState.waitingPayout])
  
  // useEffect(() => {
  //   if(account && bountyState?.bounty?.bountyId) {
  //     applicationsQuery.equalTo("bountyId", bountyState.bounty.bountyId);
  //     applicationsQuery.equalTo("applicant", account.toLowerCase());
  //     applicationsQuery.find().then(applications => {
        
  //       if(applications.length > 0) {
  //         setHasApplied(true);
  //       } else {
  //         setHasApplied(false);
  //       }
  //     })
  //   }
  // }, [account])

  // useEffect(() => {
  //   if( !account ) {
  //     setIsOwner(false);
  //     return
  //   }    

  //   if( bountyState?.bounty?.creatorAddress ) {
  //     setIsOwner(utils.getAddress(bountyState?.bounty?.creatorAddress) === utils.getAddress(account || constants.AddressZero))
  //   }
    
  //   if(!bountyState?.bounty?.requiresApplication || bountyState?.bounty?.acceptedApplications?.find(({applicant}) => applicant.toLowerCase() === account.toLowerCase())) {
  //     setAllowedSubmission(true)
  //   } else {
  //     setAllowedSubmission(false)
  //   }
    
    
  // }, [account, bountyState])

  useEffect(() => {
    // if we have not yet fetched the applications
    if(hasApplied === null) {
      return;
    }

    if( account && !isOwner && bountyState?.bounty?.requiresApplication ) {
      setAllowApplication(true)
    } else {
      setAllowApplication(false)
    }
  }, [isOwner, bountyState?.bounty?.requiresApplication, hasApplied])


  const [tabIndex, setTabIndex] = useState(0);
  useEffect(() => {
    setTabIndex(bountyState.bounty?.requiresApplication && allowedSubmission ? 1 : 0)
  }, [bountyState.bounty?.requiresApplication, allowedSubmission])

  if (bountyState.isLoading || !bountyState.bounty) {
    return <WaitingPanel />
  }

  if (!bountyState.bounty)
    return emptyContent;

  // const isOwner = account && bountyState.bounty.creatorAddress === account;
  let message = 'Loading ...'
  if (bountyState.waitingSubmissionConfirmation) message = 'Waiting Submission'
  if (bountyState.waitingPayout) message = 'Waiting Payout'
  if (bountyState.waitingDrainConfirmation) message = 'Waiting Cancel ...'
  const handleAcceptSubmissionClick = async (submission) => {
    acceptBountyMetaFulfillment(
        dispatch, 
        [submission], 
        signer, 
        chainId, 
        fundingTokenState, 
        props.appendFulfillment, 
        bountyState, 
        account, 
        BigNumber.from(bountyState.bounty.bountyId)
    );
  }

  const handleBatchAcceptSubmissions = async ( submissions ) => {
    acceptBountyMetaFulfillment(
      dispatch, 
      submissions, 
      signer, 
      chainId, 
      fundingTokenState, 
      props.appendFulfillment, 
      bountyState, 
      account, 
      BigNumber.from(bountyState.bounty.bountyId)
    );
  }

  // const handleDrainBounty = async () => {
  //   const drainMessage = {
  //     account: account,
  //     bountyId: bountyState.bounty.bountyId,
  //     tokenAmount: bountyState.bounty.tokenAmount,
  //     databaseId : bountyState.bounty.databaseId
  //   }
  //   drainBounty(dispatch, drainMessage, signer, chainId, fundingTokenState);
  // }

  const url = bountyState.bounty.url;
  const discordUrl = bountyState.bounty.url;
  const { serverId, channelId, supportsDiscord } = getDiscordData(discordUrl);
  const widgetStyle = { width: '100%', height: '70vh' };

  const etherScanUrl = walletState.chainMeta ? walletState.chainMeta.info.explorer + '/' : '';
  const formattedAmount = bountyState.bounty.tokenAmount ? trim(bountyState.bounty.tokenAmount.toString(), 6) : '';
  const formattedRemainAmount = bountyState.bounty.remainTokenAmount ? trim(bountyState.bounty.remainTokenAmount.toString(), 6) : '0';
  const discordWidget = (<TabPanel px={0}><WidgetBot server={serverId} channel={channelId} shard="https://emerald.widgetbot.io" style={widgetStyle} /> </TabPanel>);


  const acceptApplication = async (applicationId, applicant, setAccepting) => {
    const res = await moralisAuthentication( authenticate, isAuthenticated, user, account, toast, isWalletConnect,chainId )
    if(!res) {
      return;
    }
    submitAcceptApplication(
      dispatch,
      // fetchBounty,
      bountyState?.bounty?.databaseId,
      applicationId,
      applicant,
      setAccepting
    )
  }

  const { externalFunding, connected, bountyMetadata, objectId} = props;

  

  return (
    <>
      <Box overflowY={'scroll'} mt='8'>
      
      { bountyState.bounty.issueTxId && 
        <Tabs variant="soft-rounded" colorScheme="blackAlpha" index={tabIndex}>
          <TabList>
            { bountyState.bounty?.requiresApplication && <Tab py={0} onClick={() => { setTabIndex(0) }} fontSize='md' px='0' _selected={{ color: 'black', fontSize: 'xl', fontWeight: '800'}}>Applications ({bountyState.bounty?.applications?.length})</Tab> }
            {/* { (isOwner || allowedSubmission) &&  */}
              <Tab py={0} onClick={() => { setTabIndex(bountyState.bounty?.requiresApplication ? 1 : 0) }} fontSize='md' px='0' ml={bountyState.bounty?.requiresApplication ? 4 : 0} _selected={{ color: 'black', fontSize: 'xl', fontWeight: '800'}}>Proposals ({bountyState.bounty?.submissions.length})</Tab> 
              {/* } */}
            {supportsDiscord ? (<Tab py={0} onClick={() => { setTabIndex(bountyState.bounty?.requiresApplication ? (isOwner || allowedSubmission) ? 2 : 1 : (isOwner || allowedSubmission) ? 1 : 0) }}>Chat</Tab>) : ""}
          </TabList>
          <TabPanels>
            { bountyState.bounty?.requiresApplication && 
            <TabPanel pl={0}>
              <Spacer my={3} />
              { bountyState?.bounty?.applications?.slice().reverse().map((application, index) => {
                  const isAccepted = bountyState?.bounty?.acceptedApplications?.find(({ applicationId, applicant }, index) => applicationId === application?.objectId && applicant.toLowerCase() === application?.applicant.toLowerCase())
                  return (
                    <BountyApplication {...application} acceptApplication={acceptApplication} isAccepted={isAccepted} key={index} isOwner={isOwner} />
                  )
              }) }
              
            </TabPanel> }
              
            <TabPanel pl={0}>
              {/* { (isOwner || allowedSubmission) && */}
                <BountySubmissionsPanel 
                  key="0" 
                  style={widgetStyle}
                  isExpired={props.isExpired} 
                  isOwner={isOwner} 
                  bountyState={bountyState} 
                  handleAcceptSubmissionClick={handleAcceptSubmissionClick}
                  handleBatchAcceptSubmissions={handleBatchAcceptSubmissions}
                  />
              {/* } */}
            </TabPanel>
            {supportsDiscord ? discordWidget : ""}
          </TabPanels>
        </Tabs>
      }
      </Box>
    </>
  )
}


function BountySubmissionsPanel(props): JSX.Element {
  const noSubmissionMessageOwners = "There are no proposals yet. Promote & share!";
  const noSubmissionMessageContributors = "There are no proposals yet. Be the first!";
  const { isOwner, bountyState, handleAcceptSubmissionClick, isExpired } = props;
  const submissions = bountyState?.bounty?.submissions || [];
  const themeColor = bountyState.bounty.themeColor ?? 'grey';

  const [batchMode, setBatchMode] = useState(false);
  const [batchSubmissions, setBatchSubmissions] = useState<any>({});

  const [batchValid, setBatchValid] = useState(false);

  const [limitError, setLimitError] = useState(false);

  const { votingState } = useVoting();

  const acceptBatch = useCallback(() => {
    const batchData = Object.keys(batchSubmissions).filter( key => batchSubmissions[key]).map( submissionIndex => {
      const submission = submissions[submissionIndex]
      return {
        address: submission.address,
        bountyId: submission.bountyId,
        fulfillmentId: submission.fulfillmentId,
        tokenAmount: batchSubmissions[submissionIndex],
        data: submission.data,
        submissionIndex
      }
    });
    
    props.handleBatchAcceptSubmissions( 
      batchData
    );
    
  }, [batchSubmissions, props.handleBatchAcceptSubmissions, submissions]);

  useEffect(() => {
    
    // sum of values of batchSubmissions
    const amounts = Object.values(batchSubmissions);
    const total = amounts.length ? amounts.reduce((a:any, b:any) => {
      const bValue = parseFloat(b);
      const aValue = parseFloat(a);
      return (isNaN(aValue) ? 0 : aValue) + (isNaN(bValue) ? 0 : bValue);
     } ) : 0;
    
    setBatchValid(total > 0 && total <= bountyState.bounty.remainTokenAmount);
    if(total > bountyState.bounty.remainTokenAmount) {
      setLimitError(true);
    } else {
      setLimitError(false);
    }
  }, [batchSubmissions])
  
  // once the batch payouts have been done, reset the batch mode
  useEffect(() => {
    if(!bountyState.waitingPayout) {
      setBatchMode(false);
    }
  }, [bountyState.waitingPayout])

  return (
    <>
      <Flex alignItems="center" mb={3}>
        <Box >
          <Text fontWeight="bold">
            {submissions.length == 0 ?
              (isOwner ? noSubmissionMessageOwners : noSubmissionMessageContributors) : ""
            }
          </Text>
        </Box>
      </Flex>
      <Box>
       { isOwner && submissions.length > 0 && ( votingState === 0 || votingState === 3 ) &&
        <HStack justify='flex-end' mb={4}>
          <Button
            isDisabled={bountyState.bounty.isCompleted || isExpired || bountyState.waitingPayout}
            colorScheme={themeColor}
            size="sm"
            variant="outline"
            onClick={() => {
              setBatchMode(!batchMode);
            }}
            >{batchMode ? 'Reset' : 'Batch Reward Proposals'}</Button>

          { batchMode && 
          <Button
            isDisabled={!batchValid || bountyState.waitingPayout}
            isLoading={bountyState.waitingPayout}
            size="sm"
            colorScheme={themeColor}
            onClick={acceptBatch}
          >Reward Proposals</Button>
          }
        </HStack>
      }

        
          
        {isTransactionPending(bountyState) ? <WaitingPanel /> : ''}
        {
          submissions.slice().map((submission, index) => {
            
            return (
                <SubmissionUpdate
                  batchMode={batchMode}
                  limitError={limitError}
                  batchSubmissions={batchSubmissions}
                  setBatchSubmissions={setBatchSubmissions}
                  enableButtons={!bountyState.bounty.isCompleted && !isExpired}
                  key={index}
                  submissionId={index}
                  objectId={submission.id}
                  address={submission.address}
                  bountyId={submission.bountyId}
                  viewPublic={props.bountyState?.bounty?.publicSubmissions}
                  fulfillmentId={submission.fulfillmentId}
                  ipfsHash={submission.data}
                  tokenAmount={bountyState.bounty.tokenAmount}
                  tokenRemainAmount={bountyState.bounty.remainTokenAmount}
                  themeColor={themeColor}
                  tokenSymbol={bountyState.bounty.tokenSymbol}
                  onAcceptSubmission={handleAcceptSubmissionClick}
                  isOwner={isOwner}
                  isAccepted={submission.isAccepted}
                />
            )
          }).reverse()
        }
      </Box>


    </>
  )
}

function isTransactionPending(bountyState): boolean {
  return bountyState.waitingSubmissionConfirmation;
}

export default BountyActions;
