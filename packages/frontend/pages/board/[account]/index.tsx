/* eslint-disable @typescript-eslint/no-unused-vars, no-console */
import { useRouter } from 'next/router'
import { useState, useEffect, useCallback } from 'react'
import { Spacer, Spinner, Center } from '@chakra-ui/react'
import { ethers } from 'ethers'
import { useAppDispatch } from '../../../reducers/index'
import { RootState, useAppSelector } from '../../../reducers'
import {
  IBountyState,
  transformToBountyData,
} from '../../../reducers/bounty/actions'
import { setBountyBoardItems, setAccountSettingsData, setBountyBoardEns } from '../../../reducers/bountyboard/state'
// import { BountyBoard } from '../../../components/board/bountyboard'
const BountyBoard = dynamic(() => import('../../../components/board/bountyboard'), {
  ssr: false,
})
import {
  fetchBountiesByCreator,
  fetchBountyMetadataByaccount,
  fetchBountiesCountByCreator,
} from '../../../service/bounties'
import { BoardMetadataInfo } from '../../../components/board/BoardMetadataInfo'
import { AccountMetadata, IAccountMetadata } from '../../../data/model'
import { BoardStates } from '../../../components/board/BoardStates'
import { useProvider } from 'wagmi'
import dynamic from 'next/dynamic'
import Moralis from 'moralis'
import { addToEnsDirectory } from '../../../reducers/dashboard/state'
import Head from 'next/head'

// this function will be used to fill in the slots of the bounty board, given the page number via lazy loading
const loadBountyStates = async (allBounties, account : string, page : number ) => {
  const data = await fetchBountiesByCreator(account, page, false);
  // populate the placeholders with the given page of bounties
  
  data.result.forEach((bounty, index) => {
    // get the index of the bounty
    const position = index + (page - 1) * 12
    // set the bounty at the index to the bounty
    allBounties[position] = transformToBountyData([bounty])
  })
}

const BountyBoardPage = (props: any): JSX.Element => {
  const router = useRouter()
  const { account } = router.query
  const bountyBoardState = useAppSelector((state: RootState) => {
    return state.bountyBoard
  })
  const dispatch = useAppDispatch()
  const [accountAddress, setAccountAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [ensName, setEnsName] = useState(bountyBoardState?.ensName);
  // let allBounties = [...props.allBounties];
  
  const provider = useProvider();
  const isDashboard = router.pathname.includes("/dashboard");
  const moreData = async (page: number) => {
    const newBounties = [...bountyBoardState?.items]
    loadBountyStates(newBounties, accountAddress, page).then(() => {
      // if it is not the last page yet, then add placeholders for the next page as well
      if (newBounties.length < bountyBoardState.count) {
        const diffCount = bountyBoardState.count - newBounties.length
        let placeHolderCount = 0

        if (diffCount > 12) {
          placeHolderCount = 12
        } else {
          placeHolderCount = diffCount
        }

        for (let i = 0; i < placeHolderCount; i++) {
          newBounties.push({} as IBountyState)
        }
      }

      dispatch(
        setBountyBoardItems({ count: bountyBoardState?.count, allBounties: newBounties })
      )
    })
  }

  const asyncFetchEnsName = useCallback(async (accountAddress) => {
    try {
      const ensName = await provider.lookupAddress(accountAddress)
      dispatch(setBountyBoardEns(ensName))
      // help the cache
      dispatch(addToEnsDirectory({ ensName, address: accountAddress.toLowerCase() }))
    } catch (e) {
      console.log('error looking up address', e.message)
    }
  }, [])

  const asyncFetchMetadata = useCallback(async (accountAddress) => {
      
    const metadata = await fetchBountyMetadataByaccount(accountAddress)

    // get hostname
    const hostname = window.location.hostname

    const defaultMetadata = {
      name: '',
      account: '',
      description: ``,
      imageUrl: `http://${hostname}/images/ethereum-logo.png`,
      website: '',
      twitter: '',
      discord: '',
      themeColor: '',
    } as IAccountMetadata

    const metadataState =
      metadata.result && metadata.result.length > 0
        ? {
            id: metadata.result[0].objectId,
            imageUrl: metadata.result[0].imageUrl,
            website: metadata.result[0].website,
            twitter: metadata.result[0].twitter,
            discord: metadata.result[0].discord,
            description: metadata.result[0].description,
            themeColor: metadata.result[0].themeColor,
            name: metadata.result[0].name,
            account: metadata.result[0].account,
          } as IAccountMetadata
        : defaultMetadata

        dispatch(setAccountSettingsData(metadataState))
  }, [])

  const asyncFetchBounties = useCallback(async (accountAddress) => {
    setLoading(true)
    const countResult = await fetchBountiesCountByCreator(accountAddress, false)
    const count = parseInt(countResult.result)

    const allBountyStates = Array(count < 24 ? count : 24).fill({})

    await loadBountyStates(allBountyStates, accountAddress, 1)
    
    setLoading(false)

    
    const myProps = {
      allBounties: allBountyStates,
      count,
    } as IEditBountyItems

    dispatch(setBountyBoardItems(myProps))
  }, [isDashboard])

  useEffect(() => {
    if(bountyBoardState?.ensName) {
      setEnsName(bountyBoardState.ensName);
    }
  }, [bountyBoardState])

  
  const boardQuery = new Moralis.Query(AccountMetadata);
  
  useEffect(() => {
    if (account) {
      setLoading(true)
      const verifyAddress = async () => {
        if (!ethers.utils.isAddress(String(account))) {

          const appId =  process.env.NEXT_PUBLIC_MORALIS_APP_ID;
          const serverUrl = process.env.NEXT_PUBLIC_MORALIS_SERVER_URL;
          Moralis.start({appId, serverUrl});
          
          // query to find a single board that has urlname as the account
          boardQuery.equalTo('urlname', account);
          const board = await boardQuery.first();
          if(board) {
            setAccountAddress(String(board.get('account')));
            return;
          }
          setEnsName(account as string);
          const validAccount = await provider.resolveName(account.toString())
          setAccountAddress(validAccount)
          // help the ens cache
          dispatch(addToEnsDirectory({ ensName: account.toString().toLowerCase(), address: validAccount.toLowerCase() }))
        } else setAccountAddress(String(account))
      }
      verifyAddress()
    }
  }, [account])

  useEffect(() => {
    if (accountAddress === undefined || !accountAddress) {
      return
    }

    // asyncronously load metadata
    asyncFetchMetadata(accountAddress)

    // asyncronously load ens name
    if (ethers.utils.isAddress(String(account))) {
      asyncFetchEnsName(accountAddress);
    }

    // asyncronously load bounties
    asyncFetchBounties(accountAddress)
  }, [accountAddress])

  return (
    <>
      <Head>
        <title>{props.ogTitle}</title>
        {/* <meta name="description" content={description} /> */}

    
        <meta property="og:url" content={props.ogUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={props.ogTitle} key="og_title" />
        <meta property="og:description" content={props.ogDescription} />
        <meta property="og:image" content={props.ogImageUrl} key="og_image" />

      
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content={props.ogHost} />
        <meta property="twitter:url" content={props.ogUrl} />
        <meta name="twitter:title" content={props.ogTitle} key="og_title" />
        <meta name="twitter:description" content={props.ogDescription} />
        <meta name="twitter:image" content={props.ogImageUrl} />

        
      </Head>
      <BoardMetadataInfo ensName={ ensName }></BoardMetadataInfo>
      <Spacer my={4} />
      <BoardStates account={accountAddress}></BoardStates>
      <Spacer my={4} />
      <BountyBoard moreData={moreData} loading={loading} account={bountyBoardState.metadata.account}></BountyBoard>
    </>
  )
}
export interface IEditBountyProps {
  allBounties: IBountyState[]
  count: number
  metadata: IAccountMetadata
  ensName: string
}
export interface IEditBountyItems {
  allBounties: IBountyState[]
  count: number
}


export default BountyBoardPage

export const getServerSideProps = async (ctx) => {
  
  const values = await Promise.all([
    fetchBountyMetadataByaccount(ctx.query.account),
    fetchBountiesCountByCreator(ctx.query.account, false)
  ])

  const [metadata, countResult] = values;
  const active = parseInt(countResult.result)

  const {name, description, imageUrl} =  metadata?.result?.[0] || { name: '', description: '', imageUrl: ''};
  
  // get url from ctx.req.url
  return {
    props: {
      ogTitle: name,
      ogDescription: description,
      ogHost: ctx.req.headers.host,
      ogUrl: 'https://' + ctx.req.headers.host + ctx.req.url,
      ogImageUrl: `https://${ctx.req.headers.host}/api/graphics/board?name=${name}&active=${active}&logo=${imageUrl}`,
    }
  }
}