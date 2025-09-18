
import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react'
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

// use forwardref to properly handle the ref
const QuillEditor = ({value,onChange,placeholder,className,height=400}) => {

    // create a separate ref for the ReactQuill component
    const quilRef=useRef();
    const [editorValue, setEditorValue]=useState(value || '');

    // update local state when prop value changes
    useEffect(()=>{
        setEditorValue(value || '')
    },[value]);

    // create memoized onchange handler
    const handleChange= useCallback((value)=>{

        setEditorValue(value || '')
        onChange(value)

    },[onChange])

    // set up editor modules
    const modules={
        toolbar:[
            ['bold','italic','underline','strike'],
            ['blockquote','code-block'],
            [{'header':1}, {'header':2},{'header':3},{'header':4}],
            [{'list':'ordered'}, {'list':'bullet'}],
            [{'script':'sub'}, {'script':'super'}],
            [{'indent':'-1'}, {'indent':'+1'}],
            ['link', 'image'],
            ['clean'],
        ]
    } 

    // setup editor formats
    const formats=[
        'header','bold','italic','underline','strike','blockquote',
        'list','script','indent','link','image','code-block'
    ]

  return (
    <div className={className || ""} style={{height: `${height}px`}}>
        <ReactQuill
          ref={quilRef}
          value={editorValue}
          onChange={handleChange}
          placeholder={placeholder || "write your content..."}
          theme='snow'
          style={{height:`${height-42}px`}}
          modules={modules}
          formats={formats}
        />
    </div>
  )
}

export default QuillEditor