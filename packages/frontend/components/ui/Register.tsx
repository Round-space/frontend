/* eslint-disable @typescript-eslint/no-unused-vars, no-console */
import {
  Center,
  Box,
  FormControl,
  Input,
  Stack,
  Link,
  Button,
  InputRightAddon,
  InputGroup,
  chakra,
} from '@chakra-ui/react'
import React from 'react'
import { WalletConnector } from '../ConnectButton/WalletConnector'

// Takes a long hash string and truncates it.
function truncateHash(hash: string, length = 38): string {
  return hash.replace(hash.substring(6, length), '...')
}

export default function SimpleCard(): JSX.Element {
  return (
    <Center>
      <Stack spacing={8} mx={'auto'} maxW={'lg'} py={2} px={2}>
        <Box rounded={'lg'} p={2} width={'md'}>
          <Stack spacing={4}>
            <FormControl id="userDomain">
              <InputGroup>
                <Input type="userDomain" placeholder="yourdomain" />
                <InputRightAddon>.meed.cc</InputRightAddon>
              </InputGroup>
            </FormControl>
            <FormControl id="email">
              <Input type="emal" placeholder="youremail@email.com" />
            </FormControl>
            <Stack spacing={10}>
            <WalletConnector />
              <Link href="/create">
                <Button colorScheme="blue" w="md">
                  {' '}
                  Submit
                </Button>
              </Link>

              <Center>
                <a>
                  <chakra.h4 as={'u'}> Dont have your wallet setup?</chakra.h4>
                </a>
              </Center>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Center>
  )
}
