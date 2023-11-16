import { Flex, Table, TableContainer, Tbody, Text, Td, Th, Thead, Tr, VStack, Tooltip, Button } from "@chakra-ui/react";
import {utils, BigNumber} from "ethers";
import { useRouter } from "next/router";
import { truncateHash } from '../../../../lib/utils'

import { useCallback, useEffect
  , useState 
} from "react";

// import { useMoralis } from 'react-moralis';
import { useAppSelector, useAppDispatch, RootState } from "../../../../reducers";
import { useQueryEnsName } from "../../../../hooks/useQueryEnsName";
import { addToEnsDirectory } from "../../../../reducers/dashboard/state";

const Contributor = function({contributor} : any) : JSX.Element {
  const router = useRouter();
  const walletState = useAppSelector((state: RootState) => {
    return state?.wallet;
  });

  const dashboardState = useAppSelector((state: RootState) => {
    return state?.dashBoard;
  });
  const ensName = useQueryEnsName( contributor.address )
  const dispatch = useAppDispatch();
  const { metadata } = dashboardState;
  
  const etherScanUrl = walletState.chainMeta ? walletState.chainMeta.info.explorer : '';
  const gotoBounty = useCallback((bountyId: string) => {
    router.push('/bounty/' + bountyId);
  }, []);

  useEffect(() => {
    if(ensName) {
      // just to help the cache
      dispatch(addToEnsDirectory({address: contributor.address.toLowerCase(), ensName}))
    }
  }, [ensName]);

  return (
    <>
      <Tr verticalAlign='top'>
        <Td>
          <Tooltip label={contributor.address} placement='top'>
            { ensName || truncateHash(contributor.address)}
          </Tooltip>
        </Td>
        <Td>
          {contributor.numSubmissions}
        </Td>
        <Td>
          {
            contributor.bounties.map( (bounty, index) => {
              return (
                <Flex key={index} alignItems='center'>
                  <Text fontSize='xs' onClick={() => gotoBounty(bounty.id)} cursor='pointer' color='blue.500'>
                  {bounty.name}
                  </Text>
                </Flex>
              )
            })
          }
        </Td>
        <Td>
          {
            Object.keys(contributor.rewards).map( (key, index) => {
              return (
                <Flex key={index} alignItems='center'>
                  <Text>

                    { utils.formatUnits(contributor.rewards[key].amount?.toString() ?? '0', contributor.rewards[key].decimals) } {key}
                    
                  </Text>
                </Flex>
              )
            })
          }
        </Td>
        {/* <Td>

        </Td> */}
        <Td>
          <Button as='a' href={`${etherScanUrl}address/${contributor.address}`} target='_blank' size='sm' colorScheme={metadata.themeColor} >View on Etherscan</Button>
        </Td>
      </Tr>
    </>
  )
}

export default function ContributorList(): JSX.Element {
  
  const [contributors, setContributors] = useState<any[]>([]);
  
  const dashboardState = useAppSelector((state: RootState) => {
    return state?.dashBoard;
  });

  
  const { allBounties, metadata } = dashboardState;

  
  
  useEffect(() => {
    
    const allSubmissions = allBounties.map( bounty => bounty.submissions.map( submission => ({...submission, bounty: bounty.databaseId, tokenDecimals: bounty.tokenDecimals, tokenSymbol: bounty.tokenSymbol})) ?? []);
    const allFulfillments = allBounties.map( bounty => bounty.chainFulfillments ?? []);
    const allAccepted = allBounties.map( bounty => bounty.acceptedFulfillments ?? []);
    
    // concat all submissions
    
    // use spread operator instead
    const submissionsFlat = [].concat(...allSubmissions);
    // concat all fulfillments
    const fulfillmentsFlat = [].concat(...allFulfillments);
    // concat all accepted
    const acceptedFlat = [].concat(...allAccepted);

    // group submissions by submitter
    const submissionsGrouped = submissionsFlat.reduce((r, a) => {
      const fulfillmentId = fulfillmentsFlat.find( ({ data }) => data === a.data)?.fulfillmentId ?? null;
      const reward = fulfillmentId ? acceptedFlat.find( (accepted) => accepted.bountyId === a.bountyId && accepted.fulfillmentId === fulfillmentId)?.tokenAmounts : null;
      r[a.submitter] = [...r[a.submitter] || [], {...a, reward}];
      return r;
    }, {});

    const contributors = [];

    Object.keys(submissionsGrouped).forEach( (key) => {
      
      const submissions = submissionsGrouped[key];
      
      // group submissions by bounty
      const submissionsByBounty = submissions.reduce((r, a) => {
        r[a.bounty] = [...r[a.bounty] || [], a];
        return r;
      }, {});

      const bounties = Object.keys(submissionsByBounty).map( (key) => {
        const bounty = allBounties.find( (bounty) => bounty.databaseId === key);
        const { name } = bounty;
        return { name, id: key};
      });

      const rewards = {};

      submissions.forEach( (submission) => {
        
        const reward = submission.reward ? BigNumber.from(submission.reward[0]) : BigNumber.from(0);

        rewards[submission.tokenSymbol] = rewards[submission.tokenSymbol] ? { ...rewards[submission.tokenSymbol], amount: rewards[submission.tokenSymbol].amount.add(reward)} : { amount: reward, decimals: submission.tokenDecimals };

      });

      
      // get total submissions
      const numSubmissions = submissions.length;
      
      contributors.push({
        address: key,
        numSubmissions,
        bounties,
        rewards
      })
    });
    
    setContributors(contributors);

  }, [allBounties])
  return (
    <>
    <Flex my={6} direction="column">
      <Text verticalAlign="center" fontSize="md" fontWeight="bold">Contributors</Text>
      <Text verticalAlign="center" fontSize="md" color="gray.400" fontWeight="normal">Contributors are automatically added to this list as they make submissions towards your projects.</Text>
    </Flex>

      <VStack>
        <TableContainer width="100%">
          <Table variant='striped' colorScheme={metadata.themeColor} size="sm">
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th># Proposals Submitted</Th>
                <Th>Rounds</Th>
                <Th>Amount Rewarded</Th>
                {/* <Th>KYC?</Th> */}
                <Th></Th>
              </Tr>
            </Thead>
            <Tbody>
              {contributors?.map((contributor, index) => <Contributor key={index} contributor={contributor} />)}
            </Tbody>
          </Table>
        </TableContainer>
        {!contributors?.length && (
          <Text textAlign='center'>
            There are no contributors yet.
          </Text>
        )}
      </VStack>
    </>
  )
}