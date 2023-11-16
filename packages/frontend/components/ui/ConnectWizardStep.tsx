import { Box, Center, BoxProps, Text, useColorModeValue } from '@chakra-ui/react'
import * as React from 'react'

interface WizardStepProps extends BoxProps {
  title: string
  children: any
  stepNumber: string
  // isActive : boolean
}

export const ConnectWizardStep = (props: WizardStepProps) => {
  const { title, children, stepNumber } = props

  return (
    <Box
      as="dl"
>

      <Center pb={2}>
        <Center bgColor="green" p={2} w="8" h="8" rounded="full" color="white" fontWeight="bold">
          {stepNumber}
        </Center>
      </Center>

      <Text
        align="center"
        as="dt"
        color={useColorModeValue('gray.600', 'gray.300')}
        fontSize="md"
        fontWeight="extrabold"
        pb={3}
      >
        {title}
      </Text>

      <Text as="dd" align="center" color={useColorModeValue('gray.600', 'white')}>
        {children}
      </Text>
    </Box>
  )
}
