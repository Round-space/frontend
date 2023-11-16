/* eslint-disable @typescript-eslint/no-unused-vars, no-console */
import {
    Button,
    Stack,
    Input,
    FormControl,
    FormLabel,
    Box,
    VStack,
    Flex,
    Textarea,
    Heading,
    useColorModeValue,
    Text,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    Tooltip,
    useToast
  } from '@chakra-ui/react'
  import { useAppDispatch, RootState } from '../../reducers/index'
  import { submitBountyMetaFulfillment } from '../../reducers/bounty/asyncActions'
  import {
    // setConnectingWallet,
    // WalletTypeEnum,
    setConnectingError
  } from '../../reducers/wallet/state'
  import { walletconnect } from '../../lib/connectors'
  import { useSelector } from 'react-redux'
  import { useAccount, useConnect, useSigner } from 'wagmi'
  import { useEffect, useRef, useState } from 'react'
  import { trim } from '../../utils/formatting'
  import { assertDirective } from 'graphql'
  import { useNetwork } from 'wagmi'
import { moralisAuthentication } from '../../lib/utils'
import { useMoralis } from 'react-moralis'
import useVoting from '../../hooks/useVoting'
// load quil editor dynamically
import dynamic from 'next/dynamic';
const QuillEditor = dynamic(() => import('./QuillEditor'), { ssr: false });
let nextAction = null;

  // const fields = {
  //   description: 'Description',
  //   // contact: 'Contact Info'
  // }
  
  export default function BountySubmissionForm(props ): JSX.Element {
  
  
    const dispatch = useAppDispatch();
    const [workDescription, setWorkDescription] = useState('')
    const [email, setEmail] = useState('')
    const [workLink, setWorkLink] = useState('')
    const fileInput = useRef(null);
    const { votingState } = useVoting();
    const { isConnected: connected, connectors, connectAsync: connect } = useConnect()
    const connectorInjected = connectors?.[0];
    const { data: accountData } = useAccount();
    const account = accountData?.address
    const isWalletConnect = accountData?.connector?.id === "walletConnect"
    const { activeChain: chain } = useNetwork()
    const chainId = chain?.id;
    
    const { data: signer } = useSigner();

    const bountyState = useSelector((state: RootState) => { return state.bounties; });
    const { onOpen, isOpen, onClose } = useDisclosure();
  
    const themeColor = bountyState?.bounty.themeColor;

    const [invalidity, setInvalidity] = useState({
      description: '',
      contact: '',
      // workLink:'',
      // date:''
    });

    const {
      user,
      authenticate,
      isAuthenticated
    } = useMoralis();

    const toast = useToast();

    const handleSubmitClick = async (e) => {
      e.preventDefault();
      
      let isValid = true;

      // check if fields are empty
      // Object.keys(fields).forEach(fieldName => {
      //   const field = document.querySelector(`form [name="${fieldName}"]`) as HTMLInputElement;
      //   if (field?.value?.length === 0) {
      //     // set it to display the error
      //     setInvalidity({...invalidity, [fieldName]: `Please fill out a ${fields[fieldName]}`});
      //     isValid = false;
      //   }
      // })

      // check if description is empty
      if (!workDescription?.length) {
        setInvalidity({...invalidity, description: 'Please fill out a description'});
        isValid = false;
      }

      // check if contact is a valid email
      const contact = document.querySelector('form [name="contact"]') as HTMLInputElement;
      if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(contact.value)) {
        setInvalidity({...invalidity, contact: 'Please enter a valid email'});
        isValid = false;
      }
      // const link = document.querySelector('form [name="link"]') as HTMLInputElement;
      // if(!link?.value.match(/^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/)) {
      //   setInvalidity({...invalidity, workLink: 'Please enter a valid link'});
      //   isValid = false;
      // }
      
      // atleast one of the field was invalid so not processing further
      if (!isValid) {
        return;
      }

      const res = await moralisAuthentication( authenticate, isAuthenticated, user, account, toast, isWalletConnect, chainId )
      if(!res) {
        return;
      }
      
      if (account && signer && bountyState.bounty) {
        const submissionData = { email: email, workDescription: workDescription, workLink: workLink, date: new Date().toString(), fileRef: fileInput, account: account, bountyId: bountyState.bounty.bountyId };
        await submitBountyMetaFulfillment(dispatch, submissionData, signer, chainId);
      }
      onClose();
    }

    const connectErrorHandler = (err : Error)=>{
      if(err == null || err === undefined)
      return;
      // DAPP automatically pushes a notification which can be retrieved with useNotification() hook
      dispatch(setConnectingError(err))
    }
    
    const handleClaim = async () => {
      
      if( connected ) onOpen();
      else {
        // dispatch(setConnectingWallet(WalletTypeEnum.MetaMask))
        nextAction = 'open';
        console.log('setting Next Action', 'open');
        connect(connectorInjected);
      }
    }

    useEffect(() => {
      if(connected) {
        
          if(nextAction === 'open') {
            console.log('attemping to open ');
            onOpen();
          }
        
        nextAction = null;
      }
    }, [connected])
    const buttonText = 'Submit Proposal';
    const colorMode = useColorModeValue('gray.500', 'gray.50');

    if (!bountyState.bounty)
      return (<></>);

  const awatingConfirmation = bountyState.waitingSubmissionConfirmation ||
    bountyState.waitingDrainConfirmation ||
    bountyState.isLoading ||
    bountyState.creating ||
    bountyState.waitingPayout;
  
  const primaryBountyAction =
    // (!bountyState.bounty.issueTxId && !bountyState.bounty.metadataUrl) ? 'Draft' :
      (!props.isExpired && !bountyState.bounty.isCompleted && bountyState.submissions.length == 0 && bountyState.creating) ? "Submit Proposal" :
        (!props.isExpired && !bountyState.bounty.isCompleted && bountyState.submissions.length == 0 && !awatingConfirmation) ? "Submit Proposal" :
          (!props.isExpired && !bountyState.bounty.isCompleted && bountyState.submissions.length == 0 && bountyState.waitingSubmissionConfirmation) ? "Submit Proposal" :
            (!props.isExpired && !bountyState.bounty.isCompleted && bountyState.submissions.length != 0 && !awatingConfirmation) ? "Submit Proposal" :
              (!props.isExpired && !bountyState.bounty.isCompleted && bountyState.submissions.length != 0 && bountyState.waitingSubmissionConfirmation) ? "Submit Proposal" :
                (!props.isExpired && !bountyState.bounty.isCompleted && bountyState.submissions.length != 0 && bountyState.waitingPayout) ? "Submit Proposal" :
                  (!props.isExpired && bountyState.bounty.isCompleted && bountyState.bounty.drainTxId == null && !awatingConfirmation) ? "Completed" :
                    (!props.isExpired && bountyState.waitingDrainConfirmation) ? "Draining" :
                      (bountyState.bounty.isCompleted && bountyState.bounty.drainTxId != null) ? "Cancelled" :
                        (props.isExpired) ? "Expired" : "Unknown Status";  
  
    const disableEditButton = bountyState.waitingDrainConfirmation || bountyState.waitingPayout || bountyState.waitingSubmissionConfirmation || bountyState.creating || bountyState.bounty.isCompleted || props.isExpired;
    const isCompleted = bountyState.bounty != null && bountyState.bounty.isCompleted;
  
    const formattedAmount = bountyState.bounty.tokenAmount ? trim(bountyState.bounty.tokenAmount.toString(), 6) : '';
    
    return (
      <>
          <Button 
            colorScheme={themeColor} 
            disabled={disableEditButton || votingState > 1} 
            onClick={handleClaim} 
            width="100%" mb="4">{primaryBountyAction}</Button>
         <Modal isOpen={isOpen} onClose={onClose} size="5xl"> 
         <ModalOverlay bg='none' backdropFilter='blur(8px)' backdropBlur='5px'/>
         <ModalContent borderWidth="2px" borderRadius="2xl" p={3}>
           <ModalHeader>Submit Proposal</ModalHeader>
           <ModalCloseButton />
           <ModalBody>

        <Box textAlign="center">
          {/* <Stack mb="10px">
            <Heading size="sm">
              Submit to earn {bountyState.bounty.tokenAmount} {bountyState.bounty.tokenSymbol}
            </Heading>
          </Stack> */}
          <form onSubmit={ handleSubmitClick }>
            <FormControl id="submitterEmail">
              <FormLabel fontSize="sm" mb={0}>Email address</FormLabel>
              <Tooltip label={invalidity.contact} placement='right' isOpen={invalidity.contact.length > 0} >
                <Input type="text" 
                placeholder="Email Address" 
                name="contact" 
                isInvalid={invalidity.contact.length > 0}
                errorBorderColor='red.300'
                onChange={(event) => { setInvalidity({...invalidity, contact: ''}); setEmail(event.target.value)}} />
              </Tooltip>
            </FormControl>
            <FormControl id="workDescription" mt={3}>
              <FormLabel fontSize="sm" mb={1}>Description</FormLabel>
              <Tooltip label={invalidity.description} placement='right' isOpen={invalidity.description.length > 0} >
                <Box 
                    sx={{
                      '& .quill': {
                        borderColor: 'gray.200',
                        borderWidth: '1px',
                        borderRadius: 'lg',
                      },
                      '& .ql-toolbar': {
                        borderBottomColor: 'gray.200',
                      }
                    }}
                    border={invalidity?.description ? '1px solid red' : 'none'} 
                    borderRadius='md'
                    >
                  <QuillEditor
                    value=''
                    // name="description"
                    // isInvalid={invalidity.description.length > 0}
                    // errorBorderColor='red.300'
                    // placeholder="Add details about your submission"
                    // mt={-1}
                    // rows={5}
                    // shadow="sm"
                    onChange={(event) => { setInvalidity({...invalidity, description: ''}); setWorkDescription(event.target.value); }}
                  />
                </Box>
              </Tooltip>
            </FormControl>
            <FormControl id="workLink" mt={3}>
            <FormLabel  mb={0} fontSize="sm">URL</FormLabel>
              {/* <Tooltip label={invalidity.workLink} placement='right' isOpen={invalidity.workLink.length > 0} > */}
              <Input type="text" 
                placeholder="Add a Link to your work (Optional)" 
                name="link" 
                // isInvalid={invalidity.workLink.length > 0}
                errorBorderColor='red.300'
                onChange={(event) => { 
                  // setInvalidity({...invalidity, workLink: ''}); 
                  setWorkLink(event.target.value)
                  }} />
              {/* </Tooltip> */}
            </FormControl>
            <FormControl mt={3}>
            <FormLabel  mb={0} fontSize="sm">Attachments</FormLabel>

              <Flex
                mt={1}
                justify="center"
                px={6}
                pt={5}
                pb={6}
                borderWidth={1}
                rounded="md"
              >
                <VStack spacing={1} textAlign="center">
                  <input id="file-upload" name="file-upload" type="file" placeholder="text" ref={fileInput} />
                  <Text
                    fontSize="xs"
                    color={colorMode}
                  >
                  </Text>
                </VStack>
              </Flex>
            </FormControl>
            <Button
              mt="20px"
              colorScheme={themeColor}
              disabled={disableEditButton} 
              isLoading={!!bountyState.waitingSubmissionConfirmation}
              loadingText={bountyState.waitingSubmissionConfirmation}
              type="submit">
              {buttonText}
            </Button>
          </form>
        </Box>
         </ModalBody>
         </ModalContent>
         </Modal>
      </>

    )
  }
  