import { Heading, Box, Text, Circle, Link, Center } from "@chakra-ui/layout"
import { AspectRatio, Flex, Tag, Image, VStack } from "@chakra-ui/react";
import { WalletConnector } from "../ConnectButton/WalletConnector"

const SpecialBox = (props: { children: JSX.Element, index: number, title: string }) => {

    return (
        <VStack width={['100%', '100%', '28%']} mb={5} textAlign="center">
            
            <Text fontSize="md" fontWeight="bold" textAlign="center" color="gray.600" px={6} mb={2} lineHeight="short">{props.title}</Text>
            <AspectRatio
                width={'250px'}
                ratio={1}

            >
<>

                <Box
                    borderRadius='40px'
                    borderColor="gray.200"
                    borderWidth="thick"
                    overflow="visible !important"
                    position="relative"
                    bg="white"
                >
                    <Circle
                        position="absolute"
                        left={-4}
                        top={-4}
                        size="12"
                        zIndex={1}
                        color="white"
                        fontWeight="bold"
                        bg="black">{props.index}</Circle>
                    {props.children}
                </Box>
</>
            </AspectRatio>

        </VStack>
    )
}



export default function Splash(): JSX.Element {

    return (
        <>
            <Image src="/images/splash_page_bg.svg"
                position="fixed"
                zIndex={-1}
                top="0"
                left="0" />
            <Flex mb={12} flexDirection="column">
                <Heading textAlign="center" letterSpacing="tighter" fontWeight="black" lineHeight="none" fontSize={['3xl', '3xl', '5xl']} mb={10}>Build cool stuff with <br/>your community, onchain.
                </Heading>

                <Text color="gray.600" fontWeight="light" fontSize="xl" lineHeight="short" textAlign="center" alignSelf="center" maxW="xl">
                    Launch a Round to grow and reward the contributors in your community. Rounds are onchain and great for community bounties, micro grants programs, hackathons and more!
                    <br /><br />
                </Text>

                <Box alignSelf="center" transform="scale(1.25,1.25);">
                    <WalletConnector simpleButton={true} />
                </Box>
            </Flex>

            <Flex direction="column">
                <Flex justifyContent="center" position="relative" zIndex={1} direction={['column', 'column', 'row']}>
                    <SpecialBox index={1} title="Describe the Round and what you'd like your community to contribute.">
                        <Image src='/images/splash_step1.png' />
                    </SpecialBox>
                    <SpecialBox index={2} title="Set your Round reward details and other options.">
                        <Image src='/images/splash_step2.png'
                            position="absolute"
                            left={-2}
                            transform='scale(1.3)'
                        />
                    </SpecialBox>
                    <SpecialBox index={3} title="Mint the Round onchain and share with your contributors!">
                        <Image src='/images/splash_step3.png'
                            position="absolute"
                            right="1px"
                            bottom="1px"
                            transformOrigin='right bottom'
                            transform='scale(1.2)' />
                    </SpecialBox>
                </Flex>
            </Flex>
            {/* <HStack mt='5' justify="center" align="center">
                <VStack
                    transform="scale(1.25,1.25);"
                    spacing={3}
                >
                    <Text fontWeight="bold">
                        Connect your wallet to create a project.
                    </Text>
                    <WalletConnector simpleButton={true} />
                </VStack>
            </HStack> */}
                <Center mb="5">
                    <Text color="gray.600" textAlign="center">To learn more about how Rounds work, <Link textDecoration="underline" href="https://www.round.space/round/c6cXWMFaRkj7nnRWaz0KbJm0">see one in action</Link> or check the <Link textDecoration="underline" href="https://docs.round.space">Round docs</Link>.</Text>
                </Center>

            <Center fontSize="sm" textAlign="center" my={3}>


                <Tag minWidth="max-content" rounded="full" colorScheme="pink">Coming Soon</Tag>
                <Text color="gray.600" textAlign="left" >&nbsp;NFT Rewards, Automatic Payouts, and much more.</Text>
            </Center>
        </>
    )
}