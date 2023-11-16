import { Spacer, Stat, Box, StatLabel, StatNumber, Text, HStack, Flex } from '@chakra-ui/react'
import { useEffect, useState } from 'react'



import { useAppSelector, RootState  } from '../../reducers/index'

import { ethers } from 'ethers'

const formattingAmount = (amount) => {
  if (amount) {
    if (amount >= 1) return Number(amount.toFixed(2));
    else if (amount < 1) {
      if (amount < 0.0001) return "<0.0001";
      else return Number(amount.toFixed(4));
    }
  } else return 0;
}


export function WalletOverview(props): JSX.Element {
  const account = props.account;
  
  const [rewardedAmount, setRewardedAmount] = useState({})
  const [rewardedCount, setRewardedCount] = useState(0)
  const [availableAmount, setAvailableAmount] = useState({})
  const [availableCount, setAvailableCount] = useState(0)
  
  const walletState = useAppSelector((state: RootState) => { return state.wallet });  
  const dashboardState = useAppSelector((state: RootState) => { return state?.dashBoard; });
  const { allBounties, availableBounties } = dashboardState;
  const { currentAccountEnsName: ensName } = useAppSelector((state: RootState) => { return state.wallet; });

  const [walletETH, setWalletETH] = useState('');
  


  // get eth amount from wallet
  useEffect(() => {
    setWalletETH(walletState?.nativeBalance ? ethers.utils.formatEther(walletState?.nativeBalance) : null)
  }, [walletState?.nativeBalance])

  useEffect(() => {
    if (allBounties) {
      const rewardedBounties = allBounties?.filter(
        (bounty) => bounty.isCompleted === true
      )
      setRewardedCount(rewardedBounties.length);
      const tempRewardedAmount = rewardedBounties?.reduce((sum, bounty) => ({ ...sum, [bounty.tokenSymbol]: (sum[bounty.tokenSymbol] || 0) + bounty.tokenAmount }), {});
      setRewardedAmount(tempRewardedAmount);
    }
  }, [allBounties])

  useEffect(() => {
    if ( availableBounties?.length ) {
      setAvailableCount(availableBounties.length);
      const tempAvailableBounties = availableBounties?.reduce((sum, bounty) => ({ ...sum, [bounty.tokenSymbol]: (sum[bounty.tokenSymbol] || 0) + bounty.tokenAmount }), {});
      setAvailableAmount(tempAvailableBounties);
    }
  }, [availableBounties])
  

  return (
    <>
  <Flex mb={3} direction="row">
    <Text verticalAlign="center" fontSize="md" fontWeight="bold">Wallet Overview</Text>
  </Flex>

    <Box borderWidth="thin" color="gray.600" borderColor="gray.300" backgroundColor="gray.50" rounded="2xl">
    <Flex my={2} pl={3} justifyContent="center" fontSize="xs">Address:&nbsp; <b>{ensName ? ensName + "(" + account + ")" : account}</b>
    </Flex>

    <Flex color="gray.500" direction={{ base: 'column', md: 'row', lg: 'row', xl: 'row' }} borderRadius="xl" p={2} >
      <Stat textAlign="center" >
        <StatLabel color="gray.500">ETH Availalble</StatLabel>
        <HStack m={0} p={0} lineHeight="shorter">
          <Spacer />
          <><StatNumber fontWeight="extrabold" color="gray.600">{walletETH ? formattingAmount(parseFloat(walletETH)) + ' ETH' : '-' }</StatNumber></>
          <Spacer />
        </HStack>
      </Stat>


      <Stat textAlign="center" >
        <StatLabel color="gray.500">Available Rewards</StatLabel>
        <HStack m={0} p={0} lineHeight="shorter">
          <Spacer />
          <>{Object.keys(availableAmount).map(key => <StatNumber key={key} fontWeight="extrabold" color="gray.600">{formattingAmount(availableAmount[key])} {key}</StatNumber>)}</>
          <Spacer />
        </HStack>
        <StatLabel fontWeight="extrabold" color="gray.600" >{availableCount > 0 ? availableCount + " Rounds" : "-"} </StatLabel>
      </Stat>

      <Stat textAlign="center">
        <StatLabel color="gray.500">Amount Rewarded</StatLabel>
        <HStack m={0} p={0} lineHeight="shorter" fontWeight="extrabold" color="gray.600">
          <Spacer />
          {rewardedCount > 0 ?
            <>{Object.keys(rewardedAmount).map(key => <StatNumber key={key} fontWeight="extrabold" color="gray.600">{formattingAmount(rewardedAmount[key])} {key}</StatNumber>)}</>
            : <>-</>
          }
          <Spacer />
        </HStack>
        {/* <StatLabel color="gray.500" >(for {rewardedCount} tasks)</StatLabel> */}
      </Stat>
    </Flex>

    
    </Box>
    </>
  )
}
