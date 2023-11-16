/* eslint-disable @typescript-eslint/no-unused-vars, no-console */
import {
  Button,
  Box,
  HStack,
  Flex,
  Link,
  Alert,
  AlertIcon,
  Spacer,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Avatar,
  Heading,
  Tag,
} from '@chakra-ui/react'


import Blockies from "react-blockies";
import { ExternalLinkIcon } from '@chakra-ui/icons';

import { RootState } from '../../reducers/index'
import { useSelector } from 'react-redux'

import { useRef, useState, useEffect, useCallback } from 'react'
// import BiWorld from 'react-icons/bi'

import { format, formatDistanceToNow, fromUnixTime } from 'date-fns'

import WorkspaceLinks from './WorkspaceLinks'

import { truncateHash } from "../../lib/utils";

import { gnosisPrefixes } from '../../constants/network';

import { useQueryEnsAvatar } from '../../hooks/useQueryEnsAvatar';

// import link icon from @chakra-ui/icons
import { LinkIcon } from "@chakra-ui/icons";
import { Banner } from './Banner';
import useVoting from '../../hooks/useVoting';
import { useBountyStatus } from '../../hooks/useBountyStatus';

import { QuillDeltaToHtmlConverter } from 'quill-delta-to-html';
import 'react-quill/dist/quill.snow.css';
import { useNetwork } from 'wagmi';


const DescriptionModal = function DescriptionModal({description}) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  return (
    <>
      <HStack spacing={4} mb={2} justifyContent="right">
        <Button size="xs" onClick={onOpen}>Read more...</Button>
      </HStack>

      <Modal isOpen={isOpen} onClose={onClose} scrollBehavior='inside'>
        <ModalOverlay />
        <ModalContent maxW="56rem" mx={5}>
          <ModalHeader>Description</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
          <Box 
            className='ql-editor' 
            dangerouslySetInnerHTML={{ __html: description }}
            sx={{
              "& h1": {
                fontSize: "2em"
              },
              "& h2": {
                fontSize: "1.5em"
              },
              "& h3": {
                fontSize: "1.17em"
              },
              "& h4": {
                fontSize: "1em"
              },
              "& h5": {
                fontSize: "0.83em"
              },
              "& h6": {
                fontSize: "0.67em"
              }
            }}
             />
          </ModalBody>

          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

// const ExcerptDescription = function ExcerptDescription(props) {
//   const [isTrimmed, setIsTrimmed] = useState(false);
//   const inputRef = useRef<HTMLInputElement>(null);
  
//   const text = props.text && Array.isArray(props.text) ? props.text.map((t, i) => {
//     if(t.type === 'p' && !t.props.children) {
//       return (<br key={i} />);
//     }
//     return t;
//   }) : null;
//   // console.log(text);

//   // after render hook
//   useEffect(() => {
//     if (inputRef.current) {
//       if(inputRef.current.scrollHeight > 20 + inputRef.current.offsetHeight) {
//         setIsTrimmed(true);
//       }
//     }
//   })
  
//   return (
//     <>
//       <Text as='div'
//         ref={inputRef}
//         fontSize="md"
//         noOfLines={10}
//         mb={5}>
//         {text}
//       </Text>
//       {isTrimmed && 
//       <DescriptionModal text={text} />
//       }
//     </>
//   )
// }

export default function BountyDetail(props): JSX.Element {
  const bountyState = useSelector((state: RootState) => { return state.bounties; });
  const themeColor = bountyState.bounty.themeColor ?? 'green';

  // const walletState = useSelector((state: RootState) => { return state.wallet; });
  // const createdBountyState = useSelector((state: RootState) => { return state.createBounty; });
  const creatorEnsAvatar = useQueryEnsAvatar( bountyState?.bounty?.creatorAddress );
  // const { votingState } = useVoting();
  const [copying, setCopying] = useState(false);
  const [creationDate, setCreationDate] = useState('');
  const bountyProgress = useBountyStatus();

  const { activeChain: chain } = useNetwork();
  const chainId = chain?.id;

  const descriptionRef = useRef<any>(null);
  const [hasMore, setHasMore] = useState(false);
                  
  const copyLinktoClipboard = useCallback(() => {
    setCopying(true);
    navigator.clipboard.writeText(props.shareLink);
    setTimeout(() => {
      setCopying(false);
    }, 500);

  },[props.shareLink])

  const [description, setDescription] = useState<any>(null);

  useEffect(() => {

    if(!bountyState.bounty.description) {
      return;
    }

    // check if bountyState.bounty.description is json or not
    let ops = [];
    try {
      const json = JSON.parse(bountyState.bounty.description);
      ops = json?.ops ? json.ops : [];
    } catch (e) {
      ops = bountyState.bounty.description?.split("\n").map((line) => ({ insert: line + "\n" }));  
    }
    

    const converter = new QuillDeltaToHtmlConverter(ops, {});
    const html = converter.convert();
    setDescription(html);

    
  }, [bountyState.bounty.description])

  useEffect(() => {
    if (bountyState.bounty?.creationDate) {
      setCreationDate(format(new Date(bountyState.bounty.creationDate), 'PP'));
    }
  }, [bountyState.bounty?.creationDate])

  useEffect(() => {
    if (descriptionRef.current) {
      if(descriptionRef.current.clientHeight > descriptionRef.current.parentElement.clientHeight + 10) {
        setHasMore(true);
      } else {
        setHasMore(false);
      }
    }
  }, [description])
  
  if (!bountyState.bounty)
    return (<></>);

  // const etherScanUrl = walletState.chainMeta ? walletState.chainMeta.info.explorer + '/tx/' : '';
  // const issueTx = bountyState.bounty.issueTxId == null ? '' : bountyState.bounty.issueTxId;
  // const fulfillTx = bountyState.bounty.fulfillTxId == null ? '' : bountyState.bounty.fulfillTxId;
  // const fulfillTxLink = etherScanUrl + fulfillTx;
  // const issueTxLink = etherScanUrl + issueTx;

  const awatingConfirmation = bountyState.waitingSubmissionConfirmation ||
    bountyState.waitingDrainConfirmation ||
    bountyState.isLoading ||
    bountyState.creating ||
    bountyState.waitingPayout;
  
  
  // let bountyProgress =
  //   (!bountyState.bounty.issueTxId && !bountyState.bounty.metadataUrl) ? 'draft' :
  //   (props.isPending || (bountyState.bounty.issueTxId && !bountyState.bounty.bountyId)) ? 'creating' :
  //       (!props.isExpired && !bountyState.bounty.isCompleted && bountyState.submissions.length == 0 && bountyState.creating) ? "active" :
  //         (!props.isExpired && !bountyState.bounty.isCompleted && bountyState.submissions.length == 0 && !awatingConfirmation) ? "active" :
  //           (!props.isExpired && !bountyState.bounty.isCompleted && bountyState.submissions.length == 0 && bountyState.waitingSubmissionConfirmation) ? "active" :
  //             (!props.isExpired && !bountyState.bounty.isCompleted && bountyState.submissions.length != 0 && !awatingConfirmation) ? "active" :
  //               (!props.isExpired && !bountyState.bounty.isCompleted && bountyState.submissions.length != 0 && bountyState.waitingSubmissionConfirmation) ? "active" :
  //                 (!props.isExpired && !bountyState.bounty.isCompleted && bountyState.submissions.length != 0 && bountyState.waitingPayout) ? "active" :
  //                   (!props.isExpired && bountyState.bounty.isCompleted && bountyState.bounty.drainTxId == null && !awatingConfirmation) ? "completed" :
  //                     (!props.isExpired && bountyState.waitingDrainConfirmation) ? "draining" :
  //                       (bountyState.bounty.isCompleted && bountyState.bounty.drainTxId != null) ? "cancelled" :
  //                         (props.isExpired) ? "expired" : "unknown";

  // bountyProgress = bountyProgress === 'active' ? (votingState === 0 ? 'active' : votingState === 1 ? 'Submissions on' : votingState === 2 ? 'Voting on' : 'Voting closed') : bountyProgress;
  
  
  
  const truncatedAccount = bountyState.bounty.creatorAddressEns ? bountyState.bounty.creatorAddressEns : truncateHash(bountyState.bounty.creatorAddress);
  
  
  

  const bountyProgressMetaInfo =

    // Bounty is in draft mode
    (bountyProgress == 'draft' || bountyProgress == 'unknown') ? 
    {
        status: "Draft",
        labelColor: "gray",
        bannerTitle: 'This Round is still being drafted.',
        bannerDescription: 'You cannot apply or submit a proposal for a Round until it has been launched.'
    } : 

    // Bounty is closed
    (bountyProgress == 'cancelled' || bountyProgress == 'completed' || bountyProgress == 'draining' || bountyProgress == 'expired') ?
    {
      status: "Closed",
      labelColor: "red",
      bannerTitle: 'This Round is now closed.',
      bannerDescription: 'You can no longer apply or submit a proposal towards a closed Round.'
    } :

    // Bounty is active
    {
      status: "Active",
      labelColor: "green",
      bannerTitle: 'This Round is active.',
      bannerDescription: 'You can apply or submit a proposal for this Round.'
    }
  
  return (
    <Box fontWeight='500'>
      <Banner status={bountyProgressMetaInfo.status} title={bountyProgressMetaInfo.bannerTitle} description={bountyProgressMetaInfo.bannerDescription} /> 
      
      { props.isPending && !!bountyState.bounty.gnosis &&  
          <Alert status='info' colorScheme="orange" rounded="xl">
            <AlertIcon />
            <Text>
            This Round will be Active once Safe transaction is approved. {' '}
            
            <Link href={`https://app.safe.global/transactions/queue?safe=${gnosisPrefixes[chainId] ?? 'eth'}:${bountyState.bounty.gnosis}`} target='_blank'>
              (Go To Safe <ExternalLinkIcon mx='2px' />)</Link>
            </Text>
          </Alert>
      }

      {/* <Flex mt={3}>
        <Link href={`/board/${bountyState.bounty.creatorAddressEns ? bountyState.bounty.creatorAddressEns : bountyState.bounty.creatorAddress}`}>
          <HStack bgColor="gray.50" px={3} py={1} borderRadius="3xl">
            {creatorEnsAvatar ? <Avatar size="2xs" src={creatorEnsAvatar} /> : 
              <Box borderRadius="20px" overflow="hidden">
                <Blockies seed={truncatedAccount.toLowerCase()} size={4} scale={4}
                  onClick={props.onClick} />
              </Box>
            }
            <Text fontSize="sm">{truncatedAccount}</Text>
          </HStack>
        </Link>
        {props.children}
      </Flex> */}

      <HStack alignItems="flex-start" mt="3" justify="space-between">
        <Heading as="h1" fontSize="2xl" py={1} fontWeight="800">
          {bountyState.bounty.name ? bountyState.bounty.name : 'No Title'}
        </Heading>
        <Button size="xs" p="4" rounded="full" isLoading={copying} onClick={copyLinktoClipboard} fontSize='sm'><LinkIcon mr="2" /> <span>Copy <Text display={{base: 'none', md: 'unset'}}>Link</Text></span></Button>
      </HStack>

      <Flex gap="2" mt="2">
        <Tag borderRadius='full' colorScheme={bountyProgressMetaInfo.labelColor} fontSize='10' fontWeight='800'>{bountyProgress.toLocaleUpperCase()}</Tag>
        {/* <Text fontSize='sm' textDecoration='underline'>
          Created {creationDate}
        </Text> */}
      </Flex>
      
      
      <Box mt="2">
        <Box maxH={'25rem'} overflow='hidden'>
          {/* <Text fontSize="xl" lineHeight="short" fontWeight="800" mb="3">Description</Text> */}
          <Box 
            ref={descriptionRef} 
            className='ql-editor'
            dangerouslySetInnerHTML={{ __html: description }} 
            sx={{
              "& h1": {
                fontSize: "2em"
              },
              "& h2": {
                fontSize: "1.5em"
              },
              "& h3": {
                fontSize: "1.17em"
              },
              "& h4": {
                fontSize: "1em"
              },
              "& h5": {
                fontSize: "0.83em"
              },
              "& h6": {
                fontSize: "0.67em"
              }
            }}
            />
          {/* <ExcerptDescription text={description ? description : 'No Description'} /> */}
        </Box>
        { hasMore ?
          <DescriptionModal description={description} />
          : <></>
        }
      </Box>

      
      { bountyState.bounty.url  && 
        <Box mt="2">
          <Text fontSize="md" lineHeight="short" fontWeight="700" mb="3">Links:</Text>
          <WorkspaceLinks url={bountyState.bounty.url} />
        </Box>
      }
    </Box>
  )
}
