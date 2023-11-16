import { Box } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';

import 'react-quill/dist/quill.snow.css';

const QuillEditor = ({value, onChange}) => {
  
  const [valueLoaded, setValueLoaded] = useState(false);
  
  const quillRef = React.useRef();
  
  const handleChange = (content, delta, source, editor) => {
    onChange({
      target: {
        value: editor.getText().length > 1 ? JSON.stringify(editor.getContents()) : null
      }
    });
  };

  useEffect(() => {
    if(value) {
      setValueLoaded(true);
    }
  }, [value])


  useEffect(() => {
    if(quillRef?.current && valueLoaded) {
      
        // is value json?
        try {
            const parsed = JSON.parse(value);
            // setDelta(parsed);
            (quillRef.current as any).getEditor()?.setContents(parsed);
        } catch(e) {
            // as non formatted delta string
            const ops = value.split("\n").map((line) => ({ insert: line + "\n" }));
            (quillRef.current as any).getEditor()?.setContents({ops});
        }

    }
  }, [quillRef, valueLoaded])

  return (
    <Box 
      sx={{
        '& .ql-toolbar': {
          borderTop: 'none',
          borderLeft: 'none',
          borderRight: 'none',
        },
        '& .ql-editor': {
          minHeight: '100px'
        },
        '& .ql-container': {
          border: 'none'
        }
      }}>
      <ReactQuill
        ref={quillRef}
        onChange={handleChange}
        modules={{
          toolbar: [
            [{ header: [1, 2, false] }],
            ['bold', 'italic', 'underline'],
            ['blockquote', 'code-block'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            // [{ indent: '-1' }, { indent: '+1' }],
            // [{ align: [] }],
            ['link' 
              // 'image', 'video'
            ],
            ['clean'],
          ],
        }}
      />
    </Box>
  );
};

export default QuillEditor;