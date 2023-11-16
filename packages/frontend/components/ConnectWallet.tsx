/* eslint-disable @typescript-eslint/no-unused-vars, no-console , react/no-unescaped-entities */
import React, { useEffect } from 'react'
import {
  Box,
  Stack,
  HStack,
  Button,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Link,
  IconButton,
  Icon
} from '@chakra-ui/react'

import { useEthers, useEtherBalance, useLookupAddress } from '@usedapp/core'
import { useAppSelector, useAppDispatch } from '../types/hooks'
import {
  setWalletConnected,
  setWalletDisconnected,
  setConnectingWallet,
  setConnectingError,
  setNativeBalance,
  WalletTypeEnum,
  setChainId,
} from '../reducers/wallet/state'
import { walletconnect } from '../lib/connectors'
import { truncateHash } from '../lib/utils'
import AccountButton from './controls/AccountButton'

export function ConnectWallet(props): JSX.Element {

  const dispatch = useAppDispatch()
  const walletState = useAppSelector((state) => state.wallet)

  const { activate, activateBrowserWallet, account, chainId, deactivate, error } = useEthers()
  const { onOpen, isOpen, onClose } = useDisclosure()
  const etherBalance = useEtherBalance(account)



  //Need to send after effect to set account
  useEffect(() => {
    if (account) {
      if (walletState.currentAccount && account === walletState.currentAccount)
        return;
      const isConnected = error == null;
      dispatch(setWalletConnected({ account: account }));
    }

    if (chainId && error == null)
      dispatch(setChainId(chainId));

    connectErrorHandler(error);
  }, [account, chainId, error])



  useEffect(() => {

    if (etherBalance != null) {
      const strBalance = etherBalance.toString();
      if (walletState.nativeBalance != null && walletState.nativeBalance == strBalance)
        return;
      dispatch(setNativeBalance(etherBalance.toString()))
    }
  }, [etherBalance])



  const connectErrorHandler = (err: Error) => {

    if (err == null || err === undefined)
      return;
    // DAPP automatically pushes a notification which can be retrieved with useNotification() hook
    dispatch(setConnectingError(err))
  }

  const metamaskConnectClickHandler = async () => {
    dispatch(setConnectingWallet(WalletTypeEnum.MetaMask))
    activateBrowserWallet();
  }
  const wallectConnectClickHandler = async () => {
    dispatch(setConnectingWallet(WalletTypeEnum.WalletConnect))
    await activate(walletconnect)
  }

  const walletDisconnectHandler = async () => {
    deactivate()
    dispatch(setWalletDisconnected());
  }

  ///If Wallet is Connected return box with wallet balance and Address
  if (walletState.currentAccount) {
    const truncatedAccount = walletState.currentAccountEnsName ? walletState.currentAccountEnsName : truncateHash(walletState.currentAccount);
    return (
      <Box alignItems={'center'}>
        <HStack>
          <Menu placement="bottom-end">
            <MenuButton
              as={AccountButton}
              account={account}  >
              {truncatedAccount}
            </MenuButton>
            <MenuList>
              <MenuItem
                onClick={walletDisconnectHandler}
              >
                Disconnect
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Box>)

  }


  const walletHeader = props.isLayout ? (<Box order={[-1, null, null, 2]} textAlign={['left', null, null, 'right']} >
    <Button
      colorScheme="green"
      borderRadius="full" p={5}
      fontWeight="medium"
      fontSize="medium"
      onClick={onOpen}>
      Connect Wallet
    </Button>
    <Link href="https://ethereum.org/en/wallets/" isExternal>
      Don't have a wallet?
    </Link>

  </Box>
  ) : (
    <Stack spacing={3}>
      <Button
        isDisabled={walletState.connectError != null}
        colorScheme="green"
        borderRadius="full" p={5}
        fontWeight="medium"
        fontSize="medium"
        onClick={onOpen}
        maxW={props.buttonWidth}>
        Connect Wallet
      </Button>

    </Stack>
  );

  return (
    <>
      {walletHeader}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Connect to a wallet</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Button
              justifyContent="space-between"
              width="100%"
              mb="4"
              size="lg"
              variant="outline"
              rightIcon={
                <Image
                  maxWidth="20px"
                  src=""
                  alt="MetaMask"
                />
              }
              onClick={metamaskConnectClickHandler}
            >
              MetaMask
            </Button>
            <Button
              justifyContent="space-between"
              width="100%"
              mb="4"
              size="lg"
              variant="outline"
              rightIcon={
                <Image
                  maxWidth="20px"
                  src="/images/logo-walletconnect.svg"
                  alt="WalletConnect"
                />
              }
              onClick={wallectConnectClickHandler}
            >
              WalletConnect
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}
