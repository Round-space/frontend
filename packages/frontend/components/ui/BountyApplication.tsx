/* eslint-disable no-console */
import { Flex, Box, Tag, Spacer, Text, Button, Image, Stack } from "@chakra-ui/react";
import dayjs from "dayjs";

import relativeTime from 'dayjs/plugin/relativeTime';
import { useEffect, useState } from "react";

import Blockies from "react-blockies";
// import { useEnsName } from "wagmi";
import { truncateHash } from "../../lib/utils";

import { useQueryEnsName } from '../../hooks/useQueryEnsName';
import { useQueryEnsAvatar } from '../../hooks/useQueryEnsAvatar';
import { QuillDeltaToHtmlConverter } from 'quill-delta-to-html';
import 'react-quill/dist/quill.snow.css';

dayjs.extend(relativeTime);

const BountyApplication = (props) => {
    
    const { objectId, ipfsHash, applicant, date, isAccepted } = props;
    const avatarDimensions = "20px";

    const [truncatedAddress, setTruncatedAddress] = useState('');
    const [email, setEmail] = useState('')
    const [description, setDescription] = useState('')
    const [accepting, setAccepting] = useState(false)

    const ensName = useQueryEnsName( applicant )
    const ensAvatar = useQueryEnsAvatar( applicant )

    useEffect(() => {
        setTruncatedAddress(truncateHash(applicant))
    }, [applicant])

    useEffect(() => {
        if(!props.isOwner) {
            return;
        }
        const ipfsUrl = `https://gateway.moralisipfs.com/ipfs/${ipfsHash}/application.json`
        
        fetch(ipfsUrl)
            .then(res => res.json())
            .then(data => {
                
                setEmail(data?.persona?.email);
                
                // parse description into rich text
                let ops = [];
                
                try {
                    const json = JSON.parse(data.description);
                    ops = json?.ops ? json.ops : [];
                } catch (e) {
                    ops = data.description?.split("\n").map((line) => ({ insert: line + "\n" }));  
                }
                

                const converter = new QuillDeltaToHtmlConverter(ops, {});
                const html = converter.convert();
                setDescription(html);
            }).catch(err => {
                console.log(err)
            })
        
    }, [ipfsHash])

    // const { data: ensName } = useEnsName({
    //     address: applicant,
    //     enabled: !!applicant
    // })
    
    const addressName = ensName != null ? ensName : truncatedAddress;

    const acceptApplication = () => {
        props.acceptApplication(objectId, applicant, setAccepting);
    }
    
    return (
        <Box mb={8} fontWeight='500'>
            <Flex w='100%'>
                <Box w='100%'>
                {/* <Tooltip hasArrow placement="right" label={"Address: " + props.address}> */}
                <Stack direction={{ base: 'column', md: 'row'}}>
                    <Box width={avatarDimensions} height={avatarDimensions} borderRadius="20px" overflow="hidden">
                        {ensAvatar ? <Image width={avatarDimensions} height={avatarDimensions} src={ensAvatar} /> : 
                        <Blockies seed={addressName?.toLowerCase()} size={8} scale={4} ></Blockies>
                        }
                    </Box>
                    <Box fontSize="md" lineHeight="large">
                        <Text><Text fontWeight='800' as='span'>{addressName}</Text> submitted an application</Text>
                        {props?.isOwner && <Text color='gray.500' fontWeight='400'>{email}</Text>}
                    </Box>
                    
                    {date && <Text fontSize='xs' color='GrayText' align='right' flexGrow={1}>{dayjs(date).fromNow()}</Text>}
                </Stack>
                {/* </Tooltip> */}
                </Box>
            </Flex>
            { props?.isOwner && 
            <>
                <Spacer py={2} />
                <Flex py={8} px={5} mb={{ base: 0, md: 14 }} direction={{ base: 'column', md: 'row'}} borderWidth="thin" borderRadius="3xl" width="100%">
                    <Box>
                        <Text fontSize="sm" fontWeight="700" mb='3'>Application Details</Text>
                        <Box className='ql-editor' dangerouslySetInnerHTML={{ __html: description }}
                        sx={{
                            "& h1": {
                              fontSize: "2em"
                            },
                            "& h2": {
                              fontSize: "1.5em"
                            },
                            "& h3": {
                              fontSize: "1.17em"
                            },
                            "& h4": {
                              fontSize: "1em"
                            },
                            "& h5": {
                              fontSize: "0.83em"
                            },
                            "& h6": {
                              fontSize: "0.67em"
                            }
                          }} />
                    
                    </Box>
                    
                    <Spacer />

                    <Box mt={{ base: 4, md: 0}} textAlign='right'>
                    {
                        isAccepted ?
                        <Tag>Accepted</Tag> :
                        <Button
                            // disabled={!props.enableButtons}
                            size="sm"
                            isLoading={accepting}
                            isDisabled={accepting}
                            colorScheme="green"
                            variant="outline"
                            onClick={acceptApplication}
                            >
                            Accept Application
                        </Button>
                    }
                    </Box>

                </Flex>
            </>
            }
        </Box>
        
    )
}

export default BountyApplication;