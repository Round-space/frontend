import React from 'react'
// import { Radio, RadioGroup, Flex, Box } from '@chakra-ui/react'
import { Box, useRadio} from '@chakra-ui/react'

function CustomRadio(props) {
    const { getInputProps, getCheckboxProps } = useRadio(props)
  
    const input = getInputProps()
    const checkbox = getCheckboxProps()
    const isActiveColor = props.activeColor == props.children;
    const isFirstColor = props.activeColor == 'gray'
    const isLastColor = props.activeColor == 'pink'


    // Using Chakra's color theme here - for reference, see https://chakra-ui.com/docs/styled-system/theme#colors
    const labelColor = props.children + '.500'; 
    const highlightedColor = props.children + '.700'

    return (
      <Box as='label'>
        <input {...input} />
        <Box  
          {...checkbox}
          cursor='pointer'
          boxShadow='md'
          height='40px'
          width={['30px','30px','50px']}
          borderBottomLeftRadius={isFirstColor && isActiveColor ? 'xl' : 'none'}
          borderTopLeftRadius={isFirstColor && isActiveColor ? 'xl' : 'none'}

          borderBottomRightRadius={isLastColor && isActiveColor ? 'xl' : 'none'}
          borderTopRightRadius={isLastColor && isActiveColor ? 'xl' : 'none'}

          borderColor={highlightedColor}
          borderWidth={isActiveColor ? '3px' : '0px'}
          backgroundColor={labelColor}
          color='white'
          _checked={{
            backgroundColor: labelColor,
          }}
          _focus={{
            bg: labelColor
        }}
          px={0}
          py={1}
        >
          &nbsp;
        </Box>
      </Box>
    )
  }
  
export default CustomRadio