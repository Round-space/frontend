/* eslint-disable @typescript-eslint/no-unused-vars, no-console */
import React, { useRef } from 'react'
import {
    Button,
    Stack,
    Input,
    FormControl,
    Flex,
    Textarea,
    VisuallyHidden,
    useColorModeValue,
    Icon,
    Text,
    chakra,
  } from '@chakra-ui/react'

function DragAndDrop({onFileSelect})  : JSX.Element {

    const fileInput = useRef(null);
    const handleFileInput = (e) =>{
        onFileSelect(e.target.files[0]);
    }
    const handleClickImportFile = (e)=>{
        fileInput.current && fileInput.current.click();
    }
//   state = {
//     drag: false
//   }
//   dragCounter = 0;
//   dropRef = React.createRef()
//   handleDrag = (e) => {
//     e.preventDefault()
//     e.stopPropagation()
//   }
//   handleDragIn = (e) => {
//     e.preventDefault()
//     e.stopPropagation()
//     this.dragCounter++
//     if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
//       this.setState({drag: true})
//     }
//   }
//   handleDragOut = (e) => {
//     e.preventDefault()
//     e.stopPropagation()
//     this.dragCounter--
//     if (this.dragCounter === 0) {
//       this.setState({drag: false})
//     }
//   }
//   handleDrop = (e) => {
//     e.preventDefault()
//     e.stopPropagation()
//     this.setState({drag: false})
//     if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
//       this.props.handleDrop(e.dataTransfer.files)
//       e.dataTransfer.clearData()
//       this.dragCounter = 0    
//     }
//   }
//   componentDidMount() {
//     let div = this.dropRef.current
//     div.addEventListener('dragenter', this.handleDragIn)
//     div.addEventListener('dragleave', this.handleDragOut)
//     div.addEventListener('dragover', this.handleDrag)
//     div.addEventListener('drop', this.handleDrop)
//   }
//   componentWillUnmount() {
//     let div = this.dropRef.current
//     div.removeEventListener('dragenter', this.handleDragIn)
//     div.removeEventListener('dragleave', this.handleDragOut)
//     div.removeEventListener('dragover', this.handleDrag)
//     div.removeEventListener('drop', this.handleDrop)
//   }


return  (
    <Flex
    mt={1}
    justify="center"
    px={6}
    pt={5}
    pb={6}
    borderWidth={1}
    rounded="md"
  >
    <Stack spacing={1} textAlign="center">
      <Icon
        mx="auto"
        boxSize={12}
        color={useColorModeValue('gray.400', 'gray.500')}
        stroke="currentColor"
        fill="none"
        viewBox="0 0 48 48"
        aria-hidden="true"
      >
        <path
          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Icon>
<Flex fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')} alignItems="baseline">
            <chakra.label
            htmlFor="file-upload"
            cursor="pointer"
            rounded="md"
            fontSize="md"
            color={useColorModeValue('brand.600', 'brand.200')}
            pos="relative"
            _hover={{
                color: useColorModeValue('brand.400', 'brand.300'),
            }}
            >
            <Button variant={'link'} onClick={handleClickImportFile}> Upload a file about your work</Button>
            <VisuallyHidden>
                <input  id="file-upload" name="file-upload" type="file" onChange={handleFileInput} />
            </VisuallyHidden>
            </chakra.label>
            <Text pl={1}>or drag and drop a file</Text>
            </Flex>                <Text
                  fontSize="xs"
                  color={useColorModeValue('gray.500', 'gray.50')}
                >
                  PNG, JPG, GIF up to 10MB
                </Text>
              </Stack>
            </Flex>
);
}
export default DragAndDrop;