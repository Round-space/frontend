import { Button, Text, Table, Flex, TableContainer, Tbody, Td, Th, Thead, Tr, VStack, Tooltip } from "@chakra-ui/react";
import { useEffect } from "react";
import { RootState, useAppDispatch, useAppSelector } from "../../../../reducers";
import { Moralis } from "moralis";
import { addToEnsDirectory, setSubscribers } from "../../../../reducers/dashboard/state";
import { truncateHash } from "../../../../lib/utils";
import { useQueryEnsName } from "../../../../hooks/useQueryEnsName";

const Subscriber = function({subscriber} : any) : JSX.Element {
  const date = new Date(subscriber.createdAt);
  // formate date as per the locale
  const formattedDate = date.toLocaleDateString();
  const ensName = useQueryEnsName( subscriber.user.ethAddress )
  const dispatch = useAppDispatch();
  const dashboardState = useAppSelector((state: RootState) => {
    return state?.dashBoard;
  });
  

  const { themeColor } = dashboardState.metadata ?? { id: null};
  const walletState = useAppSelector((state: RootState) => {
    return state?.wallet;
  });
  const etherScanUrl = walletState.chainMeta ? walletState.chainMeta.info.explorer : '';
  
  useEffect(() => {
    if(ensName) {
      // just to help the cache
      dispatch(addToEnsDirectory({address: subscriber.user.ethAddress.toLowerCase(), ensName}))
    }
  }, [ensName]);

  return (
    <Tr>
      {/* <Td>{subscriber.user.name}</Td> */}
      <Td>
          <Tooltip label={subscriber.user.ethAddress} placement='top'>
            {ensName || truncateHash(subscriber.user.ethAddress)}
          </Tooltip>
      </Td>
      <Td>{subscriber.user.email}</Td>
      <Td>{formattedDate}</Td>
      <Td><Button as='a' href={`${etherScanUrl}address/${subscriber.user.ethAddress}`} target='_blank' size='sm' colorScheme={themeColor} >View on Etherscan</Button></Td>
    </Tr>
  )
}

export default function SubscriberList(): JSX.Element {
  
  const dispatch = useAppDispatch();
  const dashboardState = useAppSelector((state: RootState) => {
    return state?.dashBoard;
  });
  

  const { id, themeColor } = dashboardState.metadata ?? { id: null};
  const { subscribers } = dashboardState;

  

  useEffect(() => {
    if(subscribers !== null) {
      dispatch(setSubscribers(null));
    }
  }, [id])

  useEffect(() => {
    if(id && subscribers === null) {
      Moralis.Cloud.run('getSubscribers', { id }).then((result) => {
        if(result) {
          dispatch(setSubscribers(result));
        }
      }).catch(() => {
        dispatch(setSubscribers(null));
      })
    }
  }, [id, subscribers])

  
  
  return (
    <>
    <Flex my={6} direction="column">
      <Text verticalAlign="center" fontSize="md" fontWeight="bold">Subscribers</Text>
      <Text verticalAlign="center" fontSize="md" color="gray.400" fontWeight="normal">Subscribers get notified when new opportunities are available on your project.</Text>
    </Flex>

      <VStack>
        <TableContainer width="100%">
          <Table variant='striped' colorScheme={themeColor} size="sm">
            <Thead>
              <Tr>
                {/* <Th>Name</Th> */}
                <Th>Address</Th>
                <Th>Email</Th>
                <Th>Subscribed on</Th>
                <Th></Th>
              </Tr>
            </Thead>
            <Tbody>
              {subscribers?.map((subscriber, index) => <Subscriber subscriber={subscriber} key={index} />)}
              
            </Tbody>
          </Table>
        </TableContainer>
        {!subscribers?.length && (
          <Text textAlign='center'>
            There are no subscribers yet.
          </Text>
        )}
      </VStack>
    </>
  )
}