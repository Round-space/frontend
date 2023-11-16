import Blockies from "react-blockies";
import {
    HStack,
    Box,
    forwardRef,
  } from '@chakra-ui/react'


const  AccountButton  = forwardRef((props, ref) => {
    const { children, ...rest } = props
    const account = props.account;
    return(
        <HStack ref={ref} {...rest} >
            <Box borderRadius="20px" overflow="hidden">
                <Blockies seed={account?.toLowerCase()} size={8} scale={4} onClick={props.onClick}></Blockies>
            </Box>
            <b>{children}</b>
        </HStack>

    )
});

export default AccountButton;