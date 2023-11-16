import { Box, FormControl, FormHelperText, FormLabel, Heading, Input, Stack, Text, Link } from "@chakra-ui/react";
import {  useEffect } from "react";
import { RequiredBadge } from "../ui/RequiredBadge";
import BountyLinks from "./BountyLinks";
import { bountyGuideURL } from "../../constants/standardBounties";

import QuillEditor from "../ui/QuillEditor";

export default function BountyStep1({bountyMetadata, setBountyMetadata, invalidity, setInvalidity}): JSX.Element {

    
    useEffect(() => {
        // set focus on the last link input
        
    }, [bountyMetadata.links]);

    


    return(
        <Stack gap={4}>
            <Box>
                <Heading>Round Details</Heading>
                {/* <Text>Keep descriptions simple with a clear definition of success.</Text> */}
            </Box>
            
            <FormControl>
                <FormLabel fontWeight="bold">Title
                    <RequiredBadge isInvalid={invalidity?.name}></RequiredBadge>
                </FormLabel>

                <FormHelperText mb={2}>
                    {invalidity?.name? "Please enter a title." : "Keep your title short and simple."}
                </FormHelperText>
                
                {/* <Tooltip label={invalidity.name} placement='bottom' isOpen={invalidity.name.length > 0} > */}
                    <Input 
                        value={bountyMetadata?.name ?? ''} 
                        isInvalid={invalidity?.name}
                        errorBorderColor='red.600'
                        borderWidth="medium"
                        onInput={(e) => {
                            setInvalidity((prev) => ({...prev, name: ''}));
                            setBountyMetadata((prev) => ({...prev, name: e.target['value']}));
                        }} />
                {/* </Tooltip> */}
            </FormControl>
            

            <FormControl>
                <FormLabel fontWeight="bold">Description
                <RequiredBadge isInvalid={invalidity?.description}></RequiredBadge>

                </FormLabel>
                
                <FormHelperText mb={2}>
                    {invalidity?.description? 
                        <Text>Please enter a description.</Text> : 
                        <Text>If you need a starting point, use the templates below or <Link href={bountyGuideURL} target='_blank' textDecoration='underline'>check out our guide</Link>.</Text>
                    }
                </FormHelperText>

                {/* <Tooltip label={invalidity.description} placement='bottom' isOpen={invalidity.description.length > 0} > */}
                    <Box 
                        sx={{
                            '& .quill': {
                            borderColor: 'gray.200',
                            borderWidth: '3px',
                            borderRadius: 'lg',
                            boxShadow: 'sm'
                            },
                            '& .ql-toolbar': {
                            borderBottomColor: 'gray.200',
                            }
                        }}
                        border={invalidity?.description ? '4px solid red' : 'none'} 
                        borderColor='red.600'
                        borderRadius='md'
                    >
                        <QuillEditor 
                            // placeholder="" 
                            value={bountyMetadata?.description ?? ''} 
                            // isInvalid={invalidity?.description}
                            // errorBorderColor='red.600'
                            // borderWidth="medium"
                            // rows={8}
                            onChange={(e) => {
                                setInvalidity((prev) => ({...prev, description: ''}));
                                setBountyMetadata((prev) => ({...prev, description: e.target['value']}));
                            }}
                         />
                    </Box>
                {/* </Tooltip> */}

                <FormHelperText mb={2}>
                    
                </FormHelperText>

                {/* <ButtonGroup mb={2}>
                    <Center fontWeight="bold">Templates: </Center>
                    {
                        descriptionTemplates.map(({label, content }, index) => (
                            <Button size="sm" variant="outline" fontWeight="medium" key={index} onClick={() => {
                                setBountyMetadata((prev) => ({...prev, description: content}));
                            } }>{label}</Button>
                        )) 
                    }
                </ButtonGroup> */}
            </FormControl>

            <BountyLinks bountyMetadata={bountyMetadata} setBountyMetadata={setBountyMetadata} invalidity={invalidity} setInvalidity={setInvalidity} />
            
        </Stack>
    )
}