import EditorJs from '../components/EditorJs';

const EditBlogPost = ({ editorJsData, setEditorJsData, backEndUrl, editorRef }) => {

  return (
    <>

      <EditorJs 
        editorJsData={editorJsData} 
        setEditorJsData={setEditorJsData}
        backEndUrl={backEndUrl}
        isEditMode={true}
        editorRef={editorRef}
      />
    </>
  )
}

export default EditBlogPost