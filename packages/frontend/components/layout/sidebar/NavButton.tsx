import { As, Button, ButtonProps, HStack, Icon, Text } from '@chakra-ui/react'
import * as React from 'react'

interface NavButtonProps extends ButtonProps {
  icon?: As
  label: string
  href?: string
  target?: string
}

export const NavButton = (props: NavButtonProps) => {
  const { icon, label, ...buttonProps } = props
  return (
    <Button as={props.href ? 'a': null} rightIcon={props.rightIcon} variant="ghost" justifyContent="start" target={props.target} href={props.href} {...buttonProps} size="sm" >
      <HStack spacing="2">
        { 
          icon ? 
          <Icon as={icon} boxSize="4" /> : <></>
        }
        <Text fontWeight="bold">{label}</Text>
      </HStack>
    </Button>
  )
}
