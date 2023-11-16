import {
    Box,
    Text,
    Link,
    HStack,
    Stack,
} from '@chakra-ui/react'

//import { ExternalLinkIcon, StarIcon, LinkIcon } from '@chakra-ui/icons'
import { FaDiscord, FaTwitter, FaGithub, FaFigma, FaGoogleDrive } from 'react-icons/fa'
import { SiNotion, SiReplit } from 'react-icons/si'
import { BiWorld } from 'react-icons/bi'


const workspaceIcon = (workspaceUrl) => {
    const iconSize = 28; // Supported sizes are 14,28,42,56,70

    return (
        workspaceUrl.includes("twitter.com") ? <FaTwitter color="#00aced" size={iconSize} /> :
        workspaceUrl.includes("discord.com") ? <FaDiscord color="#7289DA" size={iconSize} /> :
        workspaceUrl.includes("repl.co") ? <SiReplit color="#56676e" size={iconSize} /> :
        workspaceUrl.includes("github.com") ? <FaGithub color="#171515" size={iconSize} /> :
        workspaceUrl.includes("figma.com") ? <FaFigma color="#5ECC8A" size={iconSize} /> :
        workspaceUrl.includes("docs.google.com/document") ? <FaGoogleDrive color="#518EF5" size={iconSize} /> :
        workspaceUrl.includes("docs.google.com/spreadsheets") ? <FaGoogleDrive color="#21A564" size={iconSize} /> :
        workspaceUrl.includes("docs.google.com/presentation") ? <FaGoogleDrive color="#EEB212" size={iconSize} /> :
        workspaceUrl.includes("notion.com") ? <SiNotion color="#000000" size={iconSize} /> :
        workspaceUrl.includes("notion.site") ? <SiNotion color="#000000" size={iconSize} /> :
        <BiWorld size={iconSize} />
    )
}

// const workspaceLabel = (workspaceUrl) => {
//     return (
//         workspaceUrl.includes("twitter.com") ? "Twitter" :
//         workspaceUrl.includes("discord.com") ? "Discord" :
//         workspaceUrl.includes("github.com") ? "Github" :
//         workspaceUrl.includes("figma.com") ? "Figma" :
//         workspaceUrl.includes("docs.google.com/document") ? "Docs" :
//         workspaceUrl.includes("docs.google.com/spreadsheets") ? "Sheets" :
//         workspaceUrl.includes("docs.google.com/presentation") ? "Slides" :
//         workspaceUrl.includes("notion.com") ? "Notion" :
//         workspaceUrl.includes("notion.site") ? "Notion" :
//         "Link"
//     )
// }

const WorkspaceLinks = (props) => {
    if (props.url?.length == 0) { return <></> }
    else
        return (
            <>
                {/* <Heading as="h2" mt={10} mb={2} size="xs" color="gray.600">Resources:</Heading> */}

                <Stack spacing={2} direction={{lg: 'row', base: 'column'}} justify='start'>
                    {props.url?.split('\n').slice(0, 3).map(function (item, index) {
                        if (item == '') return
                        else {
                            return (
                                <Box key={index} alignContent="left" padding={2}>
                                    <HStack>
                                        <Link href={item} isExternal>
                                            {workspaceIcon(item)}
                                        </Link>
                                        <Box>
                                            {/* <Box color='gray.500'
                                                fontWeight='semibold'
                                                letterSpacing='wide'
                                                fontSize='xs'
                                                textTransform='uppercase'
                                                display={["none","inherit","inherit"]}
                                            >
                                                {workspaceLabel(item)}
                                                </Box> */}
                                            <Box 
                                            isTruncated color='black' 
                                            fontSize={ {lg: 'md', base: 'sm'} }
                                            textDecor='underline'
                                            display={["none","inherit","inherit"]}
                                            >
                                                {externalLink(item)}
                                            </Box>
                                        </Box>
                                    </HStack>
                                </Box>
                            )
                        }
                    })
                    }
                </Stack>
            </>
        )
}

export default WorkspaceLinks;

function externalLink (item: any) {
    return (<Link href={item.includes("http") ? item : "//" + item} isExternal rel="noreferrer">
        <Text maxWidth="48" isTruncated>{item}</Text>
    </Link>)
}

