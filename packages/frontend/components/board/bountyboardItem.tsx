/* eslint-disable @typescript-eslint/no-unused-vars, no-console */
import {
  Box, Button, Flex, HStack,
  Spacer,
  Text,
  Tag,
  Tooltip,
} from "@chakra-ui/react";
import { useState, useEffect } from 'react';
import { utils, constants } from 'ethers';
import { fromUnixTime, formatDistance } from "date-fns";
import { truncateHash } from "../../lib/utils";
import { IBountyState } from "../../reducers/bounty/actions";
import { RootState, useAppSelector } from '../../reducers'
import { trim } from "../../utils/formatting";
import Blockies from "react-blockies";
import router from "next/router";
import { useAccount, useConnect } from "wagmi";
import { bountyHardStatus } from "../../utils/bountyStatus";
import striptags from "strip-tags";
import { QuillDeltaToHtmlConverter } from 'quill-delta-to-html';
const Excerpt = ({ content, length }) => {
  let html = '';
  try {
    const json = JSON.parse(content);
    const converter = new QuillDeltaToHtmlConverter(json?.ops, {});
    html = converter.convert();
    
  } catch (e) {
    const ops = content?.split("\n").map((line) => ({ insert: line + "\n" }));
    const converter = new QuillDeltaToHtmlConverter(ops, {});
    html = converter.convert();
    
  }
  const sanitizedContent = striptags(html);
  const excerpt = sanitizedContent.length > length
    ? sanitizedContent.substring(0, length) + "..."
    : sanitizedContent;

  return <div dangerouslySetInnerHTML={{ __html: excerpt }} />;
};

export function BountyBoardItem(props): JSX.Element {
  const bounty = props as IBountyState;
  const themeColor = props.themeColor;
  const [actionText, setActionText] = useState("View");
  const { data: accountData } = useAccount();
  const account = accountData?.address
  const { isConnected: connected } = useConnect();
  const ensCreator = '';

  const deadline = bounty ? fromUnixTime(bounty.deadline) : null;

  const daysTillDeadline = bounty === null || bounty.deadline == 0 ? ''
    : formatDistance(deadline, new Date(), { addSuffix: true })

  //const visitors = Math.abs(Math.floor(Math.random() * 100) - 1)

  const etherScanUrl = 'https://rinkeby.etherscan.io/tx/';
  let completeUrl = '';
  if (bounty && bounty.fulfillTxId) {
    completeUrl = etherScanUrl + bounty.fulfillTxId
  }

  if (bounty && bounty.drainTxId) {
    completeUrl = etherScanUrl + bounty.drainTxId
  }

  const onWorkClick = () => {
    router.push(`/round/${bounty.databaseId}`)
  }

  const today = new Date();
  const isExpired = today >= deadline;
  const formattedAmount = bounty.tokenAmount ? trim(bounty.tokenAmount.toString(), 6) : '';
  const truncatedAccount = bounty.creatorAddressEns ? bounty.creatorAddressEns : truncateHash(bounty.creatorAddress);
  const submissions = bounty.submissions.length > 0 ? bounty.submissions : [];
  const isActive = bounty.isCompleted === false && isExpired === false
  // const activeState = bounty.bountyId ? (isActive ? "Active" : "Closed") : "Draft"; 
  // const activeColor = bounty.bountyId ? (isActive ? "green" : "gray") : "yellow";
  const [bountyStatus, setBountyStatus] = useState('');
  const [statusColor, setStatusColor] = useState('gray');

  useEffect(() => {
    const result = bountyHardStatus(bounty);
    // capitalize first letter
    setBountyStatus(result.charAt(0).toUpperCase() + result.slice(1));
    setStatusColor(result === 'new' || result === 'active' ? 'green' : 'gray');
  }, [bounty])
  

  useEffect(() => {
    if(connected && bounty.creatorAddress) {
      const isOwner = utils.getAddress(bounty.creatorAddress || constants.AddressZero) === utils.getAddress(account || constants.AddressZero);
      setActionText(!isOwner && isActive ? 'Claim' : 'View');
    }
  }, [connected, account, bounty.creatorAddress])

  return (
    <Flex direction="column" borderRadius="xl" borderWidth="thin" boxShadow="base" p={6} >
      {/* Bounty title is the first line of the text area */}
      <Flex direction="row">
        <Box>
          <Box fontSize="xl"
            fontWeight="extrabold" color="gray.600" lineHeight="shorter" letterSpacing="tight" cursor="pointer" onClick={onWorkClick}
          >
            {bounty.name ? bounty.name : 'No Title'}
          </Box>

          {/* Bounty description is the second+ line of the text area */}
          <Box
            fontSize="md"
            noOfLines={1}
            mb={2} >
            {bounty.description ? 
            <Excerpt content={bounty.description} length={100} />
             : 'No Description'}
          </Box>
        </Box>
        <Spacer />
        <Tag height="fit-content" minWidth="fit-content" borderRadius="full" colorScheme={statusColor}>
          {bountyStatus}
        </Tag>
      </Flex>
      <Spacer my={1} />

      <Flex direction="row" justify="space-between" align="center"  >
        <HStack mb={2}>
          {submissions && submissions.length == 0 ?
            (
              <Text mr={-10} color="gray.300" fontSize="smaller">No Contributors Yet</Text>
            ) :
            (submissions.map((submission, index) => {
              if (index < 10) {
                return (
                  <Flex key={index} direction="row" align="center" >
                    <Tooltip label={submission.address}>
                      <Box mr={-5} borderColor="gray.200" boxShadow="base" borderWidth={2} borderRadius="full" overflow="hidden">
                        <Blockies seed={submission.address} size={10} />
                      </Box>
                    </Tooltip>
                  </Flex>
                )
              }
            }))
          }
        </HStack>

      </Flex>
      <Spacer my={1} />

      <HStack>
        <Box
          height="fit-content"
          width="50%"
        >
          <Text fontSize="x-small">Reward</Text>
          <Text fontWeight="extrabold" fontSize="2xl" color="gray.600" lineHeight="shorter" letterSpacing="tight">
            {formattedAmount} {bounty.tokenSymbol}
          </Text>
        </Box>

        <Box
          height="fit-content"
          width="50%"
        >
          <Text fontSize="x-small">Deadline</Text>
          <Text fontWeight="extrabold" fontSize="2xl" color="gray.600" lineHeight="shorter" letterSpacing="tight" textTransform="capitalize">
            {/* {isActive ? "Due " : "Due "}  */}
            {daysTillDeadline ? daysTillDeadline : "-"}
          </Text>
        </Box>
      </HStack>
      <Spacer my={2} />
      <Button minWidth="fit-content" colorScheme={themeColor} onClick={onWorkClick}>{actionText}</Button>


    </Flex >
  )
}