import { VStack, Button, Box, Divider, Center, FormLabel, FormControl, Spacer, Input, Textarea, Flex, Text, Tooltip, HStack, Switch, FormHelperText, InputGroup, InputRightAddon, Spinner, useRadioGroup } from "@chakra-ui/react";
import CustomRadio from '../ui/CustomRadio';
import { useCallback, useEffect, useState } from "react";

import { useAccount } from "wagmi";

import { AccountMetadata } from "../../data/model";
import Moralis from 'moralis'
import { CloseIcon } from "@chakra-ui/icons";
import { ImageUpload } from '../controls/ImageUpload'

import BoardGnosisPopup from "./BoardGnosisPopup";

// get the current url hostname
const hostname = window && window.location && window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '');

const urlnameRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const fields = {
  name: 'Name',
  description: 'Description',
  website: 'Website',
  twitter: 'Twitter',
  discord: 'Discord',
  themeColor: 'Theme Color'
}

let throttled = null;



export default function BoardSettingsForm(props): JSX.Element {

  const { data: accountData } = useAccount();

  const account = accountData?.address
  const [invalidity, setInvalidity] = useState({
    name: '',
    description: '',
    email: '',
    urlname: '',
    website: '',
    twitter: '',
    discord: '',
    themeColor: 'purple',
    gnosis: ''
  });

  const [notAmongCollaborators, setNotAmongCollaborators] = useState([]);
  const [addCollaborators, setAddCollaborators] = useState<boolean | null>(null);

  const colorOptions = [
    'gray',
    'red',
    'orange',
    'yellow',
    'green',
    'teal',
    'blue',
    'cyan',
    'purple',
    'pink'
  ]

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: 'themeColor',
    defaultValue: ''
  })



  const group = getRootProps()

  const [urlnameCheck, setUrlnameCheck] = useState(false);
  const [urlnameCheckDue, setUrlnameCheckDue] = useState(false);
  const [accountJustChanged, setAccountJustChanged] = useState(false);

  const boardQuery = new Moralis.Query(AccountMetadata);

  const verifyAndSave = async () => {
    let isValid = true;

    // check if fields are empty
    const firstThree = ['name', 'description', 'website'];
    firstThree.forEach(fieldName => {
      const field = document.getElementById(fieldName) as HTMLInputElement;
      if (field.value.length === 0) {
        // set it to display the error
        setInvalidity({ ...invalidity, [fieldName]: `Please fill out a ${fields[fieldName]}` });
        isValid = false;
      }
    })

    // if email is not empty then check if it is valid
    const emailField = document.getElementById('email') as HTMLInputElement;
    if (emailField && emailField.value.length > 0) {
      const email = emailField.value;
      const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (!emailRegex.test(email)) {
        setInvalidity({ ...invalidity, email: 'Please enter a valid email' });
        isValid = false;
      }
    }

    // if urlname is not empty then check if it is a valid directory name for url
    const urlnameField = document.getElementById('urlname') as HTMLInputElement;
    if (urlnameField && urlnameField.value.length > 0) {
      const urlname = urlnameField.value;

      if (!urlnameRegex.test(urlname)) {
        setInvalidity({ ...invalidity, urlname: 'Please enter a valid urlname' });
        isValid = false;
      }
    }

    if (invalidity.urlname.length) {
      isValid = false;
    }

    // check if gnosis is either empty or a valid address
    // const gnosis = document.getElementById('gnosis') as HTMLInputElement;
    // if (gnosis && gnosis.value.length !== 0) {
    //   // if is a valid address
    //   if (ethers?.utils?.isAddress(gnosis.value)) {

    //     const gnosisSafeContract = new ethers.Contract(gnosis.value, ['function isOwner(address) view returns (bool)', 'function getOwners() view returns (address[])'], provider);

    //     try {
    //       props.setIsUpdating(true);
    //       const isOwner = await gnosisSafeContract.isOwner(account);
    //       if (!isOwner) {
    //         setInvalidity((prevState) => ({
    //           ...prevState,
    //           gnosis: 'The current signer is not the owner of the gnosis safe'
    //         }));
    //         isValid = false;
    //       } else {
    //         setInvalidity((prevState) => ({
    //           ...prevState,
    //           gnosis: ''
    //         }));
    //       }
    //     }
    //     catch (e) {
    //       setInvalidity((prevState) => ({
    //         ...prevState,
    //         gnosis: 'The gnosis safe address is invalid'
    //       }));
    //       isValid = false;
    //     }
    //     finally {
    //       props.setIsUpdating(false);
    //     }

    //     if(isValid && addCollaborators === null) {
    //       // get the signatories of the gnosis safe
    //       try {
    //         props.setIsUpdating(true);
    //         const owners = await gnosisSafeContract.getOwners();
    //         const exceptMyself = owners.filter(owner => owner !== account);
    //         // console.log(dashBoardState.collaborators);
    //         // list the exceptMyself addresses that are not among the collaborators
    //         const notAmongCollaborators = exceptMyself.filter(owner => !dashBoardState.collaborators.find(({address}: any) => address === owner));

    //         if(notAmongCollaborators.length > 0) {
    //           setNotAmongCollaborators(notAmongCollaborators);
    //           setAddCollaborators(true);
    //           isValid = false;
    //         }
    //       } catch(e) {
    //         console.log(e);
    //         isValid = false;
    //       } finally {
    //         props.setIsUpdating(false);
    //       }

    //     }

    //   } else {
    //     setInvalidity((prevState) => ({
    //       ...prevState,
    //       gnosis: 'Enter a valid gnosis safe address'
    //     }));
    //     isValid = false;
    //   }



    // }


    // check if website, twitter and discord, if not empty, have valid urls
    const lastThree = ['website', 'twitter', 'discord'];
    lastThree.forEach(fieldName => {
      const field = document.getElementById(fieldName) as HTMLInputElement;
      if (!field) {
        return;
      }
      if (field.value.length > 0) {
        if (!field.value.match(/^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/)) {
          // set it to display the error
          setInvalidity({ ...invalidity, [fieldName]: `Please fill out a valid ${fields[fieldName]} URL` });
          isValid = false;
        }
      }
    });


    if (isValid) {
      props.onUpdateSettings(addCollaborators ? notAmongCollaborators : null)
    }
  }

  const validateUrlName = useCallback((urlname, account) => {
    // if it is a valid directory name
    if (urlnameRegex.test(urlname)) {

      setUrlnameCheck(true);

      // board query to check if urlname is taken
      boardQuery.equalTo('urlname', urlname);

      // where account is not the current account
      boardQuery.notEqualTo('account', account);

      boardQuery.find().then((results) => {

        if (results.length > 0) {
          setInvalidity({ ...invalidity, urlname: 'This URL is already taken' });
        }

        setUrlnameCheck(false);
        setUrlnameCheckDue(false);

      })
    } else {
      setInvalidity({ ...invalidity, urlname: 'Please enter a valid URL' });
      setUrlnameCheckDue(false);
    }
  }, [boardQuery, invalidity]);

  const urlnameChange = useCallback((event) => {

    props.setUrlname(event.target.value);

    if (!event.target.value) {
      return;
    }

    setUrlnameCheckDue(true);

    // throttle the urlname change
    if (throttled) {
      clearTimeout(throttled);
    }

    throttled = setTimeout(() => {
      validateUrlName(event.target.value, account);
    }
      , 1000);
  }, [setInvalidity, account])

  useEffect(() => {
    if (account) {
      setInvalidity({ ...invalidity, urlname: '' });
      setAccountJustChanged(true);
    }
  }, [account])

  useEffect(() => {
    setInvalidity({ ...invalidity, urlname: '' });

    if (accountJustChanged) {
      if (account && props.urlname) {
        setUrlnameCheckDue(true);
        validateUrlName(props.urlname, account);
        setAccountJustChanged(false);
      }
    }

  }, [props.urlname])


  return (
    <Flex width={["90%", "80%", "70%"]} direction="column">
      <Flex width="100%" direction="column" alignContent="left" pt={6} pb={6}>
        <Box fontSize="lg" fontWeight="bold">Display Settings</Box>
        <Box fontSize="sm" fontWeight="medium" color="gray.500">Adjust the look and feel of your workspace.</Box>
        <Divider orientation='horizontal' />
      </Flex>

      <ImageUpload url={props.url} setFileTarget={props.setFileTarget} />

      <FormControl id="name" mt={1} mb={5} isRequired>
        <FormLabel mb={0}>
          Title:
        </FormLabel>
        <Tooltip label={invalidity.name} placement='right' isOpen={invalidity.name.length > 0} >
          <Input
            type='text'
            isInvalid={invalidity.name.length > 0}
            errorBorderColor='red.300'
            placeholder='Give this board a title.'
            borderRadius="10px"
            border="2px"
            shadow="sm"
            value={props.name}
            onChange={(event) => { setInvalidity({ ...invalidity, name: '' }); props.setName(event.target.value); }}>
          </Input>
        </Tooltip>
      </FormControl>

      <FormControl id="description" mt={1} mb={5} isRequired>
        <FormLabel mb={0}>
          Description:
        </FormLabel>
        <Tooltip label={invalidity.description} placement='right' isOpen={invalidity.description.length > 0} >
          <Textarea
            placeholder="Provide a short description."
            isInvalid={invalidity.description.length > 0}
            errorBorderColor='red.300'
            mt={1}
            rows={8}
            borderRadius="10px"
            border="2px"
            shadow="sm"
            value={props.description}
            onChange={(event) => { setInvalidity({ ...invalidity, description: '' }); props.setDescription(event.target.value); }}
          />
        </Tooltip>
      </FormControl>

      <FormControl id="website" mt={1} mb={5} isRequired>
        <FormLabel mb={0}>
          Website:
        </FormLabel>
        <Tooltip label={invalidity.website} placement='right' isOpen={invalidity.website.length > 0} >
          <Input
            type='text'
            placeholder="https://"
            isInvalid={invalidity.website.length > 0}
            errorBorderColor='red.300'
            mt={1}
            borderRadius="10px"
            border="2px"
            shadow="sm"
            value={props.website}
            onChange={(event) => { setInvalidity({ ...invalidity, website: '' }); props.setWebsite(event.target.value) }}
          />
        </Tooltip>
      </FormControl>

      {!props.setup &&
        (
          <>
            <FormControl id="twitter" mt={1} mb={5}>
              <FormLabel mb={0}>
                Twitter:
              </FormLabel>
              <Tooltip label={invalidity.twitter} placement='right' isOpen={invalidity.twitter.length > 0} >
                <Input
                  type='text'
                  placeholder="https://"
                  isInvalid={invalidity.twitter.length > 0}
                  errorBorderColor='red.300'
                  mt={1}
                  borderRadius="10px"
                  border="2px"
                  shadow="sm"
                  value={props.twitter}
                  onChange={(event) => { setInvalidity({ ...invalidity, twitter: '' }); props.setTwitter(event.target.value) }}
                />
              </Tooltip>
            </FormControl>

            <FormControl id="discord" mt={1} mb={5}>
              <FormLabel mb={0}>
                Discord:
              </FormLabel>

              <Tooltip label={invalidity.discord} placement='right' isOpen={invalidity.discord.length > 0} >
                <Input
                  type='text'
                  placeholder="https://"
                  isInvalid={invalidity.discord.length > 0}
                  errorBorderColor='red.300'
                  mt={1}
                  borderRadius="10px"
                  border="2px"
                  shadow="sm"
                  value={props.discord}
                  onChange={(event) => { setInvalidity({ ...invalidity, discord: '' }); props.setDiscord(event.target.value) }}
                />
              </Tooltip>
            </FormControl>

            <FormControl id="urlname" mt={1} mb={5}>
              <FormLabel mb={0}>
                Custom URL:
              </FormLabel>
              <Tooltip label={invalidity.urlname} placement='auto' isOpen={invalidity.urlname.length > 0} >
                <InputGroup>
                  <Input
                    type='text'
                    isInvalid={invalidity.urlname.length > 0}
                    errorBorderColor='red.300'
                    mt={1}
                    borderRadius="10px"
                    border="2px"
                    shadow="sm"
                    value={props.urlname}
                    onChange={urlnameChange}
                  />
                  <InputRightAddon bg='transparent' border='none' position='absolute' right='0' top='1'>
                    {urlnameCheck ? <Spinner size='sm' /> : invalidity.urlname.length !== 0 && <CloseIcon color='red.500' />}
                  </InputRightAddon>
                </InputGroup>
              </Tooltip>
              <HStack fontSize='sm' mt='2' flexWrap='wrap' justify='flex-start'><Text color='gray'>Your URL:</Text><Text color='green'>{hostname + '/space/' + (props.urlname ? props.urlname : account)}</Text></HStack>
            </FormControl>

            <FormControl id="themeColor" mt={1} mb={5}>
              <FormLabel mb={0}>
                Theme Color:
              </FormLabel>
              <Flex direction='row' {...group} >
                <Flex borderRadius='xl' overflow='clip' >
                  {colorOptions.map((value) => {
                    const radio = getRadioProps({ value })
                    return (
                      <CustomRadio key={value}
                        activeColor={props.themeColor}
                        {...radio}
                        onChange={(event) => { setInvalidity({ ...invalidity, themeColor: '' }); props.setThemeColor(event.target.value) }}
                      >
                        {value}
                      </CustomRadio>
                    )
                  })}
                </Flex>
                <Spacer />
              </Flex>
            </FormControl>



            <Flex width="100%" direction="column" alignContent="left" pt={6} pb={6}>
              <Box fontSize="lg" fontWeight="bold">Wallet Settings</Box>
              <Box fontSize="sm" fontWeight="medium" color="gray.500">Update the wallet settings for your space.</Box>
              <Divider orientation='horizontal' />
            </Flex>


            <BoardGnosisPopup
              gnosis={props.gnosis}
              setGnosis={props.setGnosis}
              notAmongCollaborators={notAmongCollaborators}
              setNotAmongCollaborators={setNotAmongCollaborators}
              addCollaborators={addCollaborators}
              setAddCollaborators={setAddCollaborators}
            />

            <Flex width="100%" direction="column" alignContent="left" pt={6} pb={6}>
              <Box fontSize="lg" fontWeight="bold">Workspace Settings</Box>
              <Box fontSize="sm" fontWeight="medium" color="gray.500">Notifications, payment and other details.</Box>
              <Divider orientation='horizontal' />
            </Flex>



            <FormControl id="email" mt={1} mb={5}>
              <FormLabel mb={0}>
                Space Admin Email Address:
              </FormLabel>

              <Tooltip label={invalidity.email} placement='right' isOpen={invalidity.email.length > 0} >
                <Input
                  type='text'
                  isInvalid={invalidity.email.length > 0}
                  errorBorderColor='red.300'
                  mt={1}
                  borderRadius="10px"
                  border="2px"
                  shadow="sm"
                  value={props.email}
                  onChange={(event) => { setInvalidity({ ...invalidity, email: '' }); props.setEmail(event.target.value) }}
                />
              </Tooltip>
              <FormHelperText>This is optional, but recommended if you wish to receive notifications for important events</FormHelperText>
            </FormControl>

            <HStack py={3} justify='flex-start' w='100%'>
              <FormLabel mb={0}>
                Show Draft Rounds in your Space
              </FormLabel>
              <Switch name="hideDrafts" colorScheme={props.themeColor} isChecked={!props.hideDrafts} onChange={(event) => { props.setHideDrafts(!event.target.checked) }} />
            </HStack>


          </>
        )
      }

      <Center>
        <VStack mt={5}>
          <Button
            isDisabled={!props.account || urlnameCheckDue}
            isLoading={props.isUpdating}
            loadingText='Updating...'
            colorScheme={props.themeColor ? props.themeColor : "purple"}
            onClick={verifyAndSave}
            size="lg"
          >
            {props.setup ? 'Save Settings' : 'Update Settings'}
          </Button>
        </VStack>
      </Center>
    </Flex>
  );

}
