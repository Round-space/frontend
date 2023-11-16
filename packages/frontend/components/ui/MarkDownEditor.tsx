import React, { useState, useRef, useEffect } from 'react'
import { Textarea, Box, Button, ButtonGroup } from '@chakra-ui/react'

export default function MarkdownEditor({value, onChange, ...props}) : JSX.Element {
  const [text, setText] = useState(value)
  const textareaRef = useRef(null)

  const handleTextareaChange = (e) => {
    setText(e.target.value)
  }

  const handleHeadingClick = (level) => {
    const { current: textarea } = textareaRef
    const { selectionStart, selectionEnd } = textarea
    const selectedText = text.slice(selectionStart, selectionEnd)
    const headingSymbols = '#'.repeat(level)
    const newText = `${text.slice(0, selectionStart)}${headingSymbols} ${selectedText}${text.slice(selectionEnd)}`
    setText(newText)
    textarea.focus()
    const newSelectionStart = selectionStart + level + 1
    const newSelectionEnd = selectionEnd + level + 1
    textarea.setSelectionRange(newSelectionStart, newSelectionEnd)
  }
  
  const handleBoldClick = () => {
    const { current: textarea } = textareaRef
    const { selectionStart, selectionEnd } = textarea
    const selectedText = text.slice(selectionStart, selectionEnd)
    const newText = `${text.slice(0, selectionStart)}**${selectedText}**${text.slice(selectionEnd)}`
    setText(newText)
    textarea.focus()
    const newSelectionStart = selectionStart + 2
    const newSelectionEnd = selectionEnd + 2
    textarea.setSelectionRange(newSelectionStart, newSelectionEnd)
  }

  const handleItalicClick = () => {
    const { current: textarea } = textareaRef
    const { selectionStart, selectionEnd } = textarea
    const selectedText = text.slice(selectionStart, selectionEnd)
    const newText = `${text.slice(0, selectionStart)}_${selectedText}_${text.slice(selectionEnd)}`
    setText(newText)
    textarea.focus()
    const newSelectionStart = selectionStart + 1
    const newSelectionEnd = selectionEnd + 1
    textarea.setSelectionRange(newSelectionStart, newSelectionEnd)
  }

//   const handleStrikethroughClick = () => {
//     const { current: textarea } = textareaRef
//     const { selectionStart, selectionEnd } = textarea
//     const selectedText = text.slice(selectionStart, selectionEnd)
//     const newText = `${text.slice(0, selectionStart)}~~${selectedText}~~${text.slice(selectionEnd)}`
//     setText(newText)
//     textarea.focus()
//     const newSelectionStart = selectionStart + 2
//     const newSelectionEnd = selectionEnd + 2
//     textarea.setSelectionRange(newSelectionStart, newSelectionEnd)
//   }

  

  const handleBlockquoteClick = () => {
    const { current: textarea } = textareaRef
    const { selectionStart, selectionEnd } = textarea
    const selectedText = text.slice(selectionStart, selectionEnd)
    const newText = `${text.slice(0, selectionStart)}> ${selectedText}${text.slice(selectionEnd)}`
    setText(newText)
    textarea.focus()
    const newSelectionStart = selectionStart + 2
    const newSelectionEnd = selectionEnd + 2
    textarea.setSelectionRange(newSelectionStart, newSelectionEnd)
  }
  
  
  useEffect(() => {
    setText(value);
  }, [value])

  useEffect(() => {
    onChange({
        target: {
            value: text
        }
    })
  }, [text])

  return (
    <Box>
      <ButtonGroup marginBottom="4" size='sm'>
        <Button onClick={() => handleHeadingClick(1)}>H1</Button>
        <Button onClick={() => handleHeadingClick(2)}>H2</Button>
        <Button onClick={() => handleHeadingClick(3)}>H3</Button>
        <Button onClick={() => handleHeadingClick(4)}>H4</Button>
        <Button onClick={() => handleHeadingClick(5)}>H5</Button>
        <Button onClick={() => handleHeadingClick(6)}>H6</Button>

        <Button onClick={handleBoldClick}>B</Button>
        <Button onClick={handleItalicClick}>I</Button>
        {/* <Button onClick={handleStrikethroughClick}>Strikethrough</Button> */}
        
        <Button onClick={handleBlockquoteClick}>Blockquote</Button>
        
      </ButtonGroup>
      <Textarea
        ref={textareaRef}
        value={text}
        onChange={handleTextareaChange}
        mt={4}
        {...props}
      />
      
    </Box>
  )
}
