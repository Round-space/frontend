import {  Text, HStack, Box } from "@chakra-ui/react";
// import { RootState,  useAppSelector } from "../../reducers";
import { truncateHash } from "../../lib/utils";
import Blockies from "react-blockies";



export function AccountBlockie(props): JSX.Element {
    return(
        <HStack bgColor="gray.100" px={3} py={1} borderRadius="3xl">
          <Box borderRadius="20px" overflow="hidden">
            <Blockies seed={props.truncatedAccount.toLowerCase()} size={4} scale={4}
              onClick={props.onClick} />
          </Box>
          <Text fontSize="sm">{ props.ensName ? props.ensName : truncateHash(props.truncatedAccount)}</Text>
        </HStack>
    );


}