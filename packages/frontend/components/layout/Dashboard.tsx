/* eslint-disable @typescript-eslint/no-unused-vars, no-console */
import React, { useCallback, useEffect, useState } from 'react';
import { useBreakpointValue, Center, Text, Box, Button, Spinner, Flex } from '@chakra-ui/react'
import { fetchBountiesByCreator, fetchBountyMetadataByaccount, fetchBountiesCountByCreator, fetchAllBountiesByCreator } from '../../service/bounties'
import { addToEnsDirectory, setAllBounties, setAvailableBounties, setBoard, setCanBoards, setCollaborators, setDashboardItems, setDashboardMetaData, setDraftBounties } from '../../reducers/dashboard/state'

import {  transformToBountyData } from '../../reducers/bounty/actions'
import { IEditBountyItems } from '../../pages/board/[account]/index'

import { RootState, useAppDispatch, useAppSelector  } from '../../reducers/index'
import { useRouter } from "next/router";

import { Navbar } from './sidebar/Navbar'
import { Sidebar } from './sidebar/Sidebar'
import { useAccount, useNetwork, useProvider } from 'wagmi';
import { supportedChains } from '../../constants/network';
import { IAccountMetadata } from '../../data/model';

import { Moralis } from 'moralis';

import { fromUnixTime } from 'date-fns';
import { ethers } from 'ethers';

import { signingMessage } from '../../constants/network';
import { useMoralis } from 'react-moralis';


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

export const Dashboard = ({ children }): JSX.Element => {
    
  // at this point account is already a resolved address
  const { data: accountData } = useAccount();
  const account = accountData?.address
  const isWalletConnect = accountData?.connector?.id === "walletConnect"
  // const { isConnected: connected } = useConnect();
  const { activeChain: chain } = useNetwork()
  const [ isCorrectChain, setIsCorrectChain ] = useState(true);

  
  useEffect(() => {
      if(chain) {
          setIsCorrectChain(supportedChains.includes(chain?.id));
      }
  }, [chain])

  const router = useRouter();
  const dispatch = useAppDispatch();
  const provider = useProvider();
  const dashboardState = useAppSelector((state: RootState) => { return state?.dashBoard; });

  const { metadata: stateMetadata, board, canBoards } = dashboardState;

  const [ isSwitchingBoard, setIsSwitchingBoard ] = useState(false);
  const [ isResolvingEns, setIsResolvingEns ] = useState(false);

  const { board: routerQueryBoard } = router.query;

  const [queryBoard, setQueryBoard] = useState<string | null>(null);

  const { isConnected: walletConnected } = useAppSelector((state: RootState) => { return state.wallet });
  const [ loadingState, setLoadingState ] = React.useState(-1);
  const [ hasMetadata, setHasMetadata ] = React.useState(true);

  
  const { allBounties, collaborators } = dashboardState;

  const fetchBounties = useCallback(() => {
    setIsSwitchingBoard(true);
    // account is already a valid address resolved from ens
    fetchAllBountiesByCreator(
      board as string,
      router.pathname.includes("/dashboard")
    ).then(allBountyStates => {
      dispatch(setAllBounties(
        allBountyStates?.result?.map((bounty) => {
          return transformToBountyData([bounty])
        })
      ));
    }).catch((e) => {
      console.log("error fetching all bounties", e)
    }).finally(() => {
      setIsSwitchingBoard(false);
    })
    
  }, [board, setIsSwitchingBoard]);
  
  
  useEffect(() => {
    // if the query board is an ens, resolve it
    if( routerQueryBoard) {
      const board = routerQueryBoard as string;
      if(! ethers.utils.isAddress(board)) {
        const ensFromCache = dashboardState.ensDirectory.find((ens: any) => ens.ensName === board.toLowerCase());
        if(ensFromCache?.address) {
          setQueryBoard(ensFromCache.address);
        } else {
          setIsResolvingEns(true);
          // is it an ens name?
          provider.resolveName(board).then( (ensAddress) => {
            if(ensAddress) {
              setQueryBoard(ensAddress);
              dispatch(addToEnsDirectory({
                ensName: board.toLowerCase(),
                address: ensAddress.toLowerCase()
              }));
            } else {
              setQueryBoard(board);
            }
          }).catch((e) => {
            console.log("error resolving ens", e)
            setQueryBoard(board);
          }).finally(() => {
            setIsResolvingEns(false);
          })

        }
      } else {
        setQueryBoard(board);
      }
    }

  }, [routerQueryBoard]);

  useEffect(() => {
    if (board) fetchBounties()
  }, [board])

  useEffect(() => {
    if (allBounties) {
      

      const availableBounties = allBounties?.filter((bounty) => {
        const today = new Date()

        const deadline = fromUnixTime(bounty.deadline);
        const isExpired = today >= deadline
        return bounty.isCompleted === false && isExpired === false && bounty.issueTxId && bounty.metadataUrl
      })
      dispatch(setAvailableBounties(availableBounties));

      const draftBounties = allBounties?.filter((bounty) => {
        return bounty.issueTxId === null && bounty.metadataUrl === null
      })

      dispatch(setDraftBounties(draftBounties));
      
    }
  }, [allBounties])

    // const supportedChainId = supportedChains[0];
    // const supportedChainName = chains.find(c => c.id === supportedChainId)?.name;


  //   const doSwitchNetwork = () => {
  //     switchNetwork(supportedChainId);
  // }


    const asyncFetchMetadata = useCallback( async (account) => {
      if(!account) {
        return;
      }
      setLoadingState(1);
            
      const metadata = await fetchBountyMetadataByaccount(account);
      
      if(metadata.result.length === 0) {
          // redirect to setup page
          router.push(`/dashboard/${account}/setup`);
      }

      setLoadingState(0);

      // get hostname
      const hostname = window.location.hostname;

      
      const defaultMetadata = {
        name : '',
        account : '',
        description : ``,
        imageUrl : `http://${hostname}/images/ethereum-logo.png`,
        email: '',
        urlname: '',
        website: '',
        themeColor: 'purple',
        twitter: '',
        discord: ''
      } as IAccountMetadata;
      
      const metadataState = metadata.result && metadata.result.length > 0 ? {
        id: metadata.result[0].objectId,
        imageUrl : metadata.result[0].imageUrl,
        email: metadata.result[0].email,
        urlname: metadata.result[0].urlname,
        website: metadata.result[0].website,
        twitter: metadata.result[0].twitter,
        discord: metadata.result[0].discord,
        themeColor: metadata.result[0].themeColor ?? 'purple',
        gnosis: metadata.result[0].gnosis,
        description : metadata.result[0].description,
        name : metadata.result[0].name,
        account : metadata.result[0].account,
        hideDrafts: metadata.result[0].hideDrafts || false
      } as IAccountMetadata : defaultMetadata;

      dispatch(setDashboardMetaData(metadataState));  
      
    }, [])

    // const isDashboard = router.pathname.includes('/dashboard');

    const asyncFetchBounties = useCallback( async (account) => {
      const countResult = await fetchBountiesCountByCreator(account, true);
      const count = parseInt(countResult.result);
      
      const allBountyStates = Array(count < 24 ? count : 24).fill({});
      
      await loadBountyStates(allBountyStates, account, 1, router.pathname.includes("/dashboard"));

      const myProps = {
        allBounties: allBountyStates,
        count,
      } as IEditBountyItems
  
      dispatch(setDashboardItems(myProps))
  
    }, []);

    useEffect(() => {
      if(loadingState === 0) {
        if(stateMetadata.id) {
          setHasMetadata(true);
        } else {
          setHasMetadata(false);
        }
      }
    }, [stateMetadata]);

    useEffect(()=>{
      if( board === undefined ) {
        return;
      }

      // asynchronously load the metadata
      asyncFetchMetadata(board);
      // asynchronously load the bounties
      asyncFetchBounties(board);
    
    }, [board])

    
    const isDesktop = useBreakpointValue({ base: false, lg: true });
    const notAuthorised =  !walletConnected; //!connected || !account && loadingState === -1;
    const errorReason = !walletConnected ? "your wallet is not connected." :
                  !isCorrectChain ? "your wallet is connected to the wrong chain." :
                  "a wallet connection error."

    useEffect(() => {
      // if board is a valid address, then store it in the redux store
      if(queryBoard) {
        
        if(ethers.utils.isAddress(queryBoard as string)) {
          dispatch(setBoard(queryBoard as string));
        } else {
          dispatch(setBoard(account as string));
        }
      } 
      
    }, [queryBoard, account])


    useEffect(() => {
      if(collaborators !== null) {
        dispatch(setCollaborators(null));
      }
    }, [board])
  
    useEffect(() => {
      if(board && collaborators === null) {
        const appId =  process.env.NEXT_PUBLIC_MORALIS_APP_ID;
        const serverUrl = process.env.NEXT_PUBLIC_MORALIS_SERVER_URL;
        Moralis.start({appId, serverUrl});
        Moralis.Cloud.run('getCollaborators', { board }).then((result) => {
          if(result) {
            dispatch(setCollaborators(result.map((collaborator: any) => {
                
                return {
                  address: collaborator.get('address'), 
                  isNFT: collaborator.get('isNFT'), 
                  createdAt: (new Date(collaborator.createdAt)).getTime(), 
                  objectId: collaborator.id
                }
              }))
            )
          }
        }).catch(() => {
          dispatch(setCollaborators(null));
        })
      }
    }, [board, collaborators])


     

    const { user, authenticate, isAuthenticated } = useMoralis();

    useEffect(() => {
    
      if(!account) {
        return
      }
      const appId =  process.env.NEXT_PUBLIC_MORALIS_APP_ID;
      const serverUrl = process.env.NEXT_PUBLIC_MORALIS_SERVER_URL;
      Moralis.start({appId, serverUrl});
      Moralis.Cloud.run('getAccesibleBoards', { address: ethers.utils.getAddress(account) }).then(boards => {
        dispatch(setCanBoards(boards.map((board: any) => {
          return {
            ...board,
            ...board.new ? {name: 'Your Board (Not Setup)'} : {}
          }
        })));
      });
      
      
    }, [account]);


    const [moralisAuthenticated, setMoralisAuthenticated] = useState(false);

    useEffect(() => {
      if(!account) {
        return;
      }
      if ( !isAuthenticated || account.toLowerCase() !== user.get('ethAddress').toLowerCase()) {
        setMoralisAuthenticated(false);
      } else {
        setMoralisAuthenticated(true);
      }
    }, [account, user, isAuthenticated]);

    const loginToMoralis = useCallback(async () => {
      // Get message to sign from the auth api
      const { message } = await Moralis.Cloud.run('requestMessage', {
        address: account,
        chain: chain?.id,
        networkType: 'evm',
      });

      authenticate(isWalletConnect ? { signingMessage: message, provider: 'walletconnect' } : { signingMessage: message } );
    }, [isWalletConnect, account, chain]);

    useEffect(() => {
      if(!account) {
        return;
      }
      router.push(`/dashboard`);
    }, [account])

    useEffect(() => {
      if(queryBoard && canBoards?.length) {
        const isYourBoard = canBoards?.findIndex(({board}) => board?.toLowerCase() === (queryBoard as string)?.toLowerCase()) > -1;
        if(!isYourBoard) {
          router.push(`/dashboard`);
        }
      }
    }, [canBoards, queryBoard])


    return (
        <>
          { isDesktop ? 
            <Sidebar hasMetadata={hasMetadata} notAuthorised={notAuthorised} /> : 
            <Navbar hasMetadata={hasMetadata} notAuthorised={notAuthorised} /> 
          }
          <Box as="section" overflow="auto" flexGrow={[1]} boxShadow="inner" borderTopLeftRadius={[0,0,0,'1rem']}>
          
          { !notAuthorised && isCorrectChain && <>
            { 
               moralisAuthenticated ?
               (isSwitchingBoard || isResolvingEns) ?
               <Flex p={5} gap='4' flexDirection="column" height="80vh" alignItems='center' justifyContent="center" w="full" color="gray.700">
                    <Spinner size='xl' />
                    <Text fontSize="lg" fontWeight="medium" mb={5}>{ isResolvingEns ? 'Resolving ENS' : 'Loading Data...'}</Text>
                </Flex>
                :children 
                :
                <Center p={5} flexDirection="column" height="100%" color="gray.700">
                  <Text fontSize="lg" fontWeight="medium" mb={5}>You need to autheticate with a signature to view this dashboard.</Text>
                  
                  <Button colorScheme={ stateMetadata?.themeColor ? stateMetadata.themeColor : 'green'} fontWeight="bold" size="sm" rounded="full" width={"220px"} onClick={ loginToMoralis }>Sign to Authenticate</Button>
                </Center>
             
            }
            </>
          }
          { (notAuthorised || !isCorrectChain )&& 
            <Center p={5} flexDirection="column" height="100%" color="gray.700">
                <Text fontSize="lg" fontWeight="medium" mb={5}>We could not display your dashboard because {errorReason}</Text>
                
                {/* <Button
                    colorScheme="purple"
                    fontWeight="bold"
                    size="sm"
                    rounded="full"
                    width={"220px"}
                    onClick={ doSwitchNetwork }
                    >Switch to { supportedChainName }</Button> */}
            </Center>
          }
          </Box>
        </>
    )
};
