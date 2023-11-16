// import { Icon } from '@chakra-ui/icons'
import {
  Flex,
  Stack,
  Button,
  Text,
  HStack,
  // Divider,
  Tag,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalFooter,
  Select
} from '@chakra-ui/react'

import { useState, useCallback } from "react";

import {
  FiBook,
  FiSettings
} from 'react-icons/fi'
import { VscPreview } from 'react-icons/vsc';
import { AiOutlineHome } from 'react-icons/ai';
import {
  SlUserFollowing
} from 'react-icons/sl'
import { IoPeopleOutline } from 'react-icons/io5'

import { useRouter } from 'next/router'


import { NavButton } from './NavButton'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { MdOutlineDashboard } from 'react-icons/md'

import { IoMdAddCircleOutline } from 'react-icons/io'
// import { BiImport } from 'react-icons/bi'
import { RxDiscordLogo } from 'react-icons/rx'
import { TbBrandTelegram } from 'react-icons/tb'
import { MdOutlineCopyAll } from 'react-icons/md'
import { BsListTask } from 'react-icons/bs';
import { useAppSelector, RootState } from '../../../reducers';





export const Sidebar = (props) => {
  const helpURL = "https://discord.gg/JKjY5tmvSu";
  const founderTelegram = "https://t.me/tarunsachdeva2";


  const router = useRouter();
  
  const { isOpen, onOpen, onClose } = useDisclosure()
  const dashboardState = useAppSelector((state: RootState) => { return state?.dashBoard; });
  
  const { board, canBoards } = dashboardState;

  const { board: queryBoard } = router.query;
  
  // FOR CONTRIBUTOR MODE: LEAVE THIS CODE IN
  // Two menu types: Project Mode (for operators), and Contributor Mode
  const [menuType
    // , setMenuType
  ] = useState('project')
  // const menuTypeStr = menuType === 'project' ? "Project Mode" : "Contributor Mode";
  // const menuTypeSubStr = menuType === 'project' ? "Contributor Mode" : "Project Mode";

  // const handleMenuTypeToggle = () => {
  //   setMenuType(menuType === 'project' ? 'contributor' : 'project')
  // }

  

  
  const goToDiscord = () => {
    window.open(helpURL,'_blank');
  }

  const goToFounderDM = () => {
    window.open(founderTelegram, '_blank');
  }

  const gotoYourBoard = () => {
    router.push(`/dashboard/${board}`);
  }

  const goToAllTasks = () => {
    router.push(`/dashboard/${board}/workspace/all`);
  }

  const goHome = () => {
    router.push(`/dashboard/${board}/home`);
  }

  const gotoNewBounty = () => {
    router.replace(`/dashboard/${board}/bounty/create`);
  }
  const gotoBoardSettings = () => {
    router.push(`/dashboard/${board}/settings`);
  } 
  
  const gotoDocs = () => {
    window.open('https://docs.aikido.work','_blank');
  }



  const goToTemplates = () => {
    router.push(`/dashboard/${board}/bounty/create/templates`);
  }


  // const goToImport = () => {
  //   router.push(`/dashboard/${board}/bounty/create/import`);
  // }


  // const goToReports = () => {
  //   router.push(`/dashboard/${board}/analytics/reports`);
  // }

  // const goToDataExport = () => {
  //   router.push(`/dashboard/${board}/analytics/export`);
  // }


  const goToCoreTeam = () => {
    router.push(`/dashboard/${board}/community/core`);
  }

  const goToContributors = () => {
    router.push(`/dashboard/${board}/community/contributors`);
  }

  const goToSubscribers = () => {
    router.push(`/dashboard/${board}/community/subscribers`);
  }


  const gotoPublicView = () => {
    const url = '/space/'+board;
    // open url in a new window
    window.open(url, '_blank');
  }

  const switchBoard = useCallback((e) => {
      if(e.target.value && e.target.value !== board) {
        router.push(`/dashboard/${e.target.value}/home`);
        // const query = router.query;
        // query.board = e.target.value;
        // router.replace({pathname: router.pathname, query: query});
      }
  }, [board, router])

  const DMModal = (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent mt={20} fontSize="medium">
        <ModalHeader>Need Immediate Support?</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          Hi! I want to make sure you have a good experience using Aikido, so you can DM me at any time if there are any urgent issues. I&apos;m on Eastern Standard Time, and will respond as soon as I can.
          <br/><br/>
          -Tarun
        </ModalBody>

        <ModalFooter fontSize="small">
          <Button colorScheme="blue" mr={3} onClick={goToFounderDM}  >
            DM on Telegram
          </Button>
          <Button variant='ghost' onClick={goToDiscord}>Go To Discord</Button>
          <Button variant='ghost' onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );

  return (
    <Flex as="section" className="sidebar" minH="calc(100vh - 50px)" bg="bg-canvas" position="sticky" top="0">
      <Flex
        flex="1"
        bg="bg-surface"
        overflowY="auto"
        maxW={{ base: 'full', sm: 'xs' }}
        py={{ base: '2', sm: '8' }}
        px={{ base: '4', sm: '6' }}
      >
        <Stack justify="space-between">
          <Stack spacing={{ base: '5', sm: '6' }} shouldWrapChildren>

            <Stack spacing="0">
            <Select 
              borderWidth="medium"
              rounded="md"
              size='sm'
              mb='4'
              value={queryBoard}
              onChange={switchBoard}
              >
                {/* <option disabled value=''>Select a Board</option> */}
                <optgroup label='Your Space'>
                  {canBoards?.[0] ? <option value={canBoards[0].board}>{canBoards[0].name}</option> : null}
                </optgroup>

                <optgroup label='Other Spaces'>
                  { canBoards?.map(({board, name}, index) => {
                      if(index === 0) {
                        return null
                      }
                      return <option value={board} key={index}>{name}</option>
                  })}
                </optgroup>
            </Select>

          {menuType === 'project' && (
            <>

{/* <Select size="sm" placeholder='Your Workspace'>
  <option value='option1'>Option 1</option>
  <option value='option2'>Option 2</option>
  <option value='option3'>Option 3</option>
</Select> */}

              {navigationHeading("Home",true,"")}
              <NavButton isDisabled={!props.hasMetadata} label="Dashboard" onClick={goHome} icon={AiOutlineHome} aria-current="page" />

              {navigationHeading("Workspace",true,"")}
              <NavButton isDisabled={!props.hasMetadata} rightIcon={<ExternalLinkIcon />} label="Your Space" onClick={gotoPublicView} target="_blank"  icon={MdOutlineDashboard} aria-current="page" />
              <NavButton isDisabled={!props.hasMetadata} label="Preview" onClick={gotoYourBoard} icon={VscPreview}  aria-current="page" />
              <NavButton isDisabled={!props.hasMetadata} label="Settings" onClick={gotoBoardSettings} icon={FiSettings} />

              {navigationHeading("Rounds",true,"")}
              <NavButton isDisabled={!props.hasMetadata} label="Launch New Round" onClick={gotoNewBounty} icon={IoMdAddCircleOutline} />
              <NavButton isDisabled={!props.hasMetadata} label="All Rounds" onClick={goToAllTasks} icon={BsListTask} aria-current="page" />
              <NavButton isDisabled={!props.hasMetadata} label="Templates" onClick={goToTemplates} icon={MdOutlineCopyAll} aria-current="page" />

              {navigationHeading("Community",true,"")}
              <NavButton isDisabled={!props.hasMetadata} label="Core Team" onClick={goToCoreTeam} icon={SlUserFollowing} aria-current="page" />
              <NavButton isDisabled={!props.hasMetadata} label="Contributors" onClick={goToContributors} icon={IoPeopleOutline} aria-current="page" />
              <NavButton isDisabled={!props.hasMetadata} label="Subscribers" onClick={goToSubscribers} icon={SlUserFollowing} aria-current="page" />

              {navigationHeading("Help",true,"")}
              <NavButton label="Docs" onClick={gotoDocs} icon={FiBook} />
              <NavButton href={helpURL} target="_blank" label="Discord" icon={RxDiscordLogo} />
              <NavButton target="_blank" label="DM Founder" onClick={onOpen} icon={TbBrandTelegram} />
              {DMModal}
            </>
          )}

{/* FOR CONTRIBUTOR MODE: LEAVE THIS CODE IN */}
{/* 
          {menuType === 'contributor' && (
              <>

                <Button size="xs"  rightIcon={<ExternalLinkIcon />} onClick={gotoPublicView} colorScheme="gray">
                    Your Profile
                </Button>

                {navigationHeading("Opportunities",true,"")}
                <NavButton isDisabled={!props.hasMetadata} label="Active Work" onClick={gotoYourBoard} icon={SlUserFollowing} aria-current="page" />
                <NavButton isDisabled={!props.hasMetadata} label="All Opportunities" onClick={gotoYourBoard} icon={SlUserFollowing} aria-current="page" />

                {navigationHeading("Explore",true,"")}
                <NavButton isDisabled={!props.hasMetadata} label="Explore" onClick={gotoYourBoard} icon={SlUserFollowing} aria-current="page" />
                <NavButton isDisabled={!props.hasMetadata} label="Match Me" onClick={gotoYourBoard} icon={SlUserFollowing} aria-current="page" />

                {navigationHeading("Profile",true,"")}
                <NavButton isDisabled={!props.hasMetadata} label="General Settings" onClick={gotoYourBoard} icon={SlUserFollowing} aria-current="page" />
                <NavButton isDisabled={!props.hasMetadata} label="Project Preferences" onClick={gotoYourBoard} icon={SlUserFollowing} aria-current="page" />
              </>
          )} */}

              </Stack>



            {/* <Stack spacing={{ base: '5', sm: '6' }}>
              <Divider />
              { props.hasMetadata && 
                  <Button size="xs"  rightIcon={<ExternalLinkIcon />} onClick={gotoPublicView} colorScheme="gray">
                    Live Workspace
                  </Button>
              }
            </Stack> */}
          </Stack>

          {/* SWITCH TO CONTRIBUTOR MODE: COMING SOON */}
          {/* <Stack className="minimized" rounded="xl" alignItems="center" backgroundColor="gray.100" p="2">
              <Text fontWeight="extrabold" fontSize="small" >You are in {menuTypeStr}</Text>
              <Flex justifyContent="left" alignItems="center" direction="row">
              <Text lineHeight="shorter" ml="1" fontWeight="light" fontSize="xx-small" >Switch to</Text>
              <Text lineHeight="shorter" ml="1" fontWeight="light" fontSize="xs" >{menuTypeSubStr}</Text>

              <Switch 
                sx={{ 'span.chakra-switch__track:not([data-checked])': { backgroundColor: 'purple.600' } }}
                colorScheme="blue"
                size="md"
                isChecked={menuType === 'contributor'} 
                onChange={handleMenuTypeToggle
                }></Switch>
                </Flex>
          </Stack> */}


        </Stack>
      </Flex>
    </Flex>
  )
}

function navigationHeading(headingText,paddingTop,tag) {
  return <HStack pt={paddingTop ? "3" : "inherit"}>
          <Text 
        fontSize="small"
        fontWeight="extrabold"
        color="gray.400">
          {headingText.toUpperCase()}
        </Text>
        {tag? 
        <Tag size="sm" fontSize="xx-small" fontWeight="bold">{tag.toUpperCase()}</Tag> :
        <></>}
        </HStack>;
}