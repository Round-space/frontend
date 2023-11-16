/* eslint-disable @typescript-eslint/no-unused-vars, no-console */
import {
  Stack,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Center,
  Flex,
  Input,
  InputGroup,
  InputRightAddon,
  Tag,
  TagLabel,
  TagRightIcon,
  HStack,
  VStack,
  Button,
  Box,
  Code,
  Icon,
  Spacer,
  Text,
  Link,
  useDisclosure,
  Tooltip,
  Avatar,
  Image,
  Badge,
  Checkbox,
  IconButton,
  Spinner
} from '@chakra-ui/react'
import { FaThumbsUp } from 'react-icons/fa';
import Blockies from "react-blockies";
import { AttachmentIcon, ExternalLinkIcon } from '@chakra-ui/icons'
import { IoMdTrophy } from "react-icons/io";
import { BsFillArrowDownSquareFill } from "react-icons/bs"
import { useEffect, useState, useRef } from 'react'
import { truncateHash } from '../../lib/utils'

import WaitingPanel from './WaitingPanel';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { useQueryEnsName } from '../../hooks/useQueryEnsName';
import { useQueryEnsAvatar } from '../../hooks/useQueryEnsAvatar';
import useVoting from '../../hooks/useVoting';
import { QuillDeltaToHtmlConverter } from 'quill-delta-to-html';
import 'react-quill/dist/quill.snow.css';

const SubmissionUpdate = (props) => {
  const [accepting, setAccepting] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [email, setEmail] = useState('')

  // const [address, setAddress] = useState('')
  const [description, setDescription] = useState('')
  const [link, setLink] = useState('')
  const [date, setDate] = useState('');
  const [attachmentUrl, SetAttachmentUrl] = useState('')
  // const [createdDate, setCreatedDate] = useState('')
  const [amount, setAmount] = useState<string>()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [attachmentName, SetAttachmentName] = useState('')
  const { batchSubmissions, setBatchSubmissions, submissionId, objectId } = props;
  
  const cancelRef = useRef();
  const handleAcceptSubmissionClick = async () => {
    try {
      setAccepting(true)
      onClose();
      props.onAcceptSubmission({
        address: props.address,
        bountyId: props.bountyId,
        fulfillmentId: props.fulfillmentId,
        tokenAmount: amount,
        data: props.ipfsHash,
        submissionIndex: props.submissionId
      })
    } catch (e) {
      console.log(e)
    }
    setAccepting(false)
  }
  const handleTokenAmount = (e) => {
    let value = e.target.value;
    if(parseFloat(value) >= 0) {
      if (value > props.tokenRemainAmount) value = props.tokenRemainAmount;
      setAmount(value);
    } else {
      setAmount(null);
    }
  }
  // const [ensName, setEnsName] = useState(null);

  const ensName = useQueryEnsName( props?.address )
  const ensAvatar = useQueryEnsAvatar( props?.address )

  // useEffect(() => {
  //   if(props?.address) {
  //       fetchEnsName({
  //           address: props.address
  //       }).then((res) => {
  //           setEnsName(res)
  //       });
  //   }
  // }, [props?.address])
  // const { data: ensName } = useEnsName({
  //   address: props.address,
  //   enabled: !!props.address,
  //   cacheTime: 1000 * 60 * 60
  // })
  const truncated = truncateHash(props?.address);
  const ensOrAddress = ensName ? ensName : truncated;
  const { votingState, votingAllowed, castVote, votes, myVote, isVoting } = useVoting();
  const votesCount = votes?.[objectId] ?? 0;

  const modal = (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Do you want to confirm payment to {ensOrAddress}?
          </AlertDialogHeader>

          <AlertDialogBody>
            <VStack>
              <Box>
                <InputGroup>
                  <Input 
                    htmlSize={1} 
                    borderRadius="3xl" 
                    type="number" 
                    placeholder={props.tokenRemainAmount} 
                    onInput={handleTokenAmount} 
                    value={amount ?? ''} 
                    min={0.0}
                    max={props.tokenRemainAmount}
                    width="xs"
                  />
                  
                  <InputRightAddon borderRadius="3xl" position="relative">
                    <Badge 
                      onClick={()=>setAmount(props.tokenRemainAmount)} 
                      position="absolute" 
                      right="110%"
                      zIndex={1}
                      cursor="pointer">Max</Badge>
                    {props.tokenSymbol}
                  </InputRightAddon>
                  
                </InputGroup>
              </Box>
              <Box>
                <Icon as={BsFillArrowDownSquareFill} w={8} h={8} fill="gray.500" />
              </Box>
              <Box>
                <HStack bgColor="gray.200" px={3} py={2} borderRadius="3xl">
                  {ensAvatar ? <Avatar size="sm" src={ensAvatar} /> : 
                    <Box borderRadius="20px" overflow="hidden">
                      <Blockies seed={props?.address?.toLowerCase()} size={5} scale={5}
                        onClick={props.onClick} />
                    </Box>
                  }
                  <Tooltip label={props.address} width="fit-content">
                  <Text fontSize="lg" fontWeight="bold" color="gray.600">{ensOrAddress}</Text>
                  </Tooltip>
                </HStack>
              </Box>
            </VStack>
            <Center mt={5}>
              Clicking Reward will initiate a transaction dialog.
            </Center>
          </AlertDialogBody>

          <AlertDialogFooter justifyContent="center">
            <Button colorScheme={props.themeColor} isDisabled={ !amount || !parseFloat(amount) } onClick={handleAcceptSubmissionClick} mr={3}>
              Reward
            </Button>
            <Button colorScheme="gray" ref={cancelRef} onClick={onClose}>
              Cancel
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  )

  const fetchIpfsDetails = async () => {
    setIsReady(false)
    const ipfsUrl = `https://gateway.moralisipfs.com/ipfs/${props.ipfsHash}/submission.json`
    
    try {
      const response = await fetch(ipfsUrl)
      const ipfsDetails = await response.json()
      
      // console.log(ipfsDetails);

      if (ipfsDetails?.payload) {
        if (ipfsDetails.payload?.sourceFileName && ipfsDetails.payload?.sourceFileHash) {
          SetAttachmentUrl(
            `https://gateway.moralisipfs.com/ipfs/${ipfsDetails.payload.sourceFileHash}/${ipfsDetails.payload.sourceFileName}`
          )
          
          SetAttachmentName(ipfsDetails.payload.sourceFileName)
        }
        const fulfiller =
          ipfsDetails.payload.fulfillers.length > 0
            ? ipfsDetails.payload.fulfillers[0]
            : { email: 'Unknown', address: '' }
        setEmail(fulfiller.email)
        
        // parse description into rich text
        let ops = [];
        try {
          const json = JSON.parse(ipfsDetails.payload.description);
          ops = json?.ops ? json.ops : [];
        } catch (e) {
          ops = ipfsDetails.payload.description?.split("\n").map((line) => ({ insert: line + "\n" }));  
        }
        

        const converter = new QuillDeltaToHtmlConverter(ops, {});
        const html = converter.convert();
        
        setDescription(html);

        setLink(ipfsDetails.payload.link)
        dayjs.extend(relativeTime)
        setDate(ipfsDetails.payload.date);
      }
    } catch (err) {
      console.log('Something failed getting data from ', ipfsUrl, err)
    }
    setIsReady(true)
  }

  useEffect(() => {
    if(props.ipfsHash) {
      fetchIpfsDetails()
    }
  }, [props.ipfsHash])

  if (!isReady) {
    return (<WaitingPanel />);
  }

  const showAttachments = props.isOwner && attachmentUrl && attachmentName;
  // const addressName = ensName != null ? ensName : props?.address;
  const color = props.isAccepted ? 'green' : '#E2E8F0';
  const avatarDimensions = "20px"

  

  return (
    <Box mb={8} fontWeight='500'>
      {/* <SimpleGrid columns={2} spacing={5} width="100%" verticalAlign="center" mb={3} p={2} border="2px" borderRadius="10px" borderColor={color}> */}
      <Flex w='100%'>
        <Box w='100%'>
          {/* <Tooltip hasArrow placement="right" label={"Address: " + props.address}> */}
          <Stack direction={{ base: 'column', md: 'row'}}>
              <Box width={avatarDimensions} height={avatarDimensions} borderRadius="20px" overflow="hidden">
                {ensAvatar ? <Image width={avatarDimensions} height={avatarDimensions} src={ensAvatar} /> : 
                  <Blockies seed={props?.address?.toLowerCase()} size={8} scale={4} onClick={props.onClick}></Blockies>
                }
              </Box>
            
            <Box fontSize="md" lineHeight="large">
              <Text><Text fontWeight='800' as='span'>{ensOrAddress}</Text> submitted a proposal               {props.isAccepted ?
              <Tag rounded="full" variant="outline" size='md'>
                🏆
              </Tag> : ""}</Text>

              {date && <Text fontSize='xs' color='GrayText' align='left' flexGrow={1}>{dayjs(date).fromNow()}</Text>}
            </Box>
            <Spacer/>

            <Box>
                {props.isOwner && props.batchMode && (votingState === 0 || votingState === 3) ? 
                <VStack fontSize="sm" justifySelf="right" mb={{ base: 4, md: 0 }}>
                  <HStack align='stretch'>
                    <VStack>
                    <Text><b>Reward</b></Text>
                    <Checkbox
                      flexGrow={1}
                      isChecked={ Object.prototype.hasOwnProperty.call(batchSubmissions, submissionId) }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setBatchSubmissions({...batchSubmissions, [submissionId]: null})
                        } else {
                          delete batchSubmissions[submissionId]
                          setBatchSubmissions({...batchSubmissions})
                        }
                      }}
                    />
                    </VStack>
                    <VStack>
                      <Text><b>Reward Amount</b></Text>
                      
                        <InputGroup size='sm'>
                          <Input 
                            isDisabled={ !Object.prototype.hasOwnProperty.call( batchSubmissions, submissionId)}
                            htmlSize={1} 
                            borderRadius="3xl" 
                            type="number" 
                            placeholder={props.tokenRemainAmount} 
                            onInput={(e) => {
                              setBatchSubmissions({...batchSubmissions, [submissionId]: e.target['value']})
                            }} 
                            value={ batchSubmissions[submissionId] || '' }
                            min={0.0}
                            // max={props.tokenRemainAmount}
                            
                          />
                          
                          <InputRightAddon borderRadius="3xl" position="relative">
                            {/* <Badge 
                              // onClick={()=>setAmount(props.tokenRemainAmount)} 
                              position="absolute" 
                              right="110%"
                              zIndex={1}
                              cursor="pointer">Max</Badge> */}
                            {props.tokenSymbol}
                          </InputRightAddon>
                          
                        </InputGroup>
                      
                    </VStack>
                  </HStack>
                  { props.limitError && batchSubmissions[submissionId] && <Text color='red.500' fontSize='xs'>Total Reward amount exceeds limit</Text> }
                </VStack>
                :
                  <VStack textAlign="right" justifyContent='space-between'>
                    { votingState > 1 && 
                      <HStack>
                        { votingAllowed === null  ? <Spinner /> : <IconButton 
                        
                        icon={ <FaThumbsUp />} 
                        size="sm" 
                        isDisabled={ votingState > 2 } 
                        
                        color={ myVote === objectId ? "green" : "gray.300" }
                        variant="outline"
                        isLoading={isVoting}
                        onClick={() => {
                          castVote(objectId);
                        }}
                        aria-label='Vote' /> }
                        <Text>{votesCount}</Text>
                      </HStack>
                    }
                  </VStack>
                }
                  {modal}
                </Box>
            
            <Spacer />
            { props.isOwner && (votingState === 0 || votingState === 3 ) && <Button
                      display={props.batchMode ? "none" : "inherit"}
                      alignSelf="end"
                      size="sm"
                      isDisabled={!props.enableButtons || accepting}
                      colorScheme={props.themeColor}
                      variant="solid"
                      onClick={onOpen}>
                      Reward
                    </Button> }


          </Stack>
          {/* </Tooltip> */}
        </Box>
      </Flex>
      

      {props.isOwner || props.viewPublic ? (
        <>

          <Spacer py={2} />
          <Box py={3} px={3} mb={{ base: 0, md: 14}} borderWidth="thin" borderRadius="xl" width="100%">
          {props.isOwner && <Text fontSize="sm"><b>Contact Email:</b> {email}</Text>}

            <Box order={{ base: 1, md: 0}}>
              <Text fontSize="sm" fontWeight="700" mb='3'>Proposal Details</Text>
              <Box className='ql-editor' dangerouslySetInnerHTML={{ __html: description }} 
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
              
              {link && (
                <>
                  <Spacer py={2} />
                  <Text fontSize="sm" fontWeight="700">Link</Text>
                  <Link fontSize="sm" href={link}>{link}</Link>
                </>
              )}
              

              {showAttachments ? (
                <>
                <Spacer py={2} />
                  <Text fontSize="sm" fontWeight="700">Attached File</Text>
                  <Link href={attachmentUrl} isExternal>
                    <Button
                      leftIcon={<AttachmentIcon />}
                      variant="outline"
                      colorScheme="green"
                      size="xs"
                    >
                      {attachmentName}
                    </Button>
                  </Link>
                </>
              ) : ''
              }
            </Box>

                <Spacer display={{ base: 'none', md: 'unset'}}/>

          </Box>
        </>

      ) : ('')}
    </Box>
  )
}

export default SubmissionUpdate
