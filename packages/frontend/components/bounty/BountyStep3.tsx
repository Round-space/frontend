import { Stack, Box, Heading } from "@chakra-ui/react";



export default function BountyStep3({children}): JSX.Element {
    return(
        <Stack gap={4}>

            
            <Box>
                <Heading>Launch your Round!</Heading>
            </Box>
            { children }
            
        </Stack>
    )
}