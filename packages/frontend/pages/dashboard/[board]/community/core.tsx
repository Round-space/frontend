import { Button, Text, Table, TableContainer, Tbody, Td, Th, IconButton, Thead, Tr, VStack, Tooltip, Flex, Spacer, useDisclosure, FormControl, FormHelperText, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, HStack, useToast, Checkbox, Box } from "@chakra-ui/react";
import { useCallback, useState, useEffect } from "react";
import { RootState, useAppDispatch, useAppSelector } from "../../../../reducers";
// grUserAdmin
import { GrUserAdmin } from "react-icons/gr";

// import { MdDelete } from "react-icons/md";
// a different bin icon
import { FaTrashAlt } from "react-icons/fa";

import { moralisAuthentication, truncateHash } from "../../../../lib/utils";
// import NFTSetter from "../../../../components/ui/NFTSetter";
import { BoardCollaborators } from "../../../../data/model";
import { addCollaborator as addCollaboratorToState, addToEnsDirectory, removeCollaborator } from "../../../../reducers/dashboard/state";
import { ethers } from "ethers";
import { useMoralis } from "react-moralis";
import { useAccount, useNetwork, useProvider } from "wagmi";
import { useQueryEnsName } from "../../../../hooks/useQueryEnsName";

const Collaborator = function({hasGnosis, isDefault, isOwner, isGnosisSig, collaborator, themeColor}: any) : JSX.Element {
  const date = new Date(collaborator.createdAt);
  const [deleting, setDeleting] = useState(false);

  // format date as per the locale
  const formattedDate = date.toLocaleDateString();

  const walletState = useAppSelector((state: RootState) => {
    return state?.wallet;
  });

  const dispatch = useAppDispatch();
  const ensName = useQueryEnsName( collaborator.address )
  const etherScanUrl = walletState.chainMeta ? walletState.chainMeta.info.explorer : '';

  const deleteCollaborator = useCallback(async (id: string) => {
    const collaborator = new BoardCollaborators();
    collaborator.id = id;
    
    try {
      await collaborator.destroy();
      dispatch(removeCollaborator(id));
    } catch(e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
    
  }, [dispatch]);

  useEffect(() => {
    if(ensName) {
      // just to help the cache
      dispatch(addToEnsDirectory({address: collaborator.address.toLowerCase(), ensName}))
    }
  }, [ensName]);

    return (
      <Tr>
        {/* <Td>{subscriber.user.name}</Td> */}
        <Td>
            <Tooltip label={collaborator.address} placement='top'>
              <HStack>
                { isDefault ? <GrUserAdmin /> : null }
                <span>{ ensName || truncateHash(collaborator.address)}</span>
              </HStack>
            </Tooltip>
        </Td>
        {/* <Td>{subscriber.user.email}</Td> */}
        <Td>{ isDefault ? '' : formattedDate}</Td>

        { hasGnosis && <Td>{isGnosisSig ? 'Yes' : 'No'}</Td> }
        <Td><Button as='a' href={`${etherScanUrl}address/${collaborator.address}`} target='_blank' size='sm' colorScheme={themeColor} >View on Etherscan</Button></Td>
        <Td>
          { !isDefault && isOwner ?
          <IconButton 
            aria-label='delete' 
            icon={<FaTrashAlt />} 
            isLoading={deleting}
            onClick={async() => {
              setDeleting(true);
              await deleteCollaborator(collaborator.objectId)
              setDeleting(false)
            }}
            colorScheme={themeColor} 
            size='sm'  />
            : null }
        </Td>
      </Tr>
    )
}

const AddCollaborator = function({themeColor} : any) : JSX.Element {
  const { onOpen, isOpen, onClose } = useDisclosure();
  const [address, setAddress] = useState<string>('');
  
  const [ invalidity, setInvalidity ] = useState('');
  const [ confirmValidity, setConfirmValidity] = useState('');
  const [ inProgress, setInProgress ] = useState(false);
  const [ addNonGnosisSig, setAddNonGnosisSig ] = useState<boolean | null>(null);
  const { user, authenticate, isAuthenticated } = useMoralis();
  const { data: accountData } = useAccount();
  const { activeChain: chain } = useNetwork()
  const provider = useProvider();
  const userAddress = accountData?.address;
  const isWalletConnect = accountData?.connector?.id === "walletConnect"
  const dashboardState = useAppSelector((state: RootState) => {
    return state?.dashBoard;
  });
  const dispatch = useAppDispatch();

  const toast = useToast();

  const initiateModal = useCallback(() => {
    setAddress('')
    setConfirmValidity('')
    setAddNonGnosisSig(null)
    onOpen();
  }, [])

  const addCollaborator = useCallback(async (address: string, isNFT: boolean) => {
    

    const res = await moralisAuthentication( authenticate, isAuthenticated, user, userAddress, toast, isWalletConnect, chain?.id )
    
    if(!res) {
      return;
    }

    
    const boardCollaborator = new BoardCollaborators();

    // use checksummed addresses
    const data = {
      board: ethers.utils.getAddress(userAddress),
      address: ethers.utils.getAddress(address),
      isNFT
    }

    Object.keys(data).forEach(key => {
      boardCollaborator.set(key, data[key]);
    })

    // Check to determine, if the current user can add a collaborator for the board is done in the cloud functions

    try {
      const res = await boardCollaborator.save();
      dispatch(addCollaboratorToState({...data, objectId: res.id, createdAt: res.createdAt.toString()}))
    } catch(e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
  }, [userAddress, isWalletConnect, authenticate, isAuthenticated, user, chain]);

  const savePublicAddress = useCallback(async () => {
    // check if the address is valid
    let resolvedAddress = '';
    setInProgress(true);
    if( address && ! ethers.utils.isAddress(address) && ! resolvedAddress) {
      // is it an ens name?
      
      // check if it exists in the dashboard state's ens directory
      const ensFromCache = dashboardState.ensDirectory.find((ens: any) => ens.ensName === address.toLowerCase());
      
      if(ensFromCache?.address) {
        resolvedAddress = ensFromCache.address;
      } else {
        try {
          const ensAddress = await provider.resolveName(address);
          if(ensAddress) {
            resolvedAddress = ensAddress;
            dispatch(addToEnsDirectory({address: ensAddress.toLowerCase(), ensName: address.toLowerCase()}))
          } else {
            
            setInvalidity('Provide a valid public address')
            setInProgress(false);
            return
          }

        } catch(e) {
          
          setInvalidity('Provide a valid public address')
          setInProgress(false);
          return
        }
      }
    }

    resolvedAddress = resolvedAddress || address;
    

    if(dashboardState.metadata.gnosis && addNonGnosisSig === null) {
      // grab the gnosis contract
      const gnosisSafeContract = new ethers.Contract(dashboardState.metadata.gnosis, ['function isOwner(address) view returns (bool)', 'function getOwners() view returns (address[])'], provider);
      const owners = await gnosisSafeContract.getOwners();
      
      // if the address is not among the owners
      if(!owners.includes(resolvedAddress)) {
        setInProgress(false);
        setAddNonGnosisSig(false);
        return;
      } else {
        await addCollaborator(resolvedAddress, false);  
        setInProgress(false);
        onClose();
      }
    } else {
      if(addNonGnosisSig === false) {
        setConfirmValidity('You must confirm by checking the box.');
        setInProgress(false);
        return;
      }
      await addCollaborator(resolvedAddress, false);
      setInProgress(false);
      onClose();
    }
    
    

  }, [onClose, address, dashboardState.metadata.gnosis, dashboardState.ensDirectory, provider, addNonGnosisSig, setAddNonGnosisSig])
  
  return (
    <HStack>
      <>
        <Button onClick={initiateModal} colorScheme={themeColor} variant='outline' size='sm'>Add Public Address</Button>
        
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Specify a public address</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <FormControl>
                        <FormHelperText mb={2}>
                        {invalidity ? invalidity : "Specify a valid public address"}
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
                    { addNonGnosisSig !== null && 
                      <FormControl mt={4}>
                        <FormHelperText mb={2}>
                          You are adding a collaborator that is not a Gnosis Safe owner. <br />
                          { confirmValidity ? (<Text color='red'>{confirmValidity}</Text>) : 'Please confirm that you want to add this collaborator.'}
                          
                        </FormHelperText>
                        <Checkbox checked={addNonGnosisSig === true}
                          onChange={(e) => {
                            setConfirmValidity('');
                            setAddNonGnosisSig(e.target['checked']);
                          }}
                        >
                          I confirm that I want to add this collaborator
                        </Checkbox>
                      </FormControl>
                    }
                          
                </ModalBody>
                <ModalFooter>
                    <Button 
                        isLoading={inProgress}
                        isDisabled={inProgress}
                        colorScheme={themeColor} mr={3} onClick={savePublicAddress}>
                        Save
                    </Button>
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
        
    </>
      {/* <NFTSetter nft={''} setNft={async (val, onClose) => {
        await addCollaborator(val, true); // true for NFT
        onClose();
      } } themeColor={themeColor} label="Add NFT" /> */}
    </HStack>
  )
}

export default function Collaborators(): JSX.Element {
  
  
  const dashboardState = useAppSelector((state: RootState) => {
    return state?.dashBoard;
  });
  const { data: accountData } = useAccount();
  
  const userAddress = accountData?.address;

  const { themeColor } = dashboardState.metadata ?? { id: null};
  const { collaborators, board } = dashboardState;
  const provider = useProvider();
  const [gnosisSigs, setGnosisSigs] = useState([]);
  
  useEffect(() => {
    if(dashboardState.metadata.gnosis) {
      const gnosisSafeContract = new ethers.Contract(dashboardState.metadata.gnosis, ['function isOwner(address) view returns (bool)', 'function getOwners() view returns (address[])'], provider);
      gnosisSafeContract.getOwners().then((res) => {
        setGnosisSigs(res);
      })
    }

  }, [dashboardState.metadata.gnosis])

  const isOwner = userAddress && userAddress.toLowerCase() === board.toLowerCase();
  
  return (
    <>
      <Flex my={6} direction="row">
        <Flex direction="column">
        <Text verticalAlign="center" fontSize="md" fontWeight="bold">Core Team</Text>
        <Text verticalAlign="center" fontSize="md" color="gray.400" fontWeight="normal">Core team members will be able to create and manage projects in this workspace.</Text>
        </Flex>
        <Spacer />
        {isOwner ?
          <AddCollaborator 
            themeColor={themeColor} 
          />
          :
          <Tooltip label="Only the board owner can add collaborators" aria-label="A tooltip">
            <Box>
              <Button isDisabled={true} colorScheme={themeColor} variant='outline' size='sm'>Add Public Address</Button>
            </Box>
          </Tooltip>
        }
         
          
      </Flex>

      <VStack>
        <TableContainer width="100%">
          <Table variant='striped' colorScheme={themeColor} size="sm">
            <Thead>
              <Tr>
                {/* <Th>Name</Th> */}
                <Th>Address</Th>
                {/* <Th>Email</Th> */}
                <Th>Added on</Th>
                { dashboardState.metadata.gnosis && <Th>is Gnosis Signatory</Th> }
                <Th></Th>
                <Th></Th>
              </Tr>
            </Thead>
            <Tbody>
              <Collaborator isDefault={true} hasGnosis={!!dashboardState.metadata.gnosis} isGnosisSig={ gnosisSigs.includes(userAddress)} themeColor={themeColor} collaborator={{address: userAddress}}  />
              {collaborators?.map((collaborator, index) => (<Collaborator isOwner={isOwner} hasGnosis={!!dashboardState.metadata.gnosis} isGnosisSig={ gnosisSigs.includes(collaborator.address)} themeColor={themeColor} collaborator={collaborator} key={index} />)) }
            </Tbody>
          </Table>
        </TableContainer>
        {!collaborators?.length && (
          <Text textAlign='center'>
            There are no collaborators yet.
          </Text>
        )}
      </VStack>
    </>
  )
}