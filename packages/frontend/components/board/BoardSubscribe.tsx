import { useDisclosure, Text, Button, Modal, Center, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Input, InputGroup, InputRightAddon, FormHelperText, FormControl, useToast, IconButton, Spinner, VStack, Skeleton } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { FaPencilAlt } from "react-icons/fa";
import { useMoralis } from "react-moralis";
import { useAccount, useConnect, useNetwork } from "wagmi";
import { BoardSubscription } from "../../data/model";
import { moralisAuthentication } from '../../lib/utils'

let throttled = null as any;

const CheckVerified = function({setCheckVerified, setHasValidEmail} : any) : JSX.Element {
    
    const { Moralis } = useMoralis();

    const check = useCallback(async () => {
        Moralis.User.current().fetch().then((user) => {
            if(user.get('emailVerified')) {
                setHasValidEmail(true);
                setCheckVerified(false);
            }
        });
    }, [setCheckVerified])

    // check after every 5 seconds until the user is verified
    useEffect(() => {
        
            const interval = setInterval(check, 5000);

            return () => {
                clearInterval(interval);
            }
        
    }, []);
    
    return (
        <>
            <Spinner />
        </>
    )
}

const EmailPanel = function({setHasValidEmail, editMode, setEditMode}: any) : JSX.Element {

    const { isConnected } = useConnect();
    const { data: accountData } = useAccount();
    const { activeChain: chain } = useNetwork()
    
    const chainId = chain?.id;
    const address = accountData?.address;
    const isWalletConnect = accountData?.connector?.id === "walletConnect"

    const { user, authenticate, isAuthenticated } = useMoralis();
    
    const toast = useToast();
    
    const [email, setEmail] = useState('');
    const [valid, setValid] = useState(false);
    const [inProgress, setInProgress] = useState(false);
    const [saveOnUserLoad, setSaveOnUserLoad] = useState(false);
    const [processOnUserConnected, setProcessOnUserConnected] = useState(false);
    const [touched, setTouched] = useState(false);
    
    const [checkVerified, setCheckVerified] = useState(false);
    const [isQueried, setIsQueried] = useState(false);

    const changeEmail = useCallback((e) => {
        if( !editMode ) {
            setEditMode(true);
        }
        if( !touched ) {
            setTouched(true);
        }
        setEmail(e.target.value);
    }, [])

    const saveEmail = useCallback(async () => {

        setSaveOnUserLoad(false);
        setProcessOnUserConnected(false);
        user.set('email', email);
        user.save().then(() => {
            
            setEditMode(false);
            setCheckVerified(true);
            
        }).catch((error) => {
            setCheckVerified(false);
            toast({
                title: "Error",
                description: error.message,
                status: "error",
                isClosable: true,
            })
        }).finally(() => {
            setInProgress(false);
            setHasValidEmail(false)
        })
    }, [email, user])

    const processSave = useCallback( async () => {
        
        setInProgress(true);

        // if user is not connected or user's eth address is not the same as the email address
        // in case the user is logged in now, then we should set the saveOnUserLoad flag to true, for the system to save the email on new user load
        setSaveOnUserLoad(true);

        const res = await moralisAuthentication( authenticate, isAuthenticated, user, address, toast, isWalletConnect, chain?.id )
        
        if(!res) {
            setInProgress(false);
            return;
        }

        // in case moralis has just authenticated, and the user object is not yet loaded
        if(!user) {
            return;
        }
        // if the user did not change, the proceed with saving of email
        saveEmail();
        

    }, [email, valid, isConnected, address, user, chain]);
    
    useEffect(() => {
        
        // throttled check for validity of the email
        if (throttled) {
            clearTimeout(throttled);
        }

        throttled = setTimeout(() => {
            // check if email is valid
            const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if (emailRegex.test(email)) {
                setValid(true);
            } else {
                setValid(false);
            }
        }, 500);


    }, [email]);

    useEffect(() => {
        if(saveOnUserLoad && user) {
            saveEmail();
        }
    }, [user])

    useEffect(() => {
        if(processOnUserConnected && isConnected) {
            processSave();
        }
    }, [isConnected])

    useEffect(() => {

        if(processOnUserConnected || !address) {
            return;
        }

        
        if(user && isConnected && address.toLocaleLowerCase() === user.get('ethAddress').toLocaleLowerCase()) {
            user.fetch().then((user) => {
                const email = user.get('email');
                if(!email) {
                    setEditMode(true);
                }
                const isVerified = user.get('emailVerified');
                setEmail(email);
                setCheckVerified(!!email && !isVerified);
                if ( email && isVerified) {
                    setHasValidEmail(true);
                } else {
                    setHasValidEmail(false);
                }
                setIsQueried(true);
            })
        } else {
            setEmail('');
            setHasValidEmail(false);
            setCheckVerified(false);
            // setIsQueried(true);
            moralisAuthentication( authenticate, isAuthenticated, user, address, toast, isWalletConnect, chainId );
        }
        
    }, [user, address])
    
    // useEffect(() => {
    //     if(!checkVerified) {
    //         setHasValidEmail(true);
    //     }
    // }, [checkVerified])

    return (
        <>
            { isQueried ?
                <>
                    <FormControl>
                        <InputGroup>
                            <Input 
                                placeholder="Email"
                                value={email}
                                onChange={changeEmail}
                                isDisabled={!editMode && !!email}
                                />
                            <InputRightAddon p='0'>
                                {editMode || !email ? (
                                    <Button
                                        borderLeftRadius='0'
                                        onClick={processSave}
                                        isLoading={inProgress}
                                        loadingText='Saving'
                                        disabled={!valid}
                                    >{ touched && valid ? 'Verify' : 'Save' }</Button>
                                ) : (
                                    <IconButton
                                        borderLeftRadius='0'
                                        onClick={() => setEditMode(true)}
                                        icon={<FaPencilAlt />} 
                                        aria-label={"Edit Email"}
                                        />
                                )}
                            </InputRightAddon>
                        </InputGroup>
                        { editMode && <FormHelperText>Enter a valid email address</FormHelperText> }
                    </FormControl>
                    { checkVerified && 
                        <>
                            <Text fontSize='sm' color='red'>The email address you have entered needs to be verified. Check your inbox for the verification email and click on the link to verify.</Text> 
                            <CheckVerified setCheckVerified={setCheckVerified} setHasValidEmail={setHasValidEmail} />
                        </>
                    }
                </>
            : <Skeleton height='40px' />
            }
        </>
        
    )
}

const SubscribePanel = function( { board, statusQueried, subscription, setSubscription  }: any) : JSX.Element {
    
    const [inProgress, setInProgress] = useState(false);
    

    const toggleSubscription = useCallback(async () => {
        
        setInProgress(true);

        if (subscription) {
            
            await subscription.destroy();
            setSubscription(null);
            setInProgress(false);
            
        } else {
            
            const newsub = new BoardSubscription();
            
            newsub.set("board", board);

            newsub.save().then(() => {
                setSubscription(newsub);
                setInProgress(false);
            }).catch(() => {
                setInProgress(false);
            });

        }

        

    }, [subscription, board]);

    

    return (
        <VStack mt='4'>
            {statusQueried ? (
                <>
                { subscription ?
                    <Text>Unsubscribe to this project</Text> :
                    <Text>Subscribe to receive project updates</Text>
                }
                
                    <Button
                        onClick={toggleSubscription}
                        isLoading={inProgress}
                        loadingText="updating subscription"
                        >{subscription ? "Unsubscribe" : "Subscribe"}</Button>
                </>
            ) : 
            <Skeleton height="20px" w='full' />
            }

        </VStack>
    )
    
}

export default function BoardSubscribe( { board, isDashboard, themeColor } : {board: string, isDashboard: boolean, themeColor: string} ) : JSX.Element {
    
    const { onOpen, onClose, isOpen } = useDisclosure();
    const [hasValidEmail, setHasValidEmail] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [processOnUserConnected, setProcessOnUserConnected] = useState(false);
    const { isConnected } = useConnect();
    const { Moralis, user } = useMoralis();

    const boardSubscriptionQuery = new Moralis.Query(BoardSubscription);

    const { data: accountData } = useAccount();
    const userAddress = accountData?.address;

    const [subscription, setSubscription] = useState<BoardSubscription | null>( null );
    const [statusQueried, setStatusQueried] = useState(false);

    const openDialog = useCallback(() => {

        if( !isConnected ) {
            
            setProcessOnUserConnected(true);

            // emit a custom window event called 'connect' to trigger the connect modal
            window.dispatchEvent(new CustomEvent('connect'));

            
            return;
        }

        onOpen();
    }, [isConnected]);

    useEffect(() => {
        if(processOnUserConnected && isConnected) {
            onOpen();
        }
    }, [isConnected])

    const doClose= useCallback(() => {
        onClose();
        setEditMode(false);
    }, []);

    useEffect(() => {
        return () => {
            onClose();
            setEditMode(false);
        }
    }, [])

    useEffect(() => {
        if(board && userAddress) {
            // pull record from BoardSubscription, where account = account
            boardSubscriptionQuery.equalTo("board", board);
            boardSubscriptionQuery.equalTo("user", userAddress.toLocaleLowerCase());
            boardSubscriptionQuery.find().then((res) => {
                if(res.length > 0) {
                    setSubscription(res[0] as BoardSubscription);
                } else {
                    setSubscription(null);
                }
                setStatusQueried(true);
                setEditMode(false);
            });
        }

    }, [user, board, userAddress])
    
    return (
        <>
            <Center>
                <Button size='md'  
                colorScheme={ subscription ? 'gray' : themeColor ? themeColor : "purple" }
                onClick={openDialog}
                isDisabled={isDashboard}
                >
                    { subscription ? 'Subscribed' : 'Subscribe' }
                </Button>
            </Center>
    
            <Modal isOpen={isOpen} onClose={doClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Subscribe to Board</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb='8'>
                        <EmailPanel setHasValidEmail={setHasValidEmail} editMode={editMode} setEditMode={setEditMode} />
                        { hasValidEmail && !editMode && 
                            <SubscribePanel 
                                board={board}
                                statusQueried = { statusQueried}
                                setStatusQueried = {setStatusQueried}
                                subscription = {subscription}
                                setSubscription = {setSubscription}
                                /> }
                    </ModalBody>
                </ModalContent>

            </Modal>
        </>
    )
}