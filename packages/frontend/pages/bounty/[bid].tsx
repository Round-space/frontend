/* eslint-disable @typescript-eslint/no-unused-vars, no-console */
import BountyActions from '../../components/ui/BountyActions'
import BountyDetail from '../../components/ui/BountyDetail'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useCallback, useEffect, useState } from 'react'
import { Center, Spacer, Grid, GridItem, Box, Spinner, Flex, Text, Button } from '@chakra-ui/react'
import { utils, constants } from 'ethers'
import { useAppDispatch, useAppSelector, RootState } from '../../reducers/index'
import { IBountyState, transformToBountyData } from '../../reducers/bounty/actions'
import { bindBountyIssuedEventListener } from '../../reducers/bounty/asyncActions'
import { getBountyContract } from '../../web3/contractService'
import { setApplications, setBountyState, setCreatorEns, setRemainTokenBalance, setValidSubmissions, setBountyContributions, setBountyIsCompleted, setVotingState, setAllowedSubmission, setVotingAllowed, setVotingDates, setVotes, setMyVote, setIsDraft, setIsExpired, setIsPending, setBountyIssuersApprovers } from '../../reducers/bounty/state'
import { getGnosisAssets, truncate, truncateHash } from '../../lib/utils'
import { trim } from '../../utils/formatting'
import { formatDistanceToNow, fromUnixTime, format } from 'date-fns'
import bountyGraphic from '../../utils/bountyGraphic'

import ShareTab from '../../components/ui/ShareTab'
import BountySettings from '../../components/ui/BountySettings'
import ChainCheck from '../../components/ui/ChainCheck'
import { hostname } from 'os'
import { useTokenList } from '../../hooks/useTokenList'
import { initCurrencyValue } from '../../reducers/bountytoken/reducer'
import { initCurrencyValue as initFundingCurrencyValue } from '../../reducers/bountytoken/fundReducer'
import { getTokenPrice } from '../../reducers/bountytoken/asyncActions'
import { useMoralisQuery, useMoralisWeb3Api } from 'react-moralis'
import BountyReward from '../../components/ui/BountyReward'
import BountySubmissionForm from '../../components/ui/BountySubmissionForm'

import BountyApplicationForm from '../../components/ui/BountyApplicationForm'
import { BountyApplication } from '../../data/model'
import Moralis from 'moralis'

import { ethers } from 'ethers';
import { erc721ABI, erc1155ABI } from "../../constants/nft";

import { useAccount, useConnect, useNetwork, useProvider, useSigner } from 'wagmi'

import BountyContributions from '../../components/ui/BountyContributions'
import { supportedChains } from '../../constants/network'


import { useQueryEnsName } from '../../hooks/useQueryEnsName'
import { moduleFileExtensions } from '../../jest.config'
import { queryKey } from 'wagmi/dist/declarations/src/hooks/transactions/useWaitForTransaction'
import { ExternalFunding } from '../../components/ui/ExternalFunding'
import { bountyHardStatus } from '../../utils/bountyStatus'
import useNativeCurrency from '../../hooks/useNativeCurrency'


const baseURL = "https://www.round.space/round/";

const limitTo160Chars = function (text) {
  if (text.length <= 160) {
      return text;
  } else {
      const trimmed = text.substr(0, 160);
      const lastIndex = Math.max(trimmed.lastIndexOf(' '), trimmed.lastIndexOf('\n'));
      
      if(lastIndex >= 155) {
          return trimmed.substr(0, lastIndex);
      } else {
          return trimmed.substr(0, trimmed.lastIndexOf(' ', 155));
      }
  }
}


const deltaToText = function(delta : any) {
  let text = '';
  if (delta && delta.ops) {
      for (const op of delta.ops) {
          if (typeof op.insert !== 'undefined') {
              text += op.insert;
          }
      }
  }
  return limitTo160Chars(text);
}

const BountyDetailPage = (props): JSX.Element => {
  const router = useRouter()
  const { data: accountData } = useAccount();
  const account = accountData?.address
  const { isConnected: connected } = useConnect();
  const provider = useProvider();
  const { data: signer } = useSigner();
  const { activeChain: chain } = useNetwork()
  const chainId = chain?.id;
  
  const { bid } = router.query;
  const [shareLink, setShareLink] = useState('');  
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [creatorAddress, setCreatorAddress] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [bountyMetadata, setBountyMetadata] = useState<IBountyState>();
  const bountyState = useAppSelector((state: RootState) => { return state.bounties; });
  const { isDraft, isPending, isExpired, allowedSubmission } = bountyState;
  const walletState = useAppSelector((state: RootState) => { return state.wallet; });
  const fundingTokenState = useAppSelector((state) => state.fundBounty);
  const dispatch = useAppDispatch();
  const [objectId, setObjectId] = useState(null);

  const nativeCurrency = useNativeCurrency();
  
  const [currency, setCurrency] = useState(null);
  
  
  const etherScanUrl = walletState.chainMeta ? walletState.chainMeta.info.explorer + (walletState.chainMeta.info.explorer.endsWith('/') ? '' : '/') : '';

  const [hasApplied, setHasApplied] = useState(null);
  
  const [allowApplication, setAllowApplication] = useState(false);

  const [applicationsClosing, setApplicationsClosing] = useState('');
  const [applicationsOpen, setApplicationsOpen] = useState(true);

  const applicationsQuery = new Moralis.Query(BountyApplication);
  const applicationSingleQuery = new Moralis.Query(BountyApplication);
  const [votingEnabled, setVotingEnabled] = useState<boolean>(false);
  // useMoralis returns all the moralis state
  // multiple returns are ES6 syntax

  // const creatorAddress = props.bountyState ? props.bountyState.creatorAddress : null;
  // const { data: bountyCreatorEns } = useEnsName({
  //   address: creatorAddress,
  //   enabled: !!creatorAddress,
  //   cacheTime: 1000 * 60 * 60,
  // })
  const [bountyCreatorEns, setBountyCreatorEns] = useState(null);

  const ensName = useQueryEnsName( creatorAddress );

  const editDraft = useCallback(() => {
      router.push('/round/create/' + bid);
  }, [])



  useEffect(() => {
    // get querystring parameter called voting
    const urlParams = new URLSearchParams(window.location.search);
    const voting = urlParams.get('voting');
    if(voting && !isNaN(parseInt(voting))) {
      dispatch(setVotingState(parseInt(voting)));
    } else {
    

      if(bountyState.bounty?.voting && bountyState.bounty?.votingStart && bountyState.bounty?.votingEnd) {
        // get current time in seconds
        const time = new Date().getTime();
        const currentTime = Math.floor(time / 1000);

        const { votingStart, votingEnd }  = bountyState.bounty;
        // if current time is  between voting start and end
        if(currentTime >= votingStart && currentTime <= votingEnd) {
          dispatch(setVotingState(2))
        } else if(currentTime < votingStart) {
          dispatch(setVotingState(1))
        } else if(currentTime > votingEnd) {
          dispatch(setVotingState(3))
        }
      } else {
        dispatch(setVotingState(0))
      }
      
    }
    
    // set voting start date and end date for display in UTC
    dispatch(setVotingDates([
      new Date(bountyState.bounty?.votingStart * 1000).toLocaleString(),
      new Date(bountyState.bounty?.votingEnd * 1000).toLocaleString()
    ]))

}, [bountyState.bounty?.voting, bountyState.bounty?.votingStart, bountyState.bounty?.votingEnd])

useEffect(() => {
    if(bountyState.votingState > 0) {
        setVotingEnabled(true)
    } else {
        setVotingEnabled(false)
    }
}, [bountyState?.votingState])

useEffect(() => {
  dispatch(setVotingAllowed(null));

  if(!account) {
    return;
  }

  if(bountyState.bounty?.votingNFT) {
    const [ contractAddress, tokenId ] = bountyState.bounty?.votingNFT.split('/');
    if( ethers.utils.isAddress(contractAddress) ) {
      const contract = new ethers.Contract(contractAddress, (tokenId ? erc1155ABI : erc721ABI), provider);
      if(tokenId) {
        contract.balanceOf(account, tokenId).then( res => {
          console.log('erc1155 result', res);
          if(res.toNumber() > 0) {
            dispatch(setVotingAllowed(true));
          } else {
            dispatch(setVotingAllowed(false));
          }
        }).catch( err => {
          console.log('erc1155 error', err);
        })
      } else {
        contract.balanceOf(account).then( res => {
          console.log('erc721 result', res);
          if(res.toNumber() > 0) {
            dispatch(setVotingAllowed(true));
          } else {
            dispatch(setVotingAllowed(false));
          }
        }).catch( err => {
          console.log('erc721 error', err);
        })
      }
      
    }
  } else {
    dispatch(setVotingAllowed(true));
  }

}, [account, votingEnabled, bountyState?.bounty?.votingNFT])

useEffect(() => {
    if(votingEnabled && bountyState.bounty?.bountyId) {
        // call to cloud function to get votes count on all submissions
        Moralis.Cloud.run('getVotes', { 
            bountyId: bountyState.bounty?.bountyId,
         })
        .then((res) => {
            if(res.votes) {
                dispatch(setVotes(res.votes))
            }
        })
    }
}, [votingEnabled, bountyState.bounty?.bountyId])

useEffect(() => {
  if(votingEnabled && account && bountyState.bounty?.databaseId) {
      // call to cloud function to get votes count on all submissions
      Moralis.Cloud.run('myVote', { 
          objectId: bountyState.bounty?.databaseId,
          address: account
      })
      .then((res) => {
          dispatch(setMyVote(res ?? null));
      })
  }
}, [account, votingEnabled, bountyState.bounty?.databaseId])


  useEffect(() => {
    setBountyCreatorEns(ensName)
  }, [ensName]);

  useEffect(() => {
    // if we have not yet fetched the applications
    if(hasApplied === null) {
      return;
    }
    
    if( account && bountyState?.bounty?.requiresApplication ) {
      setAllowApplication(true)
    } else {
      setAllowApplication(false)
    }
  }, [bountyState?.bounty?.requiresApplication, hasApplied])

  // useEffect(() => {
  //   console.log('isOwner', isOwner);
  // }, [isOwner])

  useEffect(() => {
    if( !account ) {
      setIsOwner(false);
      return
    }  
    
    if( bountyState?.approvers?.length) {
      // console.log('setting owner', bountyState.approvers.includes(account));
      setIsOwner(bountyState.approvers.includes(account))
    } else if( bountyState?.bounty?.creatorAddress ) {
      setIsOwner(utils.getAddress(bountyState?.bounty?.creatorAddress) === utils.getAddress(account || constants.AddressZero))
    }
    
    if(!bountyState?.bounty?.requiresApplication || bountyState?.bounty?.acceptedApplications?.find(({applicant}) => applicant.toLowerCase() === account.toLowerCase())) {
      dispatch(setAllowedSubmission(true))
    } else {
      dispatch(setAllowedSubmission(false))
    }
    
    
  }, [account, bountyState])

  useEffect(() => {
    if(account && bountyState?.bounty?.bountyId && bountyState?.bounty?.requiresApplication) {
      applicationSingleQuery.equalTo("bountyId", bountyState.bounty.bountyId);
      applicationSingleQuery.equalTo("applicant", account.toLowerCase());
      applicationSingleQuery.find().then(applications => {
        
        if(applications.length > 0) {
          setHasApplied(true);
        } else {
          setHasApplied(false);
        }
      })
    }

  }, [account, bountyState?.bounty?.bountyId])

  useEffect(() => {
    if( allowApplication && bountyState?.bounty?.applicationsDeadline ) {

      const deadlineDate = fromUnixTime(bountyState.bounty.applicationsDeadline ?? 0); // ms value turned to date
      setApplicationsClosing( bountyState.bounty.applicationsDeadline == 0 ? '' : format(deadlineDate, 'PP'));

      // if applicationsDate is in the past, we can't apply
      if( bountyState.bounty.applicationsDeadline * 1000 < new Date().getTime() ) {
        console.log(bountyState.bounty.applicationsDeadline, new Date().getTime())
        setApplicationsOpen(false);
      } else {
        setApplicationsOpen(true);
      }
    } else {
      setApplicationsClosing('');
    }
  }, [allowApplication, bountyState?.bounty?.applicationsDeadline])

  // useEffect(() => {
  //   if(creatorAddress) {
  //     fetchEnsName({
  //       address: creatorAddress
  //     }).then(data => {
  //       setBountyCreatorEns(data); 
  //     })
  //   }
  // }, [creatorAddress])
   
  const walletTokenList = useTokenList(walletState.tokenBalance);
  const [tokenList, setTokenList] = useState([]);
  const { token } = useMoralisWeb3Api()
  

  const fetchBounty = async () => {
    const applicationId = process.env.NEXT_PUBLIC_MORALIS_APP_ID;
    const serverUrl = process.env.NEXT_PUBLIC_MORALIS_SERVER_URL;
    setLoading(true);
    const bountyDataUrl = `${serverUrl}/functions/getBountyByObjectId`;
    const data = await (await fetch(bountyDataUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        objectId: bid,
        _ApplicationId: applicationId
      })
    })).json();
    setObjectId(data.objectId);
    const bountyData = transformToBountyData(data.result);
    if(!bountyData) setNotFound(true);
    const today = new Date();
    const deadline = bountyData ? fromUnixTime(bountyData.deadline) : today;

    setBountyMetadata(bountyData);
    
    dispatch(setIsExpired(today >= deadline))
    
    setCreatorAddress(bountyData?.creatorAddress);
    setLoading(false);
    // return bountyState;
  }

  useEffect(() => {
    if(!bountyMetadata?.gnosis){
      setTokenList(walletTokenList);
    }
  }, [walletTokenList, bountyMetadata?.gnosis])

  useEffect(() => {
    // if gnosis is a valid address
    if(ethers.utils.isAddress(bountyMetadata?.gnosis)){
      // get token balance from gnosis
      getGnosisAssets(chainId, bountyMetadata.gnosis, (data) => {
        
        setTokenList(data.items.map((item:any) => {
          
          const currency = item.tokenInfo.type === 'NATIVE_TOKEN' ? 
          {
              chain: chainId,
              decimals: nativeCurrency.decimals,
              isNative: nativeCurrency.isNative,
              isToken: false,
              name: nativeCurrency.name,
              symbol: nativeCurrency.symbol,
              logo: nativeCurrency.logo,
              token_address: nativeCurrency.token_address,
          } : {
              chain: chainId,
              logo: item.tokenInfo.logoUri,
              decimals: item.tokenInfo.decimals,
              isNative: item.tokenInfo.type === "NATIVE_TOKEN",
              isToken: item.tokenInfo.type === "ERC20",
              name: item.tokenInfo.name,
              symbol: item.tokenInfo.symbol,
              token_address: item.tokenInfo.address
          };

          return {
            amount: item.balance,
            currency
          }
        }))
        
      });
      // setTokenBalances()
    }

  }, [bountyMetadata?.gnosis])

  useEffect(() => {
    dispatch(setValidSubmissions());
  }, [bountyState?.bounty?.acceptedApplications])
  const [ fulfillmentTrxs, setFulfillmentTrxs ] = useState<string[]>([]);
  
  // the following is being used so that in case bountyState?.bounty?.fulfillTxId changes, it does not re-fetch the fulfillments
  const [ atleastFulfilled, setAtleastFulfilled ] = useState(false);

  useEffect(() => {
    if(bountyState?.bounty?.fulfillTxId && bountyState?.bounty?.bountyId && atleastFulfilled === false) {
      setAtleastFulfilled(true);
    }
  }, [bountyState?.bounty?.fulfillTxId])

  useEffect(() => {
      if(atleastFulfilled) {
    
          const query = new Moralis.Query('FulfillmentAccepted');
          query.equalTo("bountyId", bountyState?.bounty?.bountyId)
          query.find().then(fulfillments => {
              const result = fulfillments.map(fulfillment => fulfillment.get('transaction_hash'))
              // remove duplicates and set
              setFulfillmentTrxs([...new Set(result)]);
          });
      }
  }, [atleastFulfilled]);

  useEffect(()=> {
    setShareLink(window.location.href);
    if(bid) fetchBounty();
  }, [bid])

  useEffect(()=>{
    if(bountyCreatorEns){
      dispatch(setCreatorEns(bountyCreatorEns));
    }
  }, [creatorAddress, bountyCreatorEns]);


  useEffect(() => {
    if( !bountyMetadata ) {
      return;
    }

    // It is a draft if it does not have a issueTxId and a metadataUrl
    const isADraft = !bountyMetadata.issueTxId && !bountyMetadata.metadataUrl;
    const isPending = !bountyMetadata.issueTxId && !!bountyMetadata.metadataUrl;
    
    if (bountyMetadata.bountyId !== null || isADraft || isPending) {
      dispatch(setBountyState(bountyMetadata));
    }

    if(isADraft) {
      setHasApplied(false);
    }
    dispatch(setIsPending(isPending));
    dispatch(setIsDraft(isADraft));

  }, [bountyMetadata]);

  useEffect(() => {
    if(bountyMetadata?.bountyId && fundingTokenState?.currency?.decimals) {
      setRemainBalance();
    }
  }, [bountyMetadata?.bountyId, fundingTokenState?.currency?.decimals])

  useEffect(() => {
    if (!bountyState.creating && bountyState.bounty != null && bountyState.bounty.bountyId == null) {
      bindBountyIssuedEventListener(dispatch, getBountyContract(chainId, signer), bountyState.bounty.data);
    }
  }, [bountyState.creating, bountyState.bounty])

  useEffect(()=> {

    if(tokenList?.length > 0 && bountyMetadata) {
      
      const currentToken = tokenList?.find((token) => token?.currency?.symbol === bountyMetadata?.tokenSymbol);
      // console.log('currentToken', currentToken);
      // console.log('tokenList', tokenList);
      // console.log('symbol', bountyMetadata?.tokenSymbol);
      if(!currentToken) {
        // in this case atleast we need to populate the current fund token being used, at definitely its not native at this point
        const hexChainId = `0x${supportedChains[0]?.toString(16)}`;
        token.getTokenMetadata({
          chain: hexChainId as "eth" | "0x1" | "ropsten" | "0x3" | "rinkeby" | "0x4" | "goerli" | "0x5" | "kovan" | "0x2a" | "polygon" | "0x89" | "mumbai" | "0x13881" | "bsc" | "0x38" | "bsc testnet" | "0x61" | "avalanche" | "0xa86a" | "avalanche testnet" | "0xa869" | "fantom" | "0xfa" | undefined,
          addresses: [bountyMetadata?.tokenAddress],
        }).then(async res => {
          if(!res.length) {
            return;
          }
          const tokenCurrency = {
            chain: chainId,
            token_address: bountyMetadata?.tokenAddress,
            symbol: bountyMetadata?.tokenSymbol,
            isNative: false,
            decimals: parseInt(res[0]['decimals']),
            name: res[0]['name'],
            isToken: true,
          }
          
          setCurrency(tokenCurrency);
          
          const currentToken = {
            currency: tokenCurrency,
            amount: '0',
          }

          dispatch(initFundingCurrencyValue(currentToken));
          
          getTokenPrice(dispatch, currentToken.currency, token, true) // true means, also update fundBounty state
        })


        return;
      }
      
      if(currentToken.currency.symbol === "ETH" && currentToken.currency.isNative === false) currentToken.currency.isNative = true;
      setCurrency(currentToken.currency);
      dispatch(initCurrencyValue(currentToken));
      
      dispatch(initFundingCurrencyValue(currentToken));
      getTokenPrice(dispatch, currentToken.currency, token, true) // true means, also update fundBounty state
    }
  }, [tokenList, bountyMetadata, token])

  

  // useEffect(() => {
  //   if(account && bountyState?.bounty?.creatorAddress) {
  //     setIsOwner(utils.getAddress(bountyState?.bounty?.creatorAddress) === utils.getAddress(account || constants.AddressZero))
  //   }

  //   if(!bountyState?.bounty?.requiresApplication || (account && bountyState?.bounty?.acceptedApplications?.find(({applicant}) => applicant.toLowerCase() === account.toLowerCase()))) {
  //     dispatch(setAllowedSubmission(true))
  //   } else {
  //     dispatch(setAllowedSubmission(false))
  //   }
  // }, [account, bountyState])

  useEffect(() => {
    if(bountyState?.bounty?.bountyId) {
      applicationsQuery.equalTo("bountyId", bountyState.bounty.bountyId);
      applicationsQuery.find().then((res) => {
        const applications = res.map((application) => {
          return {
            objectId: application.id,
            bountyId: bountyState.bounty.bountyId,
            ipfsHash: application.get('ipfsHash'),
            email: application.get('email'),
            applicant: application.get('applicant'),
            date: application.get('createdAt').toString()
          }
        })
        
        dispatch(setApplications(applications)) 
      }).catch(console.log);
    }
  }, [bountyState?.bounty?.bountyId]);

  const setContributions = useCallback((contributions) => {
    dispatch(setBountyContributions(contributions));
  }, [bountyState?.bounty?.bountyId])

  const setRemainBalance = async () => {
    if( !bountyMetadata?.bountyId ) {
      return;
    }
    
    try {
      const contract = getBountyContract(supportedChains[0], provider);
      
      const [issuers, approvers, c, d, e, amountInWei, g, fulfillments, Contributions] = await contract.getBounty(bountyMetadata.bountyId);
      
      setContributions(Contributions.map(({ amount, contributor, refunded}) => ({amount: amount.toString(), contributor, refunded})));
      
      const remainBalance = utils.formatUnits(amountInWei, fundingTokenState?.currency?.decimals);// :
      
      dispatch(setRemainTokenBalance(parseFloat(remainBalance)));

      dispatch(setBountyIsCompleted(fulfillments.length));
      dispatch(setBountyIssuersApprovers({issuers, approvers}));
    } catch(e) {
      console.log(e)
    }
  }

  

  // ssrMetadata to populate the og:image and og:title
  const name = props.ssrMetadata ? props.ssrMetadata.name : 'Unknown';
  const descriptionCode = props.ssrMetadata ? props.ssrMetadata.description : '';
  
  // parse rich text delta into plain text for og description
  let ops = [];
  try {
    const json = JSON.parse(descriptionCode);
    ops = json?.ops ? json.ops : [];
  } catch (e) {
    ops = descriptionCode?.split("\n").map((line) => ({ insert: line + "\n" }));  
  }
  
  const description = deltaToText({ ops });

  const url = new URL('https://aikido-og-image.vercel.app');

  const formattedAmount = bountyState.bounty?.tokenAmount ? trim(bountyState.bounty?.tokenAmount.toString(), 6) : '';
  const formattedRemainAmount = bountyState.bounty?.remainTokenAmount ? trim(bountyState.bounty?.remainTokenAmount.toString(), 6) : '';


  const reward = props.ssrMetadata ? formattedAmount + ' ' + props.ssrMetadata.tokenSymbol : '0';
  url.pathname = `${encodeURIComponent('og.png')}`;
  url.searchParams.append('title', name);
  url.searchParams.append('description', truncate(description, 16));
  url.searchParams.append('reward', reward);
  const deadlineDate = props.ssrMetadata ? fromUnixTime(props.ssrMetadata.deadline ?? 0) : 0; // ms value turned to date
  
  const daysTillDeadlineStr = props.ssrMetadata ? formatDistanceToNow(deadlineDate, { addSuffix: true }) : null;
  let status = props.ssrMetadata ? (props.ssrMetadata?.isCompleted ? 'Closed.' : 'Open.' + ' Due ' + daysTillDeadlineStr) : 'Invalid';
  
  if (!props.ssrMetadata?.deadline) {
    status = 'Deadline Not Set.';
  } else if(props.ssrMetadata < new Date())
    status = 'Expired.';
  url.searchParams.append('status', status);

  

  let content = <></>

  if (notFound && !loading) {
    content =  (<div>
      <Center>
        No Round found for ID: {bid}
      </Center>
    </div>)
  }

  if(loading) {
    content =  (
      <div>
        <Center>
          <Spinner
            thickness='4px'
            speed='0.65s'
            emptyColor='gray.200'
            color='blue.500'
            size='xl'
          />
        </Center>
      </div>
    )
  }

  if (bountyMetadata && !loading) {
    content = (
      
        <Grid gridTemplateColumns={{ base: '1fr', md: '2fr 1fr' }} gridGap={12}>
          <Flex direction="column" gap="8">
            <BountyDetail isExpired={isExpired} shareLink={shareLink} isDraft={isDraft} isPending={isPending}></BountyDetail>
            
            <BountyActions
              isOwner={isOwner}
              isExpired={isExpired} 
              account={account} 
              connected={connected} 
              bountyMetadata={ bountyMetadata } 
              objectId={objectId} 
              appendFulfillment={ (fulfillment) => { setFulfillmentTrxs([...fulfillmentTrxs, fulfillment])}} 
              />
          </Flex>

          <Flex direction="column" gap="8">
            <BountyReward completed={bountyState.bounty?.isCompleted} numRewards={bountyState.bounty?.numRewards} remainTokenAmount={formattedRemainAmount} tokenAmount={formattedAmount} tokenSymbol={bountyState.bounty?.tokenSymbol} deadline={bountyState.bounty?.deadline}>
              <Box position={{ base: 'fixed', md: 'relative' }} bottom={0} right={0} left={0} bg={{ base: 'white', md: 'transparent' }} zIndex={1} p={{ base: 4, md: 0}} borderTopWidth={{ base: '1px', md: '0' }} borderTopColor={{ base: 'gray.200', md: 'transparent' }}>
              { !bountyState.bounty?.isCompleted && (allowApplication ||  (bountyState?.bounty?.requiresApplication && !connected)) && (
              <>
              {hasApplied ? 
                  (allowedSubmission ? 
                      <Box color="gray.600" shadow="base" borderRadius="xl" p={2} bgColor="gray.50" fontSize="sm" mb={4}>
                        <Text fontWeight="bold" mb={1}>Application accepted! 🎉</Text>
                        <Text>You can now submit a proposal for this Round.</Text>
                      </Box>  
                    : 
                    <Box color="gray.600" shadow="base" borderRadius="xl" p={2} bgColor="gray.50" fontSize="sm" mb={4}>
                      <Text fontWeight="bold" mb={1}>Application under review</Text>
                      <Text>Thank you for applying to participate in this Round.</Text>
                    </Box>  
                  )
                  : 
                    ( applicationsOpen ? 
                      <>  
                        <Box color="gray.600" shadow="base" borderRadius="xl" p={2} bgColor="gray.50" fontSize="sm" mb={4}>
                          <Text fontWeight="bold" mb={1}>Requires Application</Text>
                          { connected ?
                          <Text>You need to apply before submitting a proposal for this Round.</Text>
                          :
                          <Text>Connect your wallet to apply for this Round.</Text>
                          }
                          { applicationsClosing && <Text fontSize="sm" fontWeight="bold">Closing on {applicationsClosing} </Text> }
                        </Box>  
                        <BountyApplicationForm isExpired={isExpired} setHasApplied={ setHasApplied }></BountyApplicationForm> 
                      </>
                      :
                      <Box color="gray.600" shadow="base" borderRadius="xl" p={2} bgColor="gray.50" fontSize="sm" mb={4}>
                        <Text fontWeight="bold" mb={1}>Application Closed</Text>
                        <Text>Applications are no longer being accepted</Text>
                      </Box> 
                    )
                
                }
                </>
              ) }
              
              { ((!connected && !bountyState?.bounty?.requiresApplication) || allowedSubmission) && <BountySubmissionForm isExpired={ !isDraft && isExpired}></BountySubmissionForm> }
              {(!bountyState.creating || !bountyState.bounty?.issueTxId) && !bountyState.bounty?.isCompleted && bountyMetadata?.externalFunding && !isDraft && !isPending &&
                <ExternalFunding 
                  bountyMetadata={ bountyMetadata } 
                  objectId={ objectId } 
                  isExpired={isExpired}
                  appendContribution={ (contribution) => { 
                    setContributions([...(bountyState?.bounty?.contributions || []), { ...contribution, amount: contribution.amount.toString() }])
                  }} 
                /> 
              }
              { isDraft && isOwner && <Button onClick={editDraft} w='full'>Edit Draft</Button>}
              </Box>
            </BountyReward>

            { bountyMetadata?.externalFunding && 
            <Box mb={{ base: isOwner ? 'unset' : 150, md: 'unset' }} >
              <BountyContributions contributions={ bountyState?.bounty?.contributions || [] } currency={currency} etherScanUrl={etherScanUrl} />
            </Box> }
            <ChainCheck etherScanUrl={etherScanUrl} walletState={walletState} bountyState={bountyState} fulfillmentTrxs={fulfillmentTrxs} />
            
            { isOwner ?
              <BountySettings account={ account } bountyState={ bountyState } isExpired={ isExpired } /> : ""
            }
          </Flex>
        </Grid>

    )
  } 
  

  return (
    <>
    <Head>
      <title>{name}</title>
      <meta name="description" content={description} />

   
      <meta property="og:url" content={props.ogUrl} />
      <meta property="og:type" content="article" />
      <meta property="og:title" content={name} key="og_title" />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={props.ogImageUrl} key="og_image" />

    
      <meta name="twitter:card" content="summary_large_image" />
      <meta property="twitter:domain" content={props.ogHost} />
      <meta property="twitter:url" content={props.ogUrl} />
      <meta name="twitter:title" content={name} key="og_title" />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={props.ogImageUrl} />

      
    </Head>
    {content}
    </>
  )
}

const getBountyMetadata = async (bid) => {
  const applicationId = process.env.NEXT_PUBLIC_MORALIS_APP_ID;
  const serverUrl = process.env.NEXT_PUBLIC_MORALIS_SERVER_URL;
  
  const bountyDataUrl = `${serverUrl}/functions/getBountyByObjectId`;
  const data = await (await fetch(bountyDataUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      objectId: bid,
      _ApplicationId: applicationId,
    }),
  })).json();
  
  
  const bountyData = transformToBountyData(data.result);
  
  return bountyData;
}

export const getServerSideProps = async (ctx) => {
  const { bid } = ctx.query;
  const bountyMetadata = await getBountyMetadata(bid);
  
  const truncatedName = bountyMetadata?.name?.length ? (bountyMetadata.name.length > 60 ? bountyMetadata.name.substring(0, 60) + '...' : bountyMetadata.name) : '';
  const deadlineDate = fromUnixTime(bountyMetadata?.deadline ?? 0);
  const dueDate = bountyMetadata?.deadline == 0 ? '' : format(deadlineDate, 'PP');
  const amount = ( bountyMetadata?.tokenAmount?.toString() ?? "0.0" ) + " " + bountyMetadata?.tokenSymbol ?? "";

  const status = bountyHardStatus(bountyMetadata);
  
  // get url from ctx.req.url
  return {
    props: {
      ssrMetadata: bountyMetadata,
      ogHost: ctx.req.headers.host,
      ogUrl: 'https://' + ctx.req.headers.host + ctx.req.url,
      ogImageUrl: `https://${ctx.req.headers.host}/api/graphics?name=${truncatedName}&amount=${amount}&date=${dueDate}&status=${status}`,
    }
  }
}


export default BountyDetailPage