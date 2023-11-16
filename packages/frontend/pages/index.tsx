/* eslint-disable @typescript-eslint/no-unused-vars, no-console */
import {
  Image,
  Text,
  Button,
  Heading,
  Stack,
  Box,
  ButtonGroup,
  IconButton,
  SimpleGrid,
  LinkBox,
  LinkOverlay,
  Spacer,
  Divider,
  Center,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react';


import { FaTwitter, FaDiscord, FaEthereum, FaGithub } from 'react-icons/fa';


import React from 'react';
import { WalletConnector } from '../components/ConnectButton/WalletConnector'
import { useRouter } from 'next/router';
import { useAccount, useConnect } from 'wagmi';
import Link from 'next/link';
import Head from 'next/head';
// import { connect } from 'http2';

const logos = [
  {
    title: '0xSplits',
    url: '/images/landing/logos/0xSplits_Logo.png'
  },
  {
    title: 'DAO Research Collective',
    url: '/images/landing/logos/DRC_Logo.png'
  },
  {
    title: '0xMacro',
    url: '/images/landing/logos/Macro_Logo.png'
  },
  {
    title: '',
    url: '/images/landing/logos/Metagame_Logo.png'
  },
  {
    title: '0xMacro',
    url: '/images/landing/logos/SCRF_Logo.png'
  },
]

const footerLinks = [
  {
    title: 'Company',
    links: [
      { label: 'Lab0324', href: 'https://www.lab0324.xyz' },
      { label: 'Careers', href: 'https://www.lab0324.xyz' },
    ],
  },
  {
    title: 'Product',
    links: [
      { label: 'Round.space', href: 'https://round.space/' },
      { label: 'Round.new', href: 'https://round.new' },
      { label: 'Product Guides', href: 'https://docs.round.space/product-guides' },
      { label: 'Protocol Docs', href: 'https://docs.round.space/protocol' },
    ],
  },
  {
    title: 'Community',
    links: [
      { label: 'Discord', href: 'https://discord.gg/JKjY5tmvSu' },
      { label: 'Github', href: 'https://www.github.com/lab0324/aikido' },
      { label: 'Twitter', href: 'https://www.twitter.com/launchround' },
    ],
  },
  // {
  //   title: 'Legal',
  //   links: [
  //     { label: 'Terms of Service', href: '#' },
  //     { label: 'Privacy Policy', href: '#' },
  //   ],
  // },
]


export default function LandingPage({ url }: any): JSX.Element {
  const { data: accountData } = useAccount();
  const account = accountData?.address
  const { isConnected: connected } = useConnect();
  const router = useRouter();
  const gotoDashboard = () => {
    router.push("/dashboard/" + account);
  }


  return (
    <>
      <Head>
        <meta property="og:title" content="Round" />
        <meta property="og:description" content="Round is a tool for onchain collective action." />
        <meta property="og:image" content={url + 'images/landing/og.png'} />
        <meta property="og:url" content="https://round.space" />
        <meta name="twitter:title" content="Round" />
        <meta name="twitter:description" content="Round is a tool for for on-chain collective action." />
        <meta name="twitter:image" content={url + 'images/landing/og.png'} />

      </Head>
      {/* Gradient */}
      <Text>{ }</Text>
      {/* Hero */}
      <Box as="section" color="gray.800" pt={['10', '20']}>
        <Box maxW={{ base: 'xl', md: '6xl' }} mx="auto" px={{ base: '6', md: '6' }}>
          <Box maxW={{ base: 'xl', md: '6xl' }} textAlign="center">
            <Heading
              as="h1"
              size="3xl"
              fontWeight="light"
              maxW="4xl"
              mx="auto"
              lineHeight="0.95"
              letterSpacing="tighter"
              mb={10}
              color="gray.700"
            >
              Round helps you build amazing <b>contributor networks</b>.
            </Heading>
            <Text fontSize="2xl" maxW="2xl" mx="auto" mb={5} letterSpacing="tight" fontWeight="normal" lineHeight="short" color="gray.700" >
              Use Round to <b>grow and reward the contributors in your community</b>. Rounds are onchain and great for community bounties, micro grants programs, hackathons and more.
            </Text>

              <Button
                onClick={gotoDashboard}
                py={3}
                colorScheme="purple"
                variant= {!connected ? "outline" : "solid"}
                borderWidth={!connected && "medium"}
                isDisabled={!connected}
                fontWeight="bold"
                fontSize="large"
                size="lg"
                borderRadius="full">
                Setup a Space
              </Button>
              {!connected && <Text>(You&apos;ll need to connect your wallet first)</Text>}
          </Box>
          <Spacer my="10" />


          {/* Support From */}
          <Center zIndex="0" position="relative" as="section" >
            <Center zIndex="0" maxW={{ base: 'xl', md: '4xl' }} boxShadow="lg" rounded="2xl" borderWidth="medium" borderColor="gray.700">
              <Image zIndex="0" src="/images/landing/space-screencap.png" rounded="2xl" />
            </Center>
          </Center>

          <Box
            position="relative"
            zIndex="1"
            boxShadow="xl"
            mt="20"
            bg={useColorModeValue('gray.700', 'gray.700')}
            borderColor="gray.50" borderWidth={3}
            rounded="3xl"
            maxW={{ base: 'xl', md: '6xl' }}
            p="6"
            mx="auto"
            mb="20"
            px={{ base: '6', md: '8' }}
          >
            <Text align="center" textColor="gray.50" fontSize="sm" fontWeight="extrabold">
              QUICK START
            </Text>
            <Divider my={2} />

            <SimpleGrid color={useColorModeValue('gray.50', 'gray.50')} columns={{ base: 1, md: 3 }} spacing="6">
              <Box>
                <Text
                  align="left"
                  as="dt"
                  fontSize="md"
                  fontWeight="extrabold"
                  pb={1}>
                  Connect your Wallet
                </Text>
                <Text size="md">Your Ethereum wallet is your primary login for Round.</Text>
                <Spacer mb={1} />
                <WalletConnector simpleButton="true" />

              </Box>
              <Box>
                <Text
                  align="left"
                  as="dt"
                  fontSize="md"
                  fontWeight="extrabold"
                  pb={1}>
                  Build a Space
                </Text>
                <Text size="md">Create a workspace to distribute token rewards (multisig friendly).</Text>
                <Spacer mb={1} />
                {LinkButton(`/dashboard/` + account, "Manage Your Space →", connected)}
              </Box>
              <Box>
                <Text
                  align="left"
                  as="dt"
                  fontSize="md"
                  fontWeight="extrabold"
                  pb={1}>
                  Launch a Round
                </Text>
                <Text size="xs">Create an onchain round for your community.</Text>
                <Spacer mb={1} />
                {LinkButton("https://round.new/", "Visit round.new →", connected)}
              </Box>
            </SimpleGrid>
            <Spacer my={5} />
            <Text my={2} textColor="gray.50" fontSize="sm" fontWeight="extrabold" align="center">
              GET INVOLVED
            </Text>
            {/* <Divider my={2} /> */}
            <Center>
              <Flex direction={['column', 'row', 'row']} as="dd" color={useColorModeValue('gray.100', 'gray.100')}>
                <Button mx={['0', '0', '2']} color="gray.700" backgroundColor="gray.200" rounded="full" size="sm" leftIcon={<FaTwitter />}>
                  <Link href="https://docs.round.space" target="_blank" rel="noreferrer" >Read the Docs</Link>
                </Button>
                <Spacer py={1} />

                <Button mx={['0', '0', '2']} color="gray.700" backgroundColor="gray.200" rounded="full" size="sm" leftIcon={<FaDiscord />}>
                  <Link href="https://discord.gg/JKjY5tmvSu" target="_blank" rel="noreferrer" >Join the Discord</Link>
                </Button>
                <Spacer py={1} />

                <Button mx={['0', '0', '2']} color="gray.700" backgroundColor="gray.200" rounded="full" size="sm" leftIcon={<FaTwitter />}>
                  <Link href="https://twitter.com/launchround" target="_blank" rel="noreferrer" >Follow on Twitter</Link>
                </Button>
              </Flex>
            </Center>
          </Box>
        </Box>
      </Box>


      {/* See it in Action */}
      {/* <Box as="section" pb="20">
    <Box>
      <Box maxW={{ base: 'xl', md: '5xl' }} mx="auto" px={{ base: '6', md: '8' }}>
        {sectionHeadings('See it in Action', 'Rounds can be used for community bounties, grants, hackathons, and more.', false)}
      </Box>
    </Box>
    <Box>
      <Box maxW={{ base: 'xl', md: '8xl' }} mx="auto" px={{ base: '6', md: '8' }}>
        <HStack overflowX="scroll" align="stretch" overflowY="hidden" spacing="5" py={3}>

          {showcaseExample(
            "/images/landing/examples/aikido-protocol.png",
            "Aikido Grants & Bounties",
            "Aikido Grants & Bounties",
            "See how Aikido uses workspaces to manage protocol development with our community using bounties, grants, and hackathons.",
            "Visit →",
            "https://www.round.space/space/0x89D160D5AD0eAE27eBc115f70f43E91eeaB42EcA")}


          {showcaseExample(
            "/images/landing/examples/daoresearch.png",
            "DAO Research Collective",
            "DAO Research Collective",
            "The DAO Research Collective (DRC) is a non-profit that accelerates DAO functionality by funding and facilitating DAO research.",
            "Visit →",
            "https://www.round.space/space/0x0CcCaa2b08555Ac2eFc05CFB66fAd16DC8EEfC38")}

          {showcaseExample(
            "/images/landing/examples/crowdaudits.png",
            "Crowdaudits.xyz",
            "Crowdaudits.xyz",
            "Crowdsourced Audits for any contract - a marketplace built on Aikido.",
            "Coming Soon",
            "#")}

          {showcaseExample(
            "/images/landing/examples/splits.png",
            "0xSplits",
            "0xSplits",
            "Bounties for 0xSplits, The standard for splitting onchain income",
            "Visit →",
            "https://www.round.space/space/0xsplits.eth")}


          {showcaseExample(
            "/images/landing/examples/metagame.png",
            "The Metagame",
            "The Metagame",
            "You’re playing it right now. Infrastructure for aesthetically pleasing NFTs earned by your on-chain and off-chain activity.",
            "Visit →",
            "https://www.round.space/space/the-metagame.eth")}

        </HStack>
      </Box>
    </Box>
  </Box> */}

      {/* Support From */}
      <Box as="section" pb="20" px={{ base: '6', md: '8' }} >
        <Box>
          <Box maxW={{ base: 'xl', md: '5xl' }} mx="auto" px={{ base: '6', md: '8' }}>
            {sectionHeadings('', 'Built with support from', false)}
          </Box>
        </Box>

        <Box as="section">
          <Box maxW={{ base: 'xl', md: '3xl' }} mx="auto" px={{ base: '6', md: '8' }}>
            <Box >
              <SimpleGrid columns={3}>
                <Center>
                  <Image width="150px" src="/images/landing/logos/ef-logo.png" />
                </Center>
                <Center>
                  <Image width="110px" src="/images/landing/logos/zg-logo.png" />
                </Center>
                <Center>
                  <Image width="120px" src="/images/landing/logos/gv-logo.png" />
                </Center>
              </SimpleGrid>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Testimonial */}
      {/* <Box as="section" color="gray.800">
        <Box maxW={{ base: 'xl', md: '5xl' }} mx="auto" px={{ base: '6', md: '6' }}>
            <Box
              bg={useColorModeValue('gray.700', 'gray.700')} 
              borderColor="gray.50" borderWidth={3} boxShadow="md"
              rounded="3xl" 
              maxW={{ base: 'xl', md: '5xl' }} 
              p="6" 
              mx="auto"
              mb="20"
              px={{ base: '6', md: '8' }}
              >
              <Box maxW={{ base: 'xl', md: '5xl' }} mx="auto" px={{ base: '6', md: '8' }}>
            {sectionHeadings('Trusted by the community', 'Aikido is used by DAOs, protocols, research communities, open source projects and more.', true)}
          </Box>

          <Stack maxW={{ base: 'xl', md: '5xl' }} mx="auto" px={{ base: '6', md: '8' }} spacing="4">
          <SimpleGrid gap={{ base: '1', md: '4' }} columns={{ base: 2, md: 5 }}>
            {logos.map((logo, idx) => (
              <Center key={idx}>
                <Image alt={logo.title} width="100px" src={logo.url}></Image>
              </Center>
            ))}
          </SimpleGrid>
        </Stack>

        <Box maxW="2xl" mx="auto" px={{ base: '6', md: '8' }} pt="12">
          <Flex mt="0" direction="column" align="center" textAlign="center">
            <QuoteIcon
              color={useColorModeValue('gray.600', 'gray.600')}
              fontSize={{ base: '3xl', md: '6xl' }}
              mb="6"
            />
            <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="medium" color="gray.100">
              Of all the tools we tried in this category, Aikido is the one that&#39;s best suited to the way teams work in web3.
            </Text>
            <Quotee
              name="Sergio Azirav, Tools Lead @ BanklessDAO"
              mt="2"
            />
          </Flex>
        </Box>
            </Box>
        </Box>
      </Box> */}



      {/* How it Works */}
      {/* <Box as="section" pb="20" px={{ base: '6', md: '8' }} >
        <Box>
          <Box maxW={{ base: 'xl', md: '5xl' }} mx="auto" px={{ base: '6', md: '8' }}>
            {sectionHeadings('How it Works', 'On-chain work with custodied rewards, listed across any marketplace.', false)}
          </Box>
        </Box>

        <Box maxW={{ base: 'md', md: '5xl' }} overflow="clip" mx="auto" mb="10" boxShadow="md" borderWidth="thin" rounded="3xl" >
          <video src="/images/landing/protocol-animation.mp4" autoPlay muted playsInline poster="/images/landing/protocol-diagram.png"></video>
        </Box>

        <Box as="section">
          <Box maxW={{ base: 'xl', md: '5xl' }} mx="auto" px={{ base: '6', md: '8' }}>
            <Box >
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={{ base: '1', sm: '2', md: '4' }}>
                <Feature icon={<Box as={TbFreeRights} w="5" h="5" />} title="Free Forever">
                  Built as a <a href="https://jacob.energy/hyperstructures.html">hyperstructure</a>, and will exist as long as Ethereum.
                </Feature>
                <Feature icon={<Box as={TiFlowMerge} w="6" h="6" />} title="Flexible">
                  Useful for grants, hackathons, bounties, and much more.
                </Feature>
                <Feature icon={<Box as={BsLink} w="6" h="6" />} title="On-Chain">
                  A true on-chain record of work as it happens.
                </Feature>
                <Feature icon={<Box as={FaCode} w="6" h="6" />} title="Open Source">
                  The protocol and tools are open source.
                </Feature>
              </SimpleGrid>
            </Box>
          </Box>
        </Box>
        <Center mt={5}>
          {LinkButton("https://docs.aikido.work", "Check the Docs to Learn More →",true)}
        </Center>

      </Box> */}

      {/* Built on Aikido */}
      {/* <Box as="section" mb="20">
        <Box>
          <Box maxW={{ base: 'xl', md: '5xl' }} mx="auto" px={{ base: '6', md: '8' }}>
            {sectionHeadings('Built on Aikido.', 'Apps that use on-chain bounties and grants.', false)}
          </Box>
        </Box>

        <Box>
          <Box maxW={{ base: 'xl', md: '5xl' }} mx="auto" px={{ base: '6', md: '8' }}>
            <SimpleGrid columns={{ base: 1, md: 1, lg: 3 }} spacing="14">

              {carouselElement(
                "/images/landing/workspace-screencap.png",
                "Screenshot of Aikido App",
                "Workspaces",
                "Create a workspace to manage all your on-chain bounties, tied to a wallet or multisig.",
                "https://aikido.work/dashboard")}

              {carouselElement(
                "/images/landing/bountywizard-screencap.png",
                "Screenshot of Aikido App",
                "Bounty.new",
                "Create a standalone on-chain bounty to share with your community.",
                "https://bounty.new")}


              {carouselElement(
                "/images/landing/docs-screencap.png",
                "Product and Protocol Documentation",
                "Product and Protocol Documentation →",
                "Learn about how the protocol works, and product user guides.",
                "https://docs.aikido.work")}
            </SimpleGrid>
          </Box>
        </Box>
      </Box> */}

      {/* Footer */}
      <Box as="footer" rounded="3xl" backgroundColor="gray.200" mb="20" mx={{ base: '5', md: '20' }} role="contentinfo" px={{ base: '16' }} py={{ base: '5', md: '5' }}>
        <Stack
          justify="space-between"
          align="start"
          direction={{ base: 'column', lg: 'row' }}
          py={{ base: '6', md: '8' }}
          spacing="8"
        >
          <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} gap="8" width={{ base: 'auto', md: 'auto' }}>
            {footerLinks.map((group, idx) => (
              <Stack key={idx} spacing="4" minW={{ lg: '40' }}>
                <Text fontSize="sm" fontWeight="semibold" color="subtle">
                  {group.title}
                </Text>
                <Stack spacing="3" shouldWrapChildren>
                  {group.links.map((link, idx) => (
                    <Button key={idx} as="a" variant="link" href={link.href}>
                      {link.label}
                    </Button>
                  ))}
                </Stack>
              </Stack>
            ))}
          </SimpleGrid>
        </Stack>
        <Divider />
        <Stack
          pt="8"
          pb="12"
          justify="space-between"
          direction={{ base: 'column-reverse', md: 'row' }}
          align="center"
        >
          <Text fontSize="sm" fontWeight="extrabold" color="subtle">
            Round is a product of Lab 0324.
          </Text>
          <ButtonGroup variant="ghost">
            <IconButton
              as="a"
              href="https://www.github.com/lab0324"
              aria-label="Github"
              icon={<FaGithub fontSize="1.25rem" />}
            />
            <IconButton
              as="a"
              href="https://www.twitter.com/launchround"
              aria-label="Twitter"
              icon={<FaTwitter fontSize="1.25rem" />}
            />
            <IconButton
              as="a"
              href="https://discord.gg/JKjY5tmvSu"
              aria-label="Discord"
              icon={<FaDiscord fontSize="1.25rem" />}
            />
          </ButtonGroup>
        </Stack>
      </Box>
      {/* </Box> */}
    </>
  );

  function showcaseExample(imgSrc, alt, title, description, cta, href) {
    return <LinkBox ><Stack
      backgroundColor="white"
      display="inline-block"
      align="center"
      boxShadow="base"
      rounded="3xl"
      minHeight="full"
      width={{ base: 'xs', md: 'xs' }}
      overflow="clip"
    >
      <Image
        alt={alt}
        src={imgSrc}
        mb={2} />
      <Box textAlign="left" p={3}>
        <LinkOverlay href={href} target="_blank"><Heading as="h2" size="md" mb="2" letterSpacing="tight">{title}</Heading></LinkOverlay>
        <Text mb={5}>{description}</Text>
        {LinkButton(href, cta, true)}
      </Box>
    </Stack></LinkBox>;
  }

  function carouselElement(imgSrc, alt, heading, subheading, href) {
    return <LinkBox><Stack
      align="center"
      transform="1"
      transition="transform 0.2s ease"
      zIndex="1 !important"
      _hover={{
        transform: "scale(1.05)",
        transition: "transform 0.2s ease",
        zIndex: "500 !important"
      }}
    >
      <Box
        className="group"
        cursor="pointer"
        position="relative"
        rounded="2xl"
        boxShadow="2xl"
        borderColor="gray.300"
        borderWidth="medium"
        overflow="hidden"
        width={{ base: 'xs', md: 'xs' }}
      >
        <Image
          alt={alt}
          src={imgSrc} />
      </Box>
      <Box textAlign="center">
        <LinkOverlay href={href} target="_blank"><Heading as="h6" size="sm" mb="2">{heading}</Heading></LinkOverlay>
        <Text>{subheading}</Text>
      </Box>
    </Stack></LinkBox>;
  }
}

export const getServerSideProps = async (ctx) => {
  // get url from ctx.req.url
  return {
    props: {
      url: (ctx.req.headers.host.includes('localhost') ? 'http' : 'https') + '://' + ctx.req.headers.host + ctx.req.url,
    }
  }
}

function sectionHeadings(heading, subHeading, darkMode) {
  return <Box textAlign="center" mb="10" >
    <Heading size="xl" letterSpacing="tight" fontWeight="extrabold" lineHeight="normal" color={darkMode ? "gray.100" : "gray.800"}>
      {heading}
    </Heading>
    <Text fontSize="lg" fontWeight="medium" color={darkMode ? "gray.400" : "gray.500"} >
      {subHeading}
    </Text>
  </Box>;
}

function LinkButton(url, label, connected) {
  const router = useRouter();
  const goToURL = () => {
    router.push(url);
  }
  return <Button
    onClick={goToURL}
    py={3}
    colorScheme="purple"
    isDisabled={!connected}
    fontWeight="bold"
    size="sm"
    borderRadius="full">
    {label}
  </Button>;
}


function WalletButton() {
  const getWallet = () => {
    window.open("https://ethereum.org/wallets", "_blank")
  }
  return (
    <Center>
      <Stack align="center">
        <Text>You need an Ethereum wallet to log in to Round.</Text>
        <Button onClick={getWallet} p={5}
          colorScheme="gray"
          variant="outline"
          fontWeight="bold"
          size="md"
          fontSize="medium"
          borderRadius="full"
        >

          <FaEthereum />Get a Wallet
        </Button>
      </Stack>
    </Center>
  );
}
