import { Box, BoxProps, Text } from '@chakra-ui/react'
import * as React from 'react'

interface Props extends BoxProps {
  name: string
}

export const Quotee = (props: Props) => {
  const { name, ...boxProps } = props
  return (
    <Box {...boxProps}>
      <Box mt="3">
        <Text as="cite" color="gray.300" fontStyle="normal">
          {name}
        </Text>
      </Box>
    </Box>
  )
}
