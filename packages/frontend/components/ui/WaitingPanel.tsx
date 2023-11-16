import { Box, SkeletonText } from "@chakra-ui/react";
function WaitingPanel() {

    return (
        <Box mb={3} padding='6' border="2px" borderRadius="10px" borderColor='#E2E8F0'>
            <SkeletonText noOfLines={2} spacing='4' />
        </Box>
    )
}
export default WaitingPanel;