import {
  Button,
  Avatar,
  Text,
  ButtonProps,
  chakra,
  forwardRef,
  Tooltip,
} from '@chakra-ui/react'
import { dataAttr } from '@chakra-ui/utils'
import * as React from 'react'
import { motion } from 'framer-motion'
import makeBlockie from 'ethereum-blockies-base64'
import { useRouter } from 'next/router'

const SwitchBox = chakra('div', {
  baseStyle: {
    position: 'absolute',
    h: 'full',
    w: 'full',
    px: '0.5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    '&[data-isleft=""]': {
      justifyContent: 'flex-start',
    },
  },
})

const MotionAvatarHolder = motion(chakra.div)

const MotionAvatar = motion(Avatar)

const MotionText = motion(chakra(Text, { baseStyle: {} }))

// Takes a long hash string and truncates it.
function truncateHash(hash: string, length = 38): string {
  return hash.replace(hash.substring(6, length), '...')
}

type ConnectButtonProps = {
  connected: boolean
  connecting: boolean
  ensName?: string
  address?: string
  ensImgSrc?: string
} & ButtonProps

export const ConnectButton = forwardRef<ConnectButtonProps, 'button'>(
  ({ ensName, ensImgSrc, address, connected, connecting, ...rest }, ref) => {
    // const hasData = Boolean(ensName) || Boolean(address)
    
    const imgSrc = ensImgSrc ?? ((connected && address !== null) ? makeBlockie(address) : undefined)
    // check if it is the homepage
    const router = useRouter()
    const isHomepage = router.pathname === '/' || router.pathname === '/bounty/create'
    const avatarBorder = 
      (connected && isHomepage) ? "2px solid green" :
      (connected && !isHomepage) ? "2px solid green" :
      (!connected && isHomepage) ? "2px solid #1A202C" :
      (!connected && !isHomepage) ? "2px solid #878787" : "";

    const [ discIsLeft, setDiscIsLeft ] = React.useState(connected || connecting);
    
    React.useEffect(() => {
      setDiscIsLeft(connected || connecting)
    }, [connected, connecting])

    return (
      <Tooltip label={address} hasArrow w={56}>
        <Button
          size="md"
          variant="connect"
          {...rest}
          data-connected={dataAttr(connected)}
          ref={ref}
        >
          {/* <AnimatePresence exitBeforeEnter initial={false}> */}
            {!connected && !connecting && (
              <MotionText
                key="connect"
                transition={{ duration: 0.5 }}
                isTruncated
                ml={-6}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                letterSpacing='tight'
              >
                Connect Wallet
              </MotionText>
            )}
            {connecting && (
              <MotionText
                key="connecting"
                isTruncated
                ml={5}
                transition={{ duration: 0.3 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                letterSpacing='tight'
              >
                Connecting...
              </MotionText>
            )}
            {connected && !ensName && address && (
              <MotionText
                key="address"
                isTruncated
                pl={6}
                transition={{ duration: 0.3 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                color='green'
                fontWeight='bold'
                letterSpacing='tight'
              >
               {truncateHash(address)}
              </MotionText>
            )}
            {connected && ensName && (
              <MotionText
                key="ensAddress"
                isTruncated
                initial={{ opacity: 0 }}
                pl={6}
                animate={{ opacity: 1 }}
                color='green'
                transition={{ duration: 0.3 }}
                exit={{ opacity: 0 }}
                letterSpacing='tight'
              >
                {ensName}
              </MotionText>
            )}
          {/* </AnimatePresence> */}
          <SwitchBox data-isleft={ dataAttr(discIsLeft) }>
            <MotionAvatarHolder layout transition={{ duration: 0.5 }}>
              {/* <AnimatePresence exitBeforeEnter> */}
                <MotionAvatar
                  key={imgSrc}
                  transition={{ duration: 0.3 }}
                  size="sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  src={imgSrc}
                  border={avatarBorder}
                  bg={isHomepage ? "#1A202C": "#878787" }
                  icon={<React.Fragment />}
                />
              {/* </AnimatePresence> */}
            </MotionAvatarHolder>
          </SwitchBox>
        </Button>
      </Tooltip>
    )
  }
)
