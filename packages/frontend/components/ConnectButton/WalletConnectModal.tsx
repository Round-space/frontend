import {
  ModalProps,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Image,
  Button,
} from '@chakra-ui/react'
import * as React from 'react'
import { WalletTypeEnum } from '../../reducers/wallet/state'

export type WalletProvider = {
  imgSrc: string
  name: string
  onClickProvider: () => void
}
export const createProviders = (
  onConnectWallet: (wallet: WalletTypeEnum) => void
) => [
  {
    imgSrc: '/images/logo-metamask.png',
    name: (() => {
      if ( typeof(window) !== 'undefined' ) {
        if(!window.ethereum || !window.ethereum.isMetaMask) {
          return 'Get Metamask'
        }
      }
      return 'Metamask'
    })(),
    onClickProvider: () => {
      if(window.ethereum && window.ethereum.isMetaMask) {
        onConnectWallet(WalletTypeEnum.MetaMask)
      } else {
        window.open('https://metamask.io/', '_blank')
      }
    },
  },
  {
    imgSrc: '/images/logo-walletconnect.svg',
    name: 'WalletConnect',
    onClickProvider: () => {
      onConnectWallet(WalletTypeEnum.WalletConnect)
    },
  },
]

export const WalletConnectModal: React.FC<
  Omit<ModalProps, 'children'> & { providers: WalletProvider[] }
> = ({ providers, ...props }) => {
  return (
    <Modal {...props}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Connect to a wallet</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {providers.map((provider) => (
            <Button
              key={provider.name}
              justifyContent="space-between"
              width="100%"
              mb="4"
              size="lg"
              variant="outline"
              rightIcon={
                <Image
                  maxWidth="20px"
                  src={provider.imgSrc}
                  alt={provider.name}
                />
              }
              onClick={provider.onClickProvider}
            >
              {provider.name}
            </Button>
          ))}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
