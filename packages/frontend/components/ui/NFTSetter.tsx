import { Box, Button, FormControl, FormHelperText, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure } from "@chakra-ui/react";
import { ethers } from "ethers";
import { useCallback, useEffect, useState } from "react";
import { useProvider } from "wagmi";
import { ERC1155_INTERFACE_ID, erc721ABI, ERC721_INTERFACE_ID } from "../../constants/nft";

export default function VotingNFTSetter({ nft, setNft, themeColor, label } : {nft: string | null | undefined, setNft : any, themeColor: string, label: string | undefined }) : JSX.Element {
    const { onOpen, isOpen, onClose } = useDisclosure();
    const [ address, setAddress ] = useState('');
    const [ tokenId, setTokenId ] = useState<number | undefined>();
    const [ invalidity, setInvalidity ] = useState('');
    const [ invalidityToken, setInvalidityToken ] = useState('');
    const [ inProgress, setInProgress ] = useState(false);
    const provider = useProvider();

    const initiateModal = useCallback(() => {
        setAddress(nft ?? '')
        setInvalidity('');
        onOpen();
    }, [nft])

    const close = useCallback(() => {
        onClose();
        setInProgress(false);
    }, [onClose, setInProgress])

    const saveNFT = useCallback(async () => {
        
        if( ! address || ! ethers.utils.isAddress(address)) {
            setInvalidity('Provide a valid contract address')
            return
        }
        
        setInProgress(true);

        try {
            
            const contract = new ethers.Contract(address, erc721ABI, provider);

            const isERC721 = await contract.supportsInterface(ERC721_INTERFACE_ID);
            
            let isERC1155 = false;

            if(!isERC721) {
                isERC1155 = await contract.supportsInterface(ERC1155_INTERFACE_ID);
                // if it is erc1155, we need to check if the token id is valid
                if(isERC1155) {
                    if(!tokenId) {
                        setInvalidityToken('Provide a valid token id');
                        return;
                    }
                }
            }

            if(isERC721 || (isERC1155 && tokenId)) {
                setInvalidity('')
                setNft(address+(tokenId ? `/${tokenId}` : ''), close);
                return
            } else {
                setInvalidity('The contract at this address does not support ERC721 or ERC1155 standard');
            }
            setInProgress(false);
        } catch( e ) {
            setInvalidity('Cannot verify, if this contract supports ERC721 or ERC1155  standard');
            setInProgress(false);
            return;
        }

        // onClose();
    }, [address, tokenId, nft, provider, setNft])

    useEffect(() => {
        // if there is a '/' in the address, it means that the user has provided a token id
        // we need to separate it
        if(nft?.includes('/')) {
            const [ contractAddress, tokenId ] = nft.split('/');
            setAddress(contractAddress);
            setTokenId(parseInt(tokenId));
        } else {
            setAddress(nft ?? '');
            setTokenId(undefined);
        }

    }, [nft])

    return (
        <Box my='4' textAlign="center" >
            <Button onClick={initiateModal} colorScheme={themeColor} variant='outline' size='sm'>{label ?? 'set NFT'}</Button>
            
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Specify NFT contract address</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl>
                            <FormHelperText mb={2}>
                            {invalidity ? invalidity : "Specify a valid NFT contract address (erc721 or erc1155)"}
                            </FormHelperText>
                        
                            <Input 
                                value={address ?? ''} 
                                isInvalid={invalidity.length > 0}
                                errorBorderColor='red.600'
                                borderWidth="medium"
                                onInput={(e) => {
                                    setInvalidity('');
                                    setInvalidityToken('');
                                    setAddress(e.target['value']);
                                }} />
                        
                        </FormControl>
                        <FormControl>
                            <FormHelperText mb={2}>Provider a Token ID in case its an ERC1155 implementation</FormHelperText>
                            <Input 
                                type='number'
                                value={tokenId ?? undefined}
                                isInvalid={invalidityToken.length > 0}
                                errorBorderColor='red.600'
                                borderWidth="medium"
                                onInput={(e) => {
                                    setInvalidityToken('');
                                    setTokenId(parseInt(e.target['value']));
                                }}
                                 />
                        </FormControl>
                    </ModalBody>
                    <ModalFooter>
                        <Button 
                            isLoading={inProgress}
                            isDisabled={inProgress}
                            colorScheme={themeColor} mr={3} onClick={saveNFT}>
                            Save
                        </Button>
                        <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    )
}