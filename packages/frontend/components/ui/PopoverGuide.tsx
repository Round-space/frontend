import { QuestionIcon, WarningIcon } from "@chakra-ui/icons";


import { Popover, PopoverArrow, PopoverBody, PopoverContent, PopoverHeader, PopoverTrigger as OrigPopoverTrigger, useDisclosure } from "@chakra-ui/react";

export const PopoverTrigger: React.FC<{ children: React.ReactNode }> =
  OrigPopoverTrigger

export default function PopoverGuide({title, text, ...props}): JSX.Element {
    const { onOpen, onClose, isOpen } = useDisclosure();
    return (
        <Popover
            isOpen={isOpen}
            onOpen={onOpen}
            onClose={onClose}
            placement='right'
            trigger="hover"
        >
            <PopoverTrigger>
            
                { props.isWarning ? <WarningIcon boxSize={4} color="yellow.500"/> 
                : <QuestionIcon boxSize={4} /> }
                
            </PopoverTrigger>
            <PopoverContent p={5}>
                <PopoverArrow />
                <PopoverHeader fontWeight="bold" border="hidden">{title}</PopoverHeader>
                <PopoverBody>{text}</PopoverBody>
            </PopoverContent>
      </Popover>
    );

}