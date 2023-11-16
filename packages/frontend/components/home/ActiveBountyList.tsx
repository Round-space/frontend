import {
  Flex,
  VStack,
  Spacer,
  Text,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  TableContainer
} from '@chakra-ui/react'
import { RootState, useAppSelector } from '../../reducers'
import { useRouter } from "next/router";
import { BountyListItem } from '../board/BountyListItem'

const DummyItem = function (): JSX.Element {
  return (
    <Flex>
      Loading...
    </Flex>
  )
}


export default function ActiveBountyList(props): JSX.Element {
  
  const router = useRouter();

  const dashboardState = useAppSelector((state: RootState) => {
    return state?.dashBoard;
  });

  const { metadata, availableBounties, draftBounties, board } = dashboardState;

  const gotoNewBounty = () => {
    router.push(`/dashboard/${board}/bounty/create`);
  } 

  if (props.loading) {
    return (
      <VStack>
        Loading...
      </VStack>
    )
  }


  

  const createBountyButton = (<Button size="xs" colorScheme={metadata?.themeColor} onClick={gotoNewBounty}>Create New</Button>);

  return (
    <>
    {/* ACTIVE */}
      <Flex my={6} direction="row">
        <Text verticalAlign="center" fontSize="md" fontWeight="bold">Active</Text>
        <Spacer />
        {createBountyButton}
      </Flex>

      <VStack>
        <TableContainer width="100%">
          <Table variant='striped' colorScheme={metadata.themeColor} size="sm">
            <Thead>
              <Tr>
                <Th>Title</Th>
                <Th>Created</Th>
                <Th>Deadline</Th>
                <Th>Reward</Th>
                <Th>Status</Th>
                <Th>Contributors</Th>
                <Th></Th>
              </Tr>
            </Thead>
            <Tbody>
              {availableBounties?.map((bountyState, index) => {
                if (bountyState?.databaseId) {
                  return <BountyListItem action="view" key={index} {...bountyState} themeColor={metadata.themeColor}  />
                } else {
                  return <DummyItem key={index} />
                }
              })}
            </Tbody>
          </Table>
        </TableContainer>
        {availableBounties.length == 0 && (
        <>
        <Text>
        </Text>
        <Flex>
        There are no active rounds yet.
        </Flex>
        </>
        )}
      </VStack>

      <Flex mb={3} mt={10} direction="row">
        <Text verticalAlign="center" fontSize="md" fontWeight="bold">Drafts</Text>
      </Flex>

      <VStack>
        <TableContainer width="100%">
          <Table variant='striped' colorScheme={metadata.themeColor} size="sm">
            <Thead>
              <Tr>
                <Th>Title</Th>
                <Th>Created</Th>
                <Th>Deadline</Th>
                <Th>Reward</Th>
                <Th>Status</Th>
                <Th></Th>
              </Tr>
            </Thead>
            <Tbody>
              {draftBounties?.map((bountyState, index) => {
                if (bountyState?.databaseId) {
                  return <BountyListItem action="edit" key={index} {...bountyState} themeColor={metadata.themeColor} />
                } else {
                  return <DummyItem key={index} />
                }
              })}
            </Tbody>
          </Table>
        </TableContainer>
      </VStack>
    </>
  )
}
