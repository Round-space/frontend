import { Button, FormControl, FormHelperText, Text, FormLabel, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure, Box, HStack, Switch, Checkbox, ListItem, UnorderedList } from "@chakra-ui/react";
import { ethers } from "ethers";
import { useCallback, useState } from "react";
import { useAccount, useProvider } from "wagmi";

import { RootState, useAppSelector } from "../../reducers";

export default function BoardGnosisPopup(props: any) : JSX.Element {
    const {gnosis, setGnosis, notAmongCollaborators, setNotAmongCollaborators, addCollaborators, setAddCollaborators} = props;
    const { onOpen, isOpen, onClose } = useDisclosure();
    const [ address, setAddress ] = useState('');
    const [ invalidity, setInvalidity ] = useState('');
    const [ inProgress, setInProgress ] = useState(false);
    const [ closeOnly, setCloseOnly ] = useState(false);
    const { data } = useAccount();
    const account = data?.address;
    
    const provider = useProvider();
    const dashBoardState = useAppSelector((state: RootState) => { return state.dashBoard; });

    const disconnectGnosis = useCallback(() => {
        setGnosis(null);
    }, [setGnosis]);

    const openModal = useCallback(() => {
        setAddress('');
        setNotAmongCollaborators([]);
        setAddCollaborators(null);
        onOpen();
    }, [])

    const saveGnosis = useCallback(() => {
        
        if(closeOnly) {
            setCloseOnly(false);
            onClose();
            return;
        }

        if(address) {

            if(ethers?.utils?.isAddress(address)) {
                
                setInProgress(true);

                const gnosisSafeContract = new ethers.Contract(address, ['function isOwner(address) view returns (bool)', 'function getOwners() view returns (address[])'], provider);
                
                gnosisSafeContract.isOwner(account).then(async (isOwner: any) => {
                    if (!isOwner) {
                        setInvalidity('The current signer is not the owner of the gnosis safe');
                    } else {
                        setInvalidity('');
                        setGnosis(address);
                        if(addCollaborators === null) {
                            // get the signatories of the gnosis safe
                            try {
                                setInProgress(true);
                                const owners = await gnosisSafeContract.getOwners();
                                const exceptMyself = owners.filter(owner => owner !== account);

                                // list the exceptMyself addresses that are not among the collaborators
                                const notAmongCollaborators = exceptMyself.filter(owner => !dashBoardState.collaborators.find(({address}: any) => address === owner));
                                
                                if(notAmongCollaborators.length > 0) {
                                    setNotAmongCollaborators(notAmongCollaborators);
                                    setAddCollaborators(true);
                                    setCloseOnly(true);
                                } else {
                                    onClose();
                                }
                            } catch(e) {
                                // eslint-disable-next-line no-console
                                console.log(e);
                            
                            } finally {
                                setInProgress(false);
                            }
                            
                        } else {
                            onClose();
                        }
                    }
                }).catch(() => {
                    // console.log(e);
                    setInvalidity('Invalid Gnosis Safe address');
                }).finally(() => {
                    setInProgress(false);
                });
            } else {
                setInvalidity('Enter a valid gnosis safe address');
            }
        }
    }, [address, account, gnosis, provider, setGnosis, notAmongCollaborators, setAddCollaborators, setCloseOnly, closeOnly])

    return(
        <Box my='4'>
            <HStack mb={5}>
                <FormLabel mb={0}>
                    Use Gnosis Safe:
                </FormLabel>
                <Switch name="use-gnosis-safe" colorScheme="green" 
                    isChecked={!!gnosis}
                    onChange={ (event) => {  
                        if(event.target.checked) {
                            openModal();
                        } else {
                            disconnectGnosis();
                        }
                    }} />
                {!!gnosis && <Text>{gnosis}</Text>}
            </HStack>

        
                {/* <FormHelperText>Select Funding Wallet</FormHelperText>

                <RadioGroup
                    mt='4'
                    value={!gnosis ? 'wallet' : 'gnosis'}
                    onChange={(val) => {
                        if(val === 'wallet') {
                            disconnectGnosis();
                        } else {
                            onOpen();
                        }
                    }}>
                    <VStack align='flex-start' gap='2'>
                        <Radio value="wallet">
                            <Text fontSize='sm' fontWeight={ !gnosis ? 'bold' : ''}>{connector?.name ?? 'Wallet'} ({truncateHash(account)})</Text>
                        </Radio>
                        <Radio value="gnosis">
                            <Text fontSize='sm' fontWeight={ !gnosis ? '' : 'bold'}>Gnosis Safe { gnosis ? '('+truncateHash(gnosis ?? '') + ')' : '' }</Text>
                        </Radio>
                    </VStack>
                </RadioGroup> */}
            
            
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Connect to Gnosis Safe</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl>
                            <FormHelperText mb={2}>
                            {invalidity ? invalidity : "Specify a gnosis safe address"}
                            </FormHelperText>
                        
                            <Input 
                                value={address ?? ''} 
                                isInvalid={invalidity.length > 0}
                                errorBorderColor='red.600'
                                borderWidth="medium"
                                onInput={(e) => {
                                    setInvalidity('');
                                    setAddress(e.target['value']);
                                }} />
                        
                        </FormControl>

                        { !!notAmongCollaborators.length && <Box my='4'>
                            <Text fontSize='sm' color='red.500'>The following gnosis signatories are not already added as collaborators to this board</Text>
                            <UnorderedList>
                                {notAmongCollaborators.map((address) => <ListItem key={address}>{address}</ListItem>)}
                            </UnorderedList>
                            <Text fontSize='sm' color='red.500'>Do you wish to add them as collaborators?</Text>
                            <HStack>
                                <Checkbox isChecked={addCollaborators} onChange={(event) => { setAddCollaborators(event.target.checked) }} />
                                <Text fontSize='sm'>Yes, add them as collaborators</Text>
                            </HStack>
                            </Box> } 
                    </ModalBody>
                    <ModalFooter>
                        <Button 
                            isLoading={inProgress}
                            isDisabled={inProgress}
                            colorScheme="blue" mr={3} onClick={saveGnosis}>
                            Save
                        </Button>
                        <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            
        </Box>
    )
}