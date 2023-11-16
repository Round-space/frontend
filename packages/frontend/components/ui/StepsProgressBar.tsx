import { AbsoluteCenter, AbsoluteCenterProps, Box, useColorModeValue } from '@chakra-ui/react'
import * as React from 'react'

interface ProgressbarProps extends AbsoluteCenterProps {
  value: number
}

export const StepsProgressBar = (props: ProgressbarProps) => {
  const { value, ...rest } = props
  return (
    <AbsoluteCenter
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      aria-valuetext={`Progress: ${value}%`}
      position="absolute"
      height="2"
      axis="vertical"
      bg={useColorModeValue('gray.300', 'gray.300')}
      width="full"
      {...rest}
    >
      <Box bg={useColorModeValue('green.500', 'green.300')} height="inherit" width={`${value}%`} />
    </AbsoluteCenter>
  )
}

