import { BoxProps, Divider, Stack, Spacer, Text, useBreakpointValue } from '@chakra-ui/react'
import * as React from 'react'
import { Circle, Icon, SquareProps } from '@chakra-ui/react'
import { HiCheck } from 'react-icons/hi'
import { BsExclamation } from 'react-icons/bs'

interface StepProps extends BoxProps {
  title: string
//   description: string
  index: number
  isCompleted: boolean
  isActive: boolean
//  isLastStep: boolean
  isFirstStep: boolean
  isInvalid: boolean
}


interface RadioCircleProps extends SquareProps {
  isCompleted: boolean
  isActive: boolean,
  index: number,
  isInvalid: boolean
}

export const StepCircle = (props: RadioCircleProps) => {
  const { isCompleted, isActive, index, isInvalid } = props
  return (
    <Circle
      size="8"
      bg={ isInvalid ? 'red' : 'black' }
      color='white'
      borderWidth={isCompleted ? '0' : '2px'}
      borderColor={isActive ? 'accent' : 'inherit'}
    >
      {isCompleted ? (
        <Icon as={isInvalid ? BsExclamation : HiCheck} color="inverted" boxSize="5" />
      ) : (
        <Circle bg={isActive ? 'accent' : 'border'} size="3">
            <Text>{index}</Text>
        </Circle>
      )}
    </Circle>
  )
}

export const Step = (props: StepProps) => {
  const { isActive, isCompleted, isFirstStep, title, index, isInvalid, cursor, onClick } = props
  const isMobile = useBreakpointValue({ base: true, lg: false })

  const orientation = useBreakpointValue<'horizontal' | 'vertical'>({
    base: 'vertical',
    lg: 'horizontal',
  })

  return (
    <Stack id="stepid" direction={{ base: 'row', md: 'column' }} flex="1" cursor={cursor} onClick={onClick} opacity={isActive || isCompleted ? 1 : 0.3}>
      <Stack spacing="0" align="center" direction={{ base: 'row', md: 'row' }}>  
        <Divider
          display={isMobile ? 'none' : 'initial'}
          pr={!isFirstStep ? "20" : ""}
          orientation={orientation}
          borderWidth="1px"
          borderStyle="dashed"
          borderColor={isFirstStep ? 'transparent' : isCompleted || isActive ? 'accent' : 'inherit'}
        />
        <StepCircle isActive={isActive} isCompleted={isCompleted} index={index} isInvalid={isInvalid} />
        {isMobile ? <Spacer /> : ""}
        <Stack
        align={{ base: 'start', md: 'center' }}>
        <Text color="emphasized" fontWeight="medium" m={isMobile ? "2" : "2"}>
          {title}
        </Text>
        {/* <Text color="muted">{description}</Text> */}
      </Stack>
      </Stack>
      
    </Stack>
  )
}