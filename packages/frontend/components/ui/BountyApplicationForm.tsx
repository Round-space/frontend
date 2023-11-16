/* eslint-disable @typescript-eslint/no-unused-vars, no-console */
import {
    Button,
    Input,
    FormControl,
    FormLabel,
    Box,
    Textarea,
    useColorModeValue,
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
  import { submitBountyApplication } from '../../reducers/bounty/asyncActions'
  import { useSelector } from 'react-redux'
  import { useAccount, useConnect, useSigner } from 'wagmi'  
  import { useState } from 'react'
  import { useNetwork } from 'wagmi'
  import { moralisAuthentication } from '../../lib/utils'
  import { useMoralis } from 'react-moralis'
  // load quil editor dynamically
  import dynamic from 'next/dynamic';
  const QuillEditor = dynamic(() => import('./QuillEditor'), { ssr: false });

  // const fields = {
  //   // description: 'Description',
  //   // contact: 'Contact Info'
  // }
  
  export default function BountyApplicationForm(props ): JSX.Element {
  
    const dispatch = useAppDispatch();
    const [description, setDescription] = useState('')
    const [email, setEmail] = useState('')
    const { isConnected: connected } = useConnect()
    const { data: accountData } = useAccount();
    const account = accountData?.address
    const isInjected = accountData?.connector?.id === 'injected'
    const { activeChain: chain } = useNetwork();
    const chainId = chain?.id;
    const [applying, setApplying] = useState(false);
    const { data: signer } = useSigner();
    const bountyState = useSelector((state: RootState) => { return state.bounties; });
    const { onOpen, isOpen, onClose } = useDisclosure();
    
    const [invalidity, setInvalidity] = useState({
      description: '',
      contact: '',
    });

    const {
      user,
      authenticate,
      isAuthenticated
    } = useMoralis();

    const toast = useToast();
    
    
    const themeColor = bountyState?.bounty?.themeColor;


    const handleSubmitClick = async (e) => {
      e.preventDefault();
      
      let isValid = true;

      // check if fields are empty
      // Object.keys(fields).forEach(fieldName => {
      //   const field = document.querySelector(`form [name="${fieldName}"]`) as HTMLInputElement;
      //   if (field.value.length === 0) {
      //     // set it to display the error
      //     setInvalidity({...invalidity, [fieldName]: `Please fill out a ${fields[fieldName]}`});
      //     isValid = false;
      //   }
      // })

      // check if description is empty
      if ( !description?.length ) {
        setInvalidity({...invalidity, description: 'Please fill out a description'});
        isValid = false;
      }

      // check if contact is a valid email
      const contact = document.querySelector('form [name="contact"]') as HTMLInputElement;
      if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(contact.value)) {
        setInvalidity({...invalidity, contact: 'Please enter a valid email'});
        isValid = false;
      }
      
      // atleast one of the field was invalid so not processing further
      if (!isValid) {
        return;
      }

      const res = await moralisAuthentication( authenticate, isAuthenticated, user, account, toast, isInjected, chainId )
      if(!res) {
        return;
      }
      setApplying(true);

      if (account && signer && bountyState.bounty) {
        const submissionData = { email: email, description, account: account, bountyId: bountyState.bounty.bountyId };
        try {
            const result = await submitBountyApplication(submissionData, signer, chainId, user, dispatch);
            if(result) {
              props.setHasApplied(true);
            }
            setApplying(false);
        } catch(e) {
            console.log(e);
            setApplying(false);
        }
      } else {
        onClose();
      }
    }

    
    
    const handleApplication = async () => {
      
      if( connected ) {
        onOpen();
      }
      
    }
    const buttonText = 'Apply';
    useColorModeValue('gray.500', 'gray.50');

  
    if (!bountyState.bounty || !bountyState.bounty.requiresApplication) {
      return (<></>);
    }
  
    const disableEditButton = !connected || bountyState.waitingDrainConfirmation || bountyState.waitingPayout || bountyState.waitingSubmissionConfirmation || bountyState.creating || bountyState.bounty.isCompleted || props.isExpired;
    const isCompleted = bountyState.bounty != null && bountyState.bounty.isCompleted;
  
    return (
      <>
        <Button colorScheme={themeColor} disabled={disableEditButton} onClick={handleApplication} width="100%" mb="4">{buttonText}</Button>
         <Modal size="4xl" isOpen={isOpen} onClose={onClose}>
         <ModalOverlay bg='none' backdropFilter='blur(5px)' backdropBlur='2px'/>
         <ModalContent borderWidth="2px" borderRadius="3xl" p={5}>
            <ModalHeader>Submit application</ModalHeader>
            <ModalCloseButton />
            <ModalBody>

              <Box>
                <form onSubmit={ handleSubmitClick }>
                  <FormControl id="submitterEmail">
                    <FormLabel>Email address</FormLabel>
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
                    <FormLabel>Application</FormLabel>
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

                        // placeholder="Describe your work"
                        // mt={1}
                        // rows={10}
                        // shadow="sm"
                        onChange={(event) => { setInvalidity({...invalidity, description: ''}); setDescription(event.target.value); }}
                      />
                      </Box>
                    </Tooltip>
                  </FormControl>
          
                  <Button
                    width="100%"
                    mt="20px"
                    isLoading={applying}
                    isDisabled={applying}
                    colorScheme={themeColor}
                    disabled={disableEditButton} type="submit">
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
  