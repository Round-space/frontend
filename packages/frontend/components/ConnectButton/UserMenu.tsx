import { ConnectButton } from './ConnectButton'
import React, { useEffect, useState, useCallback } from 'react'
import { Menu, MenuItem, MenuList, MenuButton, VStack, Text } from '@chakra-ui/react'
import { IoWalletOutline } from 'react-icons/io5'

import { useRouter } from 'next/router'

import { useConnect, useAccount, useDisconnect } from 'wagmi';

import { useAppDispatch, useAppSelector } from '../../types/hooks'
import {
  setWalletDisconnected
} from '../../reducers/wallet/state'

import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    Image,
    Button,
} from '@chakra-ui/react'

import { RootState } from '../../reducers'

const logos = {
  'MetaMask': '/images/logo-metamask.png',
  'WalletConnect': '/images/logo-walletconnect.svg',
  'Coinbase Wallet': '/images/logo-coinbase.png',
  'default': '/images/ethereum-logo.png',
}

// Takes a long hash string and truncates it.
function truncateHash(hash: string, length = 38): string {
  return hash?.replace(hash.substring(6, length), '...') ?? ''
}

export const UserMenu = (props) => {
  
  const { connectors, isConnected, connectAsync: connect, isDisconnected } = useConnect()
  const dispatch = useAppDispatch();
  const { data: accountData } = useAccount();
  const { disconnect: disconnectAccount } = useDisconnect();
  const [account, setAccount] = useState(accountData?.address);
  const [connected, setConnected] = useState(isConnected);

  const { currentAccountEnsName: ensName, currentAccountEnsAvatar: ensAvatar} = useAppSelector((state: RootState) => { return state.wallet; });

  useEffect(() => {
    setAccount(accountData?.address)
  }, [accountData])

  useEffect(() => {
    setConnected(isConnected)
  }, [isConnected])

  useEffect(() => {
    if (isDisconnected) {
      setTimeout(() => {
        dispatch(setWalletDisconnected());
      }, 200)
    }
  }, [isDisconnected])

  const disconnect = useCallback(() => {
      setAccount(null);
      setConnected(false);
      disconnectAccount();
      dispatch(setWalletDisconnected());
  }, []);

  const [ connecting, setConnecting ] = useState(false);
  
  const connectorMetaMask = connectors?.[0]
  
  const connectorWalletConnect = connectors?.[1]
  const connectorCoinBase = connectors?.[2]

  useEffect(() => {
    if(connected) {
      setConnecting(false);
    }
  }, [connected])

  // useEffect(() => {
  //   if(!isConnecting) {
  //     setConnecting(false)
  //   } else {
  //     // to clear off any previous ens data
  //     dispatch(setWalletDisconnected());
  //   }
  // }, [isConnecting])

  useEffect(() => {
    // listen for the 'connect' event, if a request to connect is initiated in some other component
    window.addEventListener('connect', () => {
      openConnectModal();
    })
  }, []);

  const [ isOpen, setIsOpen ] = useState(false)


  // check if homepage
  const router = useRouter()
  const isHomepage = router.pathname === '/' || router.pathname === '/bounty/create'

  const openConnectModal = () => {
    // open the modal only if not connected
    if( !connected ) {
        setIsOpen(true)
        setConnecting(true);
    }
  }

  const initiateConnection = ( connector ) => {
    setIsOpen(false); 
    // to clear off any previous ens data
    dispatch(setWalletDisconnected());
    connect(connector);
  }

  const getMetaMask = () => {
    window.open('https://metamask.io/download/', '_blank');
  }

  const getWallet = () => {
    window.open('https://ethereum.org/en/wallets/find-wallet/','_blank');
  }
  const [isHovered, setIsHovered] = useState(false);
  


  return (
    <>
      {/* Need to Simplify! */}
      {props.simpleButton ? 
        <>
        <Button 
          onClick={!connected? openConnectModal : disconnect}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          py={3}
          colorScheme="purple"
          fontWeight="bold"
          size="sm"
          width={(isHovered && connected) && "220px"}
          border={connected? "3px solid #6B46C1":"inherit"}
          borderRadius="full">
            {connected ? 
            isHovered? "Click to Disconnect" :
              "Connected (" + truncateHash(account) + ")" :             
              "Connect Wallet →"}
          </Button>
          </>
          : 
        <Menu>
          <MenuButton
            as={ConnectButton}
            onClick={ openConnectModal }
            connected={connected}
            connecting={connecting}
            address={ account ?? null }
            ensName={ensName}
            ensImgSrc={ensAvatar}
            color={isHomepage?"#1A202C": "#878787"}
            borderColor={isHomepage?"#1A202C": "#878787"}
          />
          {account && connected && (
            <MenuList>
              <MenuItem onClick={ disconnect }>Disconnect</MenuItem>
            </MenuList>
          )}
        </Menu>
}

      <Modal onClose={ () => { setConnecting(false); setIsOpen(false) } } isOpen={isOpen}>
      <ModalOverlay />
      <ModalContent rounded={"3xl"}>
        <ModalHeader textAlign="center">Connect Wallet</ModalHeader>
        <ModalCloseButton mt={2} mr={2} />
        <ModalBody pb={8}>
            { connectorMetaMask?.['ready'] &&
            <Button
                key={connectorMetaMask['id']} 
                justifyContent="space-between"
                width="100%"
                mb="4"
                size="lg"
                variant="outline"
                rounded="xl"
                rightIcon={
                <Image
                    maxWidth="20px"
                    maxHeight="20px"
                    src={logos['MetaMask']}
                    alt={connectorMetaMask['name']}
                />
                }
                onClick={() => initiateConnection(connectorMetaMask)}
            >{connectorMetaMask['name']}</Button> }

            { !connectorMetaMask?.['ready'] &&
            <Button
                key='getMetaMask' 
                justifyContent="space-between"
                width="100%"
                mb="4"
                size="lg"
                rounded="xl"
                variant="outline"
                rightIcon={
                <Image
                    maxWidth="20px"
                    maxHeight="20px"
                    src={logos['MetaMask']}
                    alt='Get MetaMask'
                />
                }
                onClick={ getMetaMask }
            >Get MetaMask</Button> }

            { connectorWalletConnect?.['ready'] &&
            <Button
                disabled={!connectorWalletConnect['ready']}
                key={connectorWalletConnect['id']} 
                justifyContent="space-between"
                width="100%"
                mb="4"
                size="lg"
                rounded="xl"
                variant="outline"
                rightIcon={
                <Image
                    maxWidth="20px"
                    maxHeight="20px"
                    src={logos['WalletConnect']}
                    alt={connectorWalletConnect['name']}
                />
                }
                onClick={() => initiateConnection(connectorWalletConnect)}
            >{connectorWalletConnect['name']}</Button> }
            
            { connectorCoinBase?.['ready'] &&
            <Button
                disabled={!connectorCoinBase['ready']}
                key={connectorCoinBase['id']} 
                justifyContent="space-between"
                width="100%"
                size="lg"
                rounded="xl"
                variant="outline"
                rightIcon={
                <Image
                    maxWidth="20px"
                    maxHeight="20px"
                    src={logos['Coinbase Wallet']}
                    alt={connectorCoinBase['name']}
                />
                }
                onClick={() => initiateConnection(connectorCoinBase)}
            >{connectorCoinBase['name']}</Button> }
          <VStack color="gray.600" fontWeight="medium" mt={3}>
            <VStack>
              <Text>Don&apos;t have an Ethereum wallet yet?</Text>
              <Button variant="solid" leftIcon={<IoWalletOutline/>} rounded="xl" onClick={getWallet} size="sm">Get a Wallet</Button>
            </VStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
    </>
  )
}