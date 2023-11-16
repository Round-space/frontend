/* eslint-disable @typescript-eslint/no-unused-vars, no-console ,react/no-unescaped-entities,react/no-children-prop */
import {
    Box,
    Heading,
    Flex,
    Text,
    VStack,
    Tag,
    Progress,
    Spacer,
    Button,
    Link,
    IconButton,
    HStack,
    FormControl,
    Input,
    Textarea,
} from '@chakra-ui/react'

import WorkspaceLinks from './WorkspaceLinks'
import ProgressBar from './ProgressBar'

export default function BountyPreview({ name, description, bountyPrice, tokenSymbol, tokenAmount, deadline, url, preview }): JSX.Element {
    // For title & description (placeholders and user inputted values)
    const placeholderTitle: string[] = ["This is your bounty title"]
    const placeholderDescription: string[] = ["A good bounty is simple to understand, and has a clear definition of completion."]
    const title = name == '' ? placeholderTitle : name;
    const desc = description == '' ? placeholderDescription : description.split('\n');

    // For token reward (crypto and fiat)
    const fiatValue = (Math.round(bountyPrice * 100) / 100).toFixed(2)

    return (
        <Flex p={10} direction="column">
            <Box top={-20} pos="relative" left="0" >
                <Flex mb={5} direction="row">

                    <Box mb={5} border="2px"   backgroundColor="green.500" borderColor="green.500" borderRadius={4}  pl={8} pr={8} pb={1} pt={1} color='#FFF' >
                        <VStack>
                            <Heading as="h4" size="md">
                                {tokenAmount} {tokenSymbol}
                            </Heading>
                            <Text fontSize="sm">
                                (${fiatValue})
                            </Text>
                        </VStack>
                    </Box>

                    <Spacer />

                    <Tag cursor="default" height="20px" borderRadius="15px" size="sm" key="sm" variant="outline" colorScheme="yellow">
                        PREVIEW
                    </Tag>

                </Flex>
                {/* Bounty title is the first line of the text area */}
                <Heading as="h4" size="md">
                    {title}
                </Heading>

                {/* Bounty description is the second+ line of the text area */}
                <Text
                    fontSize="xl"
                    noOfLines={8}
                    mb={5} >
                    {desc.map(function (item, index) {
                        return (
                            <span key={index}>
                                {item}
                                <br />
                            </span>
                        )
                    })}
                </Text>

                <ProgressBar creationDate={undefined} deadline={deadline} />

                <WorkspaceLinks url={url} />

                <Spacer />

                <Box borderWidth="2px" borderRadius="lg" padding="10px" mt={5}>
                    <Heading mb={3} as="h4" size="md" color="lightgrey">
                        Submit an entry
                    </Heading>

                    <FormControl id="submitterEmail">
                        <Input disabled type="email" placeholder="Your Email" />
                    </FormControl>

                    <FormControl id="workDescription" mt={1}>
                        <Textarea disabled
                            placeholder="Describe your work"
                            mt={1}
                            rows={3}
                            shadow="sm"
                        />
                    </FormControl>

                    <Button
                        width="100%"
                        colorScheme='blue' disabled>
                        Submit your work
                    </Button>
                </Box>
            </Box >

        </Flex >
    )
}
