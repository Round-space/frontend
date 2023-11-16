import { Box, Circle, useColorModeValue } from '@chakra-ui/react'
import * as React from 'react'

interface StepProps {
  state: 'active' | 'complete' | 'incomplete'
  label?: string
  children?: React.ReactNode
}

export const Step = (props: StepProps) => {
  const { label, children, state } = props

  const isCompleted = state === 'complete'
  const isIncompleted = state === 'incomplete'

  const inCompletedColor = useColorModeValue('gray.300', 'gray.300')
  const defaultColor = useColorModeValue('white', 'gray.300')
  const completedBg = useColorModeValue('green.500', 'green.300')
  const incompletedBg = useColorModeValue('gray.300', 'gray.300')

  return (
    <Box as="li" display="inline-flex">
        <Circle
          aria-hidden
          zIndex={1}
          position="relative"
          size="8"
          bg={isCompleted ? completedBg : incompletedBg} // set background based on incomplete, active, or complete
        >
          <Box as="span" color={isIncompleted ? inCompletedColor : defaultColor} fontWeight="bold">
            {children}
          </Box>
        </Circle>
        <Box srOnly>{isCompleted ? `${label} - Completed` : label}</Box>
    </Box>
  )
}