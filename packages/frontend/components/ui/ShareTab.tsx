import {
    HStack,
    Box,
    Button,
    Text,
    Input,
    useClipboard,
} from '@chakra-ui/react'

const ShareTab = (props) => {
    const { url } = props;
    const { hasCopied, onCopy } = useClipboard(url)

    return (
        <>
        <Box borderWidth="thin" p={5} borderRadius="xl" boxShadow="base" bgColor="white">
                <HStack alignItems="center">
                    <Text as="b" fontSize="sm">Share</Text>
                    <Input p={1} fontSize="sm" height="min" value={url} isReadOnly />
                    <Button fontSize="sm" onClick={onCopy} ml={3} px={5} py={2} height="min">
                        {hasCopied ? "Copied!" : "Copy"}
                    </Button>
                </HStack>
            </Box>
        </>
    )
}

export default ShareTab;