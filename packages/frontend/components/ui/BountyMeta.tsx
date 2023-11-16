import {
  Button,
  Flex,
  Box,
  Link,
  chakra,
  VStack,
} from '@chakra-ui/react'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { useAppSelector,RootState} from '../../reducers/index'

import { formatDistance } from 'date-fns'
import fromUnixTime from 'date-fns/fromUnixTime'



const BountyMeta = () => {

  const bountyState  = useAppSelector((state : RootState)=>{return state.bounties;});

  const deadline =  bountyState.bounty ?  fromUnixTime(bountyState.bounty.deadline) : null;

  const daysTillDeadline =    bountyState.bounty === null ||  bountyState.bounty.deadline == 0  ? ''
      : formatDistance(deadline, new Date(), { addSuffix: true })


  const visitors = Math.abs(Math.floor(Math.random() * 100) - 1)

  const etherScanUrl = 'https://rinkeby.etherscan.io/tx/';
  let completeUrl = '';
  if(bountyState.bounty && bountyState.bounty.fulfillTxId)
  {
    completeUrl = etherScanUrl + bountyState.bounty.fulfillTxId
  }

  if(bountyState.bounty && bountyState.bounty.drainTxId)
  {
    completeUrl = etherScanUrl + bountyState.bounty.drainTxId
  }



  return (
    <VStack>
      <Box>
        <Flex direction="row" alignItems="stretch" justifyItems="stretch">
          <Button border="2px" borderColor="green.500" colorScheme="green" p={8} mt={-10} mx={2}>
            <VStack>
              <chakra.h3 fontWeight="thin">Reward</chakra.h3>
              <chakra.h2 fontSize="xl">
                { bountyState.bounty.tokenAmount} {bountyState.bounty.tokenSymbol}
              </chakra.h2>
            </VStack>
          </Button>
          <Button p={8} mt={-10} mx={2}>
            <VStack>
              <chakra.h5 fontWeight="thin">Due </chakra.h5>
              <chakra.h2 fontSize="xl">{daysTillDeadline}</chakra.h2>
            </VStack>
          </Button>
          <Button p={8} mt={-10} mx={2}>
            <VStack>
              <chakra.h5 fontWeight="thin">Visits</chakra.h5>
              <chakra.h2 fontSize="xl">{visitors}</chakra.h2>
            </VStack>
          </Button>
        </Flex>
      </Box>

      <Box>
        {bountyState.bounty?.isCompleted ? (
          <Box>Bounty Completed&nbsp;
            <Link href={completeUrl} isExternal>
              (View on Etherscan <ExternalLinkIcon mx="2px" />)
            </Link>
          </Box>
        ) : (
          <Box>Status: Active.</Box>
        )}

      </Box>
    </VStack>
  )
}



export default BountyMeta;