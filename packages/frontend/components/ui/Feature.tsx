import { Center, Stack, Text, useColorModeValue as mode } from '@chakra-ui/react'
import * as React from 'react'

interface FeatureProps {
  icon: React.ReactElement
  title: string
  children: React.ReactNode
}

export const Feature = (props: FeatureProps) => {
  const { title, children, icon } = props
  return (
    <Stack direction="column" align="center" textAlign="center" w="100%" spacing="4">
      <Center aria-hidden flexShrink={0} w="8" h="8" p="2" rounded="md" color="green.50" bg="gray.500">
        {icon}
      </Center>
      <Stack>
        <Text as="h3" fontSize="xl" fontWeight="extrabold">
          {title}
        </Text>
        <Text pr="6"  fontWeight="light" color={mode('gray.600', 'gray.300')}>
          {children}
        </Text>
      </Stack>
    </Stack>
  )
}