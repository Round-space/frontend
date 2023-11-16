import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { FormControl, FormLabel, FormHelperText, Stack, Button, HStack, Input, Tooltip } from "@chakra-ui/react";
import { SyntheticEvent, useEffect, useRef, useState } from "react";

function LinkInput({setInvalidity, invalidity, index, link, setLink, deleteLink, lastLinkNew, setLastLinkNew}: any) {
    const inputEl = useRef(null);
    
    useEffect(() => {
        
        if (lastLinkNew && inputEl.current) {
            inputEl.current.focus();
            setLastLinkNew(false);
        }
    }, [lastLinkNew]);


    return (
        <HStack key={index}>
            <Tooltip label={invalidity.links?.[index]} placement='bottom' isOpen={invalidity.links?.[index]?.length} >
                <Input 
                    ref={inputEl}
                    value={link ?? ''} 
                    borderWidth="medium"
                    onInput={ (e) => {
                        setInvalidity((prev) => ({ ...prev, links: [...prev.links.slice(0, index), '', ...prev.links.slice(index + 1)]}));
                        setLink( e, index );
                    }}
                    isInvalid={ invalidity.links?.[index]} />
            </Tooltip>

            { index > 0 && <DeleteIcon onClick={ () => {
                setInvalidity((prev) => ({ ...prev, links: [...prev.links.slice(0, index), ...prev.links.slice(index + 1)]}));
                deleteLink(index)
            }} /> }
        </HStack>
    )
}

export default function BountyLinks({bountyMetadata, setBountyMetadata, invalidity, setInvalidity}: any) : JSX.Element {
    const [lastLinkNew, setLastLinkNew] = useState(false);
    
    const addLink = (e) => {
        e.preventDefault();
        if(bountyMetadata?.links.length < 3) {  
            setBountyMetadata((prev) => ({...prev, links: [...prev.links, '']}));
            setLastLinkNew(true);
        }
    };

    const deleteLink = (index: number) => {
        if(bountyMetadata?.links.length > 1) {
            setBountyMetadata((prev) => ({...prev, links: prev.links.filter((_, i) => i !== index)}));
        }
    };

    const setLink = (e: SyntheticEvent, index: number) => {
        setBountyMetadata((prev) => ({...prev, links: [...prev.links.slice(0, index), e.target['value'], ...prev.links.slice(index + 1)]}));
    };
    return (
        <FormControl mb={5}>
            <FormLabel fontWeight="bold">Links</FormLabel>
            <FormHelperText mb={2}>Detailed specs, project workspaces, or any other userful resources (up to 3 max).</FormHelperText>
            <Stack gap={2}>
            { bountyMetadata?.links.map( (link, index) => (
                <LinkInput 
                    key={index} 
                    index={index} 
                    link={link} 
                    setLink={setLink} 
                    deleteLink={deleteLink}                          
                    setInvalidity={setInvalidity} 
                    invalidity={invalidity}
                    lastLinkNew={index === (bountyMetadata?.links.length - 1) ? lastLinkNew : null}
                    setLastLinkNew={setLastLinkNew}
                    />
            ) ) }

            { 
                bountyMetadata.links.length < 3 && 
                    <Button borderWidth="thin" width="max-content" leftIcon={<AddIcon />} onClick={ addLink } cursor="pointer" variant='outline'>
                        Add Another Link
                    </Button>
            }
            </Stack>
        </FormControl>
    )
}