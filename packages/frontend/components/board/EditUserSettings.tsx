/* eslint-disable @typescript-eslint/no-unused-vars, no-console ,react/no-unescaped-entities,react/no-children-prop */
import {
  Center,
  Text,
  VStack,
  Flex,
  Box,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Alert, AlertDescription, AlertIcon, AlertTitle, useToast

} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
const BoardSettingsForm = dynamic(() => import('./BoardSettingsForm'), {
  ssr: false,
})
import { RootState, useAppSelector } from '../../reducers'
import { AccountMetadata, BoardCollaborators } from '../../data/model';
import { setDashboardMetaData } from '../../reducers/dashboard/state';
import { useAppDispatch } from '../../reducers';
import { useMoralis, useMoralisFile } from "react-moralis";
import { useAccount, useNetwork } from 'wagmi'
import { moralisAuthentication } from '../../lib/utils'
import { addCollaborator } from "../../reducers/dashboard/state";

export default function EditUserSettings(props): JSX.Element {

  // const { isAuthenticated, user } = useMoralis()

  const { data: accountData } = useAccount();
  const account = accountData?.address
  const { activeChain: chain } = useNetwork()
  const isWalletConnect = accountData?.connector?.id === "walletConnect"
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {metadata, board} = useAppSelector((state: RootState) => { return state.dashBoard; });

  const [name, setName] = useState(metadata.name)
  const [description, setDescription] = useState(metadata.description)
  const [url, setUrl] = useState(metadata.imageUrl)
  const [website, setWebsite] = useState(metadata.website)
  const [themeColor, setThemeColor] = useState(metadata?.themeColor)
  const [gnosis, setGnosis] = useState(metadata.gnosis)
  const [email, setEmail] = useState(metadata.email)
  const [urlname, setUrlname] = useState(metadata.urlname)
  const [twitter, setTwitter] = useState(metadata.twitter)
  const [discord, setDiscord] = useState(metadata.discord)
  const [hideDrafts, setHideDrafts] = useState(metadata['hideDrafts'])



  const [isUpdating, setIsUpdating] = useState(false)
  const [fileTarget, setFileTarget] = useState(null);
  const { saveFile } = useMoralisFile();

  const welcomeHeading = "Welcome. Let's setup your workspace.";
  const welcomeSubheading = "Start with a name, short description and website. Don't worry, you can change all this later."

  const toast = useToast();

  const {
    user,
    authenticate,
    isAuthenticated,
    Moralis
    
  } = useMoralis();

  // promise based uploadFile
  const uploadFile = async () => {
    if(fileTarget) {
        const fileData = fileTarget;
        // const attachment = new Moralis.File(fileData.name, fileData);
        // await attachment.saveIPFS()
        // Convert file data to a base64-encoded string
        const reader = new FileReader();
        const res = await (() => new Promise((resolve, reject) => {
          reader.onload = (event) => {
            const base64 = event.target.result;

            Moralis.Cloud.run("uploadToIPFS", { filename: fileData.name, base64 }).then((res) => {
              const urlObj = new URL(res?.[0]?.path);
              const pathSegments = urlObj.pathname.split('/');
              const ipfsHashIndex = pathSegments.findIndex(segment => segment === 'ipfs') + 1;
              const hash = pathSegments[ipfsHashIndex];

              const filename = fileData.name;
              const fileHash = hash;
              
              resolve({ filename, fileHash});
            }).catch((err) => {
              reject(err);
            })
          }
          reader.readAsDataURL(fileData);
        }))() as any
        return res ? {'_url': `https://gateway.moralisipfs.com/ipfs/${res.fileHash}/${res.filename}`} : null;
    }
  }


  useEffect(() => {
    setName(metadata.name)
    setDescription(metadata.description)
    setUrl(metadata.imageUrl)
    setThemeColor(metadata.themeColor)
    setWebsite(metadata.website)
    setGnosis(metadata.gnosis)
    setEmail(metadata.email)
    setUrlname(metadata.urlname)
    setTwitter(metadata.twitter)
    setDiscord(metadata.discord)
    setHideDrafts(metadata['hideDrafts'] || false)
  }, [metadata])

  // useEffect(() => {
  //   if (isAuthenticated) {
  //     setAccount(user.get("ethAddress"))
  //   }
  // }, [isAuthenticated])

  const handleUpdateSettings = async (collaborators: string[] | null ) => {

    if (!account) {
      return;
    }


    try {

      const res = await moralisAuthentication(authenticate, isAuthenticated, user, account, toast, isWalletConnect, chain?.id)
      if (!res) {
        return;
      }

      setIsUpdating(true);

      if(collaborators?.length) {
        collaborators.forEach(async (address) => {
          const boardCollaborator = new BoardCollaborators();

          const data = {
            board,
            address,
            isNFT: false,
          }

          Object.keys(data).forEach(key => {
            boardCollaborator.set(key, data[key]);
          })

          // Check to determine, if the current user can add a collaborator for the board is done in the cloud functions

          try {
            const res = await boardCollaborator.save();
            dispatch(addCollaborator({...data, objectId: res.id, createdAt: res.createdAt}))
          } catch(e) {
            // eslint-disable-next-line no-console
            console.log(e);
          }
        })
      }

      let newImageUrl = null;
      if (fileTarget) {

        const file = await uploadFile();
        
        if (file && file['_url']) {
          newImageUrl = file['_url'];
        }
      }

      const newAccountMetadata = new AccountMetadata()

      if (metadata.id) {
        newAccountMetadata.id = metadata.id;
      }
      newAccountMetadata.setKeyValue('account', account)
      newAccountMetadata.setKeyValue('imageUrl', newImageUrl ? newImageUrl : url)
      newAccountMetadata.setKeyValue('description', description)
      newAccountMetadata.setKeyValue('name', name)
      newAccountMetadata.setKeyValue('website', website)
      newAccountMetadata.setKeyValue('gnosis', gnosis)
      newAccountMetadata.setKeyValue('email', email)
      newAccountMetadata.setKeyValue('urlname', urlname)
      newAccountMetadata.setKeyValue('twitter', twitter)
      newAccountMetadata.setKeyValue('discord', discord)
      newAccountMetadata.setKeyValue('themeColor', themeColor)
      newAccountMetadata.setKeyValue('hideDrafts', hideDrafts)


      const savedItem = await newAccountMetadata.save();
      setIsUpdating(false);

      // the new updated data should also be made available to the dashboard for display
      const newMetadata = {
        id: savedItem.id,
        imageUrl: savedItem.imageUrl,
        description: savedItem.description,
        name: savedItem.name,
        website: savedItem.website,
        gnosis: savedItem.gnosis,
        email: savedItem.email,
        urlname: savedItem.urlname,
        twitter: savedItem.twitter,
        discord: savedItem.discord,
        themeColor: savedItem.themeColor,
        hideDrafts: savedItem.hideDrafts,
        account
      }
      dispatch(setDashboardMetaData(newMetadata));

      // if it was the initial setup being done, redirect to the dashboard, after the form is submitted
      if (props.setup && savedItem) {
        // redirect to dashboard
        router.push('/');
      }

    } catch (error) {

      console.log(error)
      //TODO: HANDLE ERROR CREATING BOUNTY
      // dispatch(setCreatingFailed(error))
    }

  }



  //TODO: SPLIT INTO SMALLER COMPONENTS
  return (
    <Box>
        {/* Show Alert at Setup */}
        {props.setup ?
          <Alert
            bgGradient='linear(to-br, gray.50, gray.200, gray.300)'
            borderRadius="2xl"
            borderColor="gray.50" borderWidth={3} boxShadow="md"
            status='success'
            variant='subtle'
            flexDirection='column'
            alignItems='center'
            justifyContent='center'
            textAlign='center'
            py={[5, 10]}
            width="100%"
          >
            <AlertTitle mt={1} mb={1} fontSize='xl'>
              {welcomeHeading}
            </AlertTitle>
            <AlertDescription maxWidth='md'>
              {welcomeSubheading}
            </AlertDescription>
          </Alert> :
          <Center mb={2}>
            <Text fontWeight="extrabold" fontSize="xl">Settings</Text>
          </Center>
        }
        
        <Flex alignContent="center" direction={['column', 'column', 'row', 'row']}>
          <VStack flexGrow={1}>
            <BoardSettingsForm
              {...{ setup: props.setup, setFileTarget, account, name, setName, description, setDescription, url, setUrl, website, themeColor, setThemeColor, setWebsite, gnosis, setGnosis, email, setEmail, urlname, setUrlname, twitter, setTwitter, discord, setDiscord, isUpdating, setIsUpdating, onUpdateSettings: handleUpdateSettings, hideDrafts, setHideDrafts }}
            />
          </VStack>
        </Flex>

      </Box>
  )
}
