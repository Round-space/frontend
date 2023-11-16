/* eslint-disable @typescript-eslint/no-unused-vars, no-console */
import {
  Box, Button, Flex, HStack,
  Text,
  Tag,
  Link,
  Tooltip,
  Tr,
  Td,
} from "@chakra-ui/react";

import { useState, useEffect } from 'react';
import { fromUnixTime, formatDistance } from "date-fns";
import { truncateHash } from "../../lib/utils";
import { IBountyState } from "../../reducers/bounty/actions";
import { trim } from "../../utils/formatting";
import Blockies from "react-blockies";
import router from "next/router";
import { useAccount, useConnect } from "wagmi";
import { bountyHardStatus } from "../../utils/bountyStatus";
import { RootState, useAppSelector } from "../../reducers";

export function BountyListItem(props): JSX.Element {
  const bounty = props as IBountyState;
  const themeColor = props.themeColor;
  const dashboardState = useAppSelector((state: RootState) => { return state?.dashBoard; });
  
  const { board } = dashboardState;

  const deadline = bounty ? fromUnixTime(bounty.deadline) : null;

  const daysTillDeadline = bounty === null || bounty.deadline == 0 ? ''
    : formatDistance(deadline, new Date(), { addSuffix: true })


  const viewDetails = () => {
    router.push(`/bounty/${bounty.databaseId}`)
  }
  const editDraft = () => {
    router.push(`/dashboard/${board}/bounty/create/${bounty.databaseId}`)
  }

  const today = new Date();
  const formattedAmount = bounty.tokenAmount ? trim(bounty.tokenAmount.toString(), 6) : '';
  const submissions = bounty.submissions.length > 0 ? bounty.submissions : [];

  const [bountyStatus, setBountyStatus] = useState('');
  const [statusColor, setStatusColor] = useState('gray');
  const [contributors, setContributors] = useState([])

  const actionText = props.action.charAt(0).toUpperCase() + props.action.slice(1);
  const actionURL = props.action == "edit" ? editDraft : viewDetails;

  useEffect(() => {
    if (bounty) {
      const result = bountyHardStatus(bounty);
      // capitalize first letter
      setBountyStatus(result.charAt(0).toUpperCase() + result.slice(1));
      setStatusColor(result === 'new' || result === 'active' ? 'green' : 'gray');
      submissions.map((submission) => {
        setContributors(contributors => [...new Set([...contributors, submission.address])])
      })
    }
  }, [bounty])


  return (
    <Tr>
      <Td><Link onClick={viewDetails}>{bounty.name ? bounty.name : 'No Title'}</Link></Td>
      <Td>{formatDistance(Date.parse(bounty.creationDate), new Date(), { addSuffix: true })}</Td>
      <Td>{daysTillDeadline ? daysTillDeadline : "-"}</Td>
      <Td>{formattedAmount} {!formattedAmount ? '-' : bounty.tokenSymbol}</Td>
      <Td>
        <Tag size="sm" minWidth="fit-content" borderRadius="full" colorScheme={statusColor}>
          {bountyStatus}
        </Tag>
      </Td>

      { props.action == 'edit' ? <></> :
      <Td>
        <HStack mb={2}>
          {submissions && submissions.length == 0 ?
            (
              <Text color="gray.500" fontSize="smaller">No Contributors Yet</Text>
            ) :
            (contributors.map((contributor, index) => {
              if (index < 10) {
                return (
                  <Flex key={index} direction="row" align="center" >
                    <Tooltip label={contributor}>
                      <Box mr={-4} borderColor="gray.50" borderWidth={1} boxShadow="base" borderRadius="full" overflow="hidden">
                        <Blockies seed={contributor} size={5} />
                      </Box>
                    </Tooltip>
                  </Flex>
                )
              }
            }))
          }
        </HStack>
      </Td>
      }

      <Td><Button colorScheme={themeColor} size="xs" onClick={actionURL}>{actionText}</Button>
      </Td>
    </Tr>
  )
}