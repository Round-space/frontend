import { Button, FormControl, FormHelperText, Text, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure, RadioGroup, VStack, Radio, Box } from "@chakra-ui/react";
import { ethers } from "ethers";
import { useCallback, useState } from "react";
import { useAccount, useProvider } from "wagmi";
import { truncateHash } from "../../lib/utils";

export default function GnosisPopup({bountyMetadata, setBountyMetadata}: any) : JSX.Element {
    const { onOpen, isOpen, onClose } = useDisclosure();
    const [ address, setAddress ] = useState(bountyMetadata?.gnosis ?? '');
    const [ invalidity, setInvalidity ] = useState('');
    const [ inProgress, setInProgress ] = useState(false);
    const { data } = useAccount();
    const account = data?.address;
    const connector = data?.connector;
    const provider = useProvider();

    const disconnectGnosis = useCallback(() => {
        setBountyMetadata((prev: any) => ({
            ...prev,
            gnosis: null
        }));
    }, [setBountyMetadata]);

    const saveGnosis = useCallback(() => {
        
        if(address) {

            if(ethers?.utils?.isAddress(address)) {
                
                setInProgress(true);

                const gnosisSafeContract = new ethers.Contract(address, ['function isOwner(address) view returns (bool)'], provider);
                
                gnosisSafeContract.isOwner(account).then((isOwner) => {
                    if (!isOwner) {
                        setInvalidity('The current signer is not the owner of the Gnosis safe');
                    } else {
                        setInvalidity('');
                        setBountyMetadata((prev: any) => ({
                            ...prev,
                            gnosis: address
                        }));
                        onClose();
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
    }, [address, account, bountyMetadata?.gnosis, provider, setBountyMetadata])

    return(
        <Box my='4'>
            {/* <HStack mb={5}>
                <Text fontSize="md">
                    Use Gnosis Safe:
                </Text>
                <Switch name="use-gnosis-safe" colorScheme="green" 
                    isChecked={!!bountyMetadata?.gnosis}
                    onChange={ (event) => {  
                        if(event.target.checked) {
                            onOpen();
                        } else {
                            disconnectGnosis();
                        }
                    }} />
            </HStack> */}

        
                {/* <Text fontWeight="bold">Funding Wallet</Text> */}
                <RadioGroup
                    mt='4'
                    value={!bountyMetadata?.gnosis ? 'wallet' : 'gnosis'}
                    onChange={(val) => {
                        if(val === 'wallet') {
                            disconnectGnosis();
                        } else {
                            onOpen();
                        }
                    }}>
                    <VStack align='flex-start'>
                        <Radio colorScheme="purple" value="wallet">
                            <Text fontSize='sm' fontWeight={ !bountyMetadata?.gnosis ? 'bold' : ''}>Fund using {connector?.name ?? 'Wallet'} ({truncateHash(account)})</Text>
                        </Radio>
                        <Radio colorScheme="purple" value="gnosis">
                            <Text fontSize='sm' fontWeight={ !bountyMetadata?.gnosis ? '' : 'bold'}>Fund from Gnosis Safe { bountyMetadata?.gnosis ? '('+truncateHash(bountyMetadata?.gnosis ?? '') + ')' : '' }</Text>
                        </Radio>
                    </VStack>
                </RadioGroup>
            
            
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Connect to Safe</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl>
                            <FormHelperText mb={2}>
                            {invalidity ? invalidity : "Specify a valid Safe address. Please make sure your Safe is deployed on the active chain."}
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
                    </ModalBody>
                    <ModalFooter>
                        <Button 
                            isLoading={inProgress}
                            isDisabled={inProgress}
                            colorScheme="purple" mr={3} onClick={saveGnosis}>
                            Save
                        </Button>
                        <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            
        </Box>
    )
}