import { Spacer, Stat, Text, StatLabel, StatNumber, StatHelpText, HStack, Flex, Box, Tooltip } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { transformToBountyData } from '../../reducers/bounty/actions'
import { fetchAllBountiesByCreator } from '../../service/bounties'
import { fromUnixTime } from 'date-fns'
import Blockies from "react-blockies";
import { useRouter } from 'next/router'

const formattingAmount = (amount) => {
  if (amount) {
    if (amount >= 1) return Number(amount.toFixed(2));
    else if (amount < 1) {
      if (amount < 0.0001) return "<0.0001";
      else return Number(amount.toFixed(4));
    }
  } else return 0;
}


export function BoardStates(props): JSX.Element {
  const account = props.account;
  const [bounties, setBounties] = useState([])
  const [rewardedAmount, setRewardedAmount] = useState({})
  const [rewardedCount, setRewardedCount] = useState(0)
  const [availableAmount, setAvailableAmount] = useState({})
  // const [availableCount, setAvailableCount] = useState(0)
  const [contributors, setContributors] = useState([])
  const contributorString = contributors.length > 0 ? contributors.length + " contributors" : "There are no contributors yet!";
  const router = useRouter();

  const fetchBounties = async () => {
    // account is already a valid address resolved from ens
    const allBountyStates = await fetchAllBountiesByCreator(
      account as string,
      router.pathname.includes("/dashboard")

    )
    setBounties(
      allBountyStates?.result?.map((bounty) => {
        return transformToBountyData([bounty])
      })
    )
  }

  useEffect(() => {
    if (account) fetchBounties()
  }, [account])

  useEffect(() => {
    if (bounties) {
      setContributors([]);
      const rewardedBounties = bounties?.filter(
        (bounty) => bounty.isCompleted === true
      )
      setRewardedCount(rewardedBounties.length);
      const tempRewardedAmount = rewardedBounties?.reduce((sum, bounty) => ({ ...sum, [bounty.tokenSymbol]: (sum[bounty.tokenSymbol] || 0) + bounty.tokenAmount }), {});
      setRewardedAmount(tempRewardedAmount);

      const availableBounties = bounties?.filter((bounty) => {
        const today = new Date()

        const deadline = fromUnixTime(bounty.deadline);
        const isExpired = today >= deadline
        return bounty.isCompleted === false && isExpired === false
      })

      // setAvailableCount(availableBounties.length);
      const tempAvailableBounties = availableBounties?.reduce((sum, bounty) => ({ ...sum, [bounty.tokenSymbol]: (sum[bounty.tokenSymbol] || 0) + bounty.tokenAmount }), {});
      setAvailableAmount(tempAvailableBounties);

      bounties?.map((bounty) => {
        bounty.submissions.map((submission) => {
          setContributors(contributors => [...new Set([...contributors, submission.address])])
        })
      })
    }
  }, [bounties])

  const maxContributorsDisplayed = 7;

  return (
    <Flex color="gray.500" direction={{ base: 'column', md: 'row', lg: 'row', xl: 'row' }} borderRadius="xl" p={2} >

      <Stat textAlign="center" >
        <StatLabel color="gray.500">Available Rewards</StatLabel>
        <HStack m={0} p={0} lineHeight="shorter">
          <Spacer />
          <>{Object.keys(availableAmount).map(key => <StatNumber key={key} fontWeight="extrabold" color="gray.600">{formattingAmount(availableAmount[key])} {key}</StatNumber>)}</>
          <Spacer />
        </HStack>
        {/* <StatLabel color="gray.500" >({availableCount} tasks)</StatLabel> */}
      </Stat>

      {rewardedCount > 0 ? 
      <Stat textAlign="center">
        <StatLabel color="gray.500">Amount Rewarded</StatLabel>
        <HStack m={0} p={0} lineHeight="shorter" fontWeight="extrabold" color="gray.700">
          <Spacer />
          <>{Object.keys(rewardedAmount).map(key => <StatNumber key={key} fontWeight="extrabold" color="gray.600">{formattingAmount(rewardedAmount[key])} {key}</StatNumber>)}</>
          <Spacer />
        </HStack>
        {/* <StatLabel color="gray.500" >(for {rewardedCount} tasks)</StatLabel> */}
      </Stat> : <></>}

      <Stat textAlign="center">
        <StatLabel color="gray.500">{contributorString}</StatLabel>
        <Flex>
          <Spacer />
          {contributors.slice(0, maxContributorsDisplayed).map((contributor, index) => {
  return (
    <Tooltip label={contributor} key={index}>
      <Box mr={-3} borderColor="gray.200" data-tip data-for={contributor} boxShadow="base" borderWidth={2} borderRadius="full" overflow="hidden">
        <Blockies seed={contributor} size={10} />
      </Box>
    </Tooltip>
  )
})}
{contributors.length > maxContributorsDisplayed &&
  <Box mt={3} ml={5} mr={-3} overflow="hidden">
    <Text fontSize="small">+ {contributors.length - 7} more</Text>
  </Box>
}
          <Spacer />

        </Flex>
        <StatHelpText>&nbsp;</StatHelpText>

      </Stat>
    </Flex>
  )
}
