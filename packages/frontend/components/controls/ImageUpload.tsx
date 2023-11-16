import {
    Button,
    Center,
    Text,
    HStack,
    useColorModeValue,
    VStack,
    Image
  } from '@chakra-ui/react'
  import React, { useEffect, useState } from 'react'
  
  export const ImageUpload = ({url, setFileTarget}) => {

    const [preview, setPreview] = useState("")

    useEffect(() => {
      if (url) {
        setPreview(url)
      }
    }, [url])

    const fileInput = (e) => {
      setFileTarget(e.target.files[0]);
      processTempLogo(e.target.files[0]);
    }
  
    const dropzoneHandler = (e) => {
      e.preventDefault();
      e.stopPropagation();
    }
    const dropHandler = (e) => {
      dropzoneHandler(e);
      setFileTarget(e.dataTransfer.files[0]);
      processTempLogo(e.dataTransfer.files[0]);
    }

    const processTempLogo = (file) => {
      // get base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result;
        setPreview(base64.toString())
      }
    }

    // open file dialog when text is clicked
    const fileInputRef = React.useRef(null);
    const handleClick = () => {
      fileInputRef.current.click();
    };

  
    return (
      <Center
      
      px="6"
      py="4"
      bg={useColorModeValue('white', 'gray.800')}
      onDrop={dropHandler}
      onDragOver={dropzoneHandler}
      onDragEnter={dropzoneHandler}
      onDragLeave={dropzoneHandler}
      onDragEnd={dropzoneHandler}
      onDragStart={dropzoneHandler}
      onDrag={dropzoneHandler}
      
      onDragExit={dropzoneHandler}
    >

      <VStack spacing="3">
        <Text>Avatar:</Text>
        <Image src={preview} onClick={handleClick} fallbackSrc="https://via.placeholder.com/150?text=+" cursor="pointer" maxWidth={150} maxHeight={150} borderRadius='3xl' objectFit="contain" mt={6}/>
        <VStack spacing="1">
          <HStack spacing="1" whiteSpace="nowrap">
            <Button variant="link" colorScheme="blue" size="sm" onClick={handleClick}>
              Click to change
            </Button>
            <Text fontSize="sm" color="muted">
              or drag and drop
            </Text>
          </HStack>
          <Text fontSize="xs" color="muted">
            PNG, JPG or GIF up to 2MB
          </Text>
        </VStack>
        <input ref={fileInputRef} type="file" onChange={fileInput} style={{height:'0px', margin:'0px', visibility: 'hidden'}} />
      </VStack>
    </Center>
    )  
}