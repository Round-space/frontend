import { Box, Alert, AlertTitle, AlertDescription, useDisclosure } from "@chakra-ui/react";

export function Banner(props): JSX.Element {
  const {
    isOpen: isVisible,
  } = useDisclosure({ defaultIsOpen: true })

  const { status, title, description } = props;

  const isDiplayed = status == "Draft" ? true : false;

  return (
    isVisible && isDiplayed ? (
      <Alert colorScheme="whiteAlpha" borderColor="blackAlpha.800" borderWidth="thin" rounded="xl" status='info'>
        <Box>
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription>
            {description}
          </AlertDescription>
        </Box>
{/* 
        <CloseButton
          alignSelf='flex-start'
          position='absolute'
          m={1}
          right={0}
          top={0}
          onClick={onClose}
        /> */}
      </Alert>
    ) : (<></>)
  );
}

