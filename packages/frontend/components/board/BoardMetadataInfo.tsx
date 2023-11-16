import {
  Link,
  Image,
  Spacer,
  HStack,
  Box,
  Text,
  SimpleGrid,
  Flex,
  Stack,
  Skeleton
} from '@chakra-ui/react'
import { RootState, useAppSelector } from '../../reducers'
import { AccountBlockie } from '../ui/AccountBlockie'
import { FaTwitter, FaGlobe, FaDiscord } from 'react-icons/fa'
import BoardSubscribe from './BoardSubscribe'


export function BoardMetadataInfo(props): JSX.Element {
  
  const metadata = useAppSelector((state: RootState) => {
    return props.dashBoard
      ? state.dashBoard.metadata
      : state.bountyBoard.metadata
  })

  const account = metadata.account ? metadata.account : 'account'
  //const subscribePlacerholder = "Add an Email, Discord, or Telegram account";

  const addProtocol = (link) => {
    // if the link does not have a protocol, add //
    if (!link.startsWith('http') && !link.startsWith('//')) {
      link = '//' + link
    }

    return link
  }
  const twitter = metadata.twitter ? addProtocol(metadata.twitter) : null
  const website = metadata.website ? addProtocol(metadata.website) : null
  const discord = metadata.discord ? addProtocol(metadata.discord) : null
  if (account === "account") {
    return (
      <Stack>
        <Skeleton height="200px" backgroundColor="white" borderColor="gray.100" borderRadius="2xl" />
      </Stack>
    )
  }

  const iconSize = 30;

  return (
    <SimpleGrid columns={[1, 1, 1]} spacing={[0, 0, 0]}>
      <Box
        borderRadius="2xl"
        boxShadow="md"
        borderWidth="thin"
        p={6}
      >
        <Flex direction={{ base: 'column', md: 'row' }}>
          <Image alignSelf={{ base: 'center', md: 'left' }} borderRadius="3xl" src={metadata.imageUrl} width={['100px','100px','200px']} border="" boxShadow="base"></Image>
          <Flex
            direction="column"
            textAlign={['center','center','left']}
            paddingLeft={{ base: '0', md: '5' }}
            mb={['5','5','0']}
          >
            <Text fontSize="xx-large" fontWeight="bold" letterSpacing="tight" pb="1">{metadata.name}</Text>
            <Text pb={2} noOfLines={[4,4]}>{metadata.description}</Text>
            <HStack justify={['center','center','left']}>
              {website ? (
                <Link href={website} isExternal>
                  <FaGlobe size={iconSize} color="gray" />
                </Link>
              ) : (
                ''
              )}
              {twitter ? (
                <Link href={twitter} isExternal>
                  <FaTwitter size={iconSize} color="gray" />
                </Link>
              ) : (
                ''
              )}
              {discord ? (
                <Link href={discord} isExternal>
                  <FaDiscord size={iconSize} color="gray" />
                </Link>
              ) : (
                ''
              )}
            </HStack>
            <HStack display={['none','none','inherit']} mt={1}>
              <Box fontSize="small" color="gray.400">
                Wallet:
              </Box>
              <Flex>
                <AccountBlockie truncatedAccount={account} ensName={props.ensName} />
              </Flex>
            </HStack>
          </Flex>
          <Spacer />
          <Box>
            <BoardSubscribe board={metadata.id} isDashboard={props.dashBoard} themeColor={metadata.themeColor} />
            <Spacer />
          </Box>
        </Flex>
      </Box>
    </SimpleGrid>
  )
}
