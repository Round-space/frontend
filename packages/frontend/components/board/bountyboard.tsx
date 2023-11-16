import {
  SimpleGrid,
  Box,
  Flex,
  HStack,
  VStack,
  Spacer,
  Skeleton,
  SkeletonText,
  Checkbox,
  Select,
  Text,
  Button
} from '@chakra-ui/react'
import { RootState, useAppSelector } from '../../reducers'
import { BountyBoardItem } from './bountyboardItem'
import { useRef, useCallback, useState, useEffect } from 'react'
import { fromUnixTime } from 'date-fns'
import { useRouter } from "next/router";
import { ethers } from 'ethers'
import { useAccount } from 'wagmi'

function useHookWithRefCallback(moreData) {
  const ref = useRef(null)
  const setRef = useCallback((node) => {
    if (node) {
      // check if the dummy node is every 12th child of the parent
      const nodePosition = Array.from(node.parentElement.children).indexOf(node)
      if (nodePosition % 12 === 0) {
        // only each 12th item when appearing in a viewport should trigger next page data load
        // use intersection observer if a dummy placeholder scrolls up in the viewport
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // IntersectionObserver triggered
              observer.disconnect()

              // load the new page data
              moreData(nodePosition / 12 + 1)
            }
          })
        })
        observer.observe(node)
      }
    }

    // Save a reference to the node
    ref.current = node
  }, [])

  return [setRef]
}

const DummyItem = function (props): JSX.Element {
  const [ref] = useHookWithRefCallback(props.moreData)

  return (
    <Flex
      ref={ref}
      margin={2}
      p={10}
      direction="column"
      borderColor="grey.300"
      borderWidth="7px"
      borderRadius="30px"
      boxShadow="base"
    >
      <Box top={0} pos="relative" left="0">
          <Flex mb="3" direction="row" display={{base: 'none', sm: 'flex' }}>
            <Skeleton height="25px" width="200px" />
            <Spacer />
            <Skeleton height="20px" width="100px" rounded="3xl" />
          </Flex>

          <SkeletonText mb="3" noOfLines={4} spacing="4" />

          <Spacer my={6} />

          <Skeleton rounded="lg" height="40px" />
      </Box>
    </Flex>
  )
}

export default function BountyBoard(props): JSX.Element {

  // if route contains /bounty/:account, then grab the id
  const router = useRouter();
  const boardOwner = props.account ? props.account as string : "";
  const { data: accountData } = useAccount();
  const account = accountData?.address
  const metadata = useAppSelector((state: RootState) => {
    return props.dashBoard
      ? state.dashBoard.metadata
      : state.bountyBoard.metadata
  })

  const bountyBoardState = useAppSelector((state: RootState) => { return props.dashBoard ? state.dashBoard : state.bountyBoard; });

  const [sortedBounties, setSortedBounties] = useState([])
  const [sortType, setSortType] = useState('option1')
  const [hide, setHide] = useState(false)

  const filterCancelledBounties = (bounties) => {
    const filterBounties =  bounties?.filter((bounty) => {
      if(bounty && Object.keys(bounty)?.length !== 0) {
        if(ethers.utils.getAddress(bounty?.creatorAddress || ethers.constants.AddressZero) === ethers.utils.getAddress(account || ethers.constants.AddressZero)) {
          return true;
        }
        else return bounty.drainTxId === null;
      } else return true;
    })
    return filterBounties; 
  }

  const gotoLaunchNewRoundPage = () => {
    router.replace(`/dashboard/${metadata.account}/bounty/create`);
  }

  useEffect(() => {
    if (hide) {
      const tempBounties = bountyBoardState?.items?.filter((bounty) => {
        const today = new Date()
        const deadline = fromUnixTime(bounty.deadline)
        const isExpired = today >= deadline
        return bounty.isCompleted === false && isExpired === false
      })
      setSortedBounties(filterCancelledBounties(tempBounties))
    } else setSortedBounties(filterCancelledBounties(bountyBoardState.items))
  }, [hide, bountyBoardState, account])

  useEffect(() => {
    let tempBounties
    tempBounties = [...bountyBoardState?.items]
    switch (sortType) {
      case 'option1':
        tempBounties = tempBounties?.sort((a: any, b: any) => {
          return (
            new Date(b?.creationDate).getTime() -
            new Date(a?.creationDate).getTime()
          )
        })
        break
      case 'option2':
        tempBounties = [...bountyBoardState?.items]
        tempBounties = tempBounties?.sort((a: any, b: any) => {
          return b?.tokenAmount - a?.tokenAmount
        })
        break
      case 'option3':
        tempBounties = [...bountyBoardState?.items]
        tempBounties = tempBounties?.sort((a: any, b: any) => {
          return b?.submissions?.length - a?.submissions?.length
        })
        break
    }
    setSortedBounties(filterCancelledBounties(tempBounties))

  }, [sortType, bountyBoardState, account])

  if(props.loading) {
    return (
      <VStack>
        <SimpleGrid columns={{ sm: 1, md: 2, lg: 3, xl: 3 }} spacing={3} width="100%">
          {[0,1, 2, 3].map((index) => {
              return <DummyItem key={index} moreData={props.moreData} />
          })}
        </SimpleGrid>
      </VStack>
    )
  }


  if( !bountyBoardState?.items?.length ) {
    return (
        <VStack justifyContent="center" alignItems="center" minHeight="200px">
            <Text>There are no Rounds on this space yet.</Text>
            { account && (account.toLocaleLowerCase() === boardOwner.toLocaleLowerCase() || boardOwner === '') && <Button size="lg" colorScheme={bountyBoardState.metadata.themeColor} rounded="2xl"  onClick={gotoLaunchNewRoundPage}>Launch New Round</Button> }
        </VStack>
    )
  }

  return (
    <VStack>
      <HStack justify="space-between" width="100%">
        <Checkbox checked={hide} onChange={() => setHide(!hide)}>
          Hide Completed
        </Checkbox>
        <HStack display="flex" whiteSpace="nowrap">
          <Text>Sort By</Text>
          <Select onChange={(e) => setSortType(e.target.value)}>
            <option value="option1">Date Created</option>
            <option value="option2">Reward Amount</option>
            <option value="option3">Activity</option>
          </Select>
        </HStack>
      </HStack>
      <SimpleGrid columns={{ sm: 1, md: 2, lg: 3, xl: 3 }} spacing={3} width="100%">
        {sortedBounties?.map((bountyState, index) => {
          if (bountyState?.databaseId) {
            return <BountyBoardItem key={index} {...bountyState} themeColor={metadata.themeColor} />
          } else {
            return <DummyItem key={index} moreData={props.moreData} />
          }
        })}
      </SimpleGrid>
    </VStack>
  )
}
