import CustomPageCreatorComponent from './CustomPageCreatorComponent';

const LeftSidebarDashboard = ({
  navigateToPosts,
  navigateToUploads,
  setEditorJsData,
  editorRef,
  handlePreview,
  handleSubmit,
  backEndUrl,
  selectedPage,
  isPinned,
  setIsPinned,
  isEditMode,
  id,
  handlePageSelect,
  handleNewPageSubmit,
  pages,
  setPages,
  setSelectedPage,
  newPage,
  setNewPage,
}) => {

  return (
    <div 
      className="
        bg-blue-100 text-blue-900
        p-4
        flex flex-col flex-wrap sm:flex-col
        sm:h-full
        gap-2
        w-full
        overflow-hidden
      "
    >
      <button
        onClick={navigateToPosts}
        className="px-4 py-2 bg-blue-600 text-white rounded sm:w-full flex-shrink-0 text-sm"
      >
        Posts
      </button>
      <button 
        onClick={navigateToUploads}
        className="px-4 py-2 bg-blue-600 text-white rounded sm:w-full flex-shrink-0 text-sm"
      >
        Uploaded Files
      </button>


      <br />
      <hr />
      <strong>post:</strong>
      <CustomPageCreatorComponent 
        handlePageSelect={handlePageSelect}
        selectedPage={selectedPage}
        pages={pages}
        newPage={newPage}
        setNewPage={setNewPage}
        handleNewPageSubmit={handleNewPageSubmit}
        backEndUrl={backEndUrl}
        setPages={setPages}
        setSelectedPage={setSelectedPage}
      />
      <button 
        onClick={() => handlePreview(editorRef, setEditorJsData)}
        className="px-4 py-2 bg-blue-600 text-white rounded sm:w-full flex-shrink-0 text-sm"
      >
        preview
      </button>
      <button 
        onClick={() => handleSubmit(editorRef, setEditorJsData, isEditMode, id, backEndUrl, selectedPage, isPinned)}
        className="px-4 py-2 bg-blue-600 text-white rounded sm:w-full flex-shrink-0 text-sm"
        >
        submit
      </button>
        <div className="flex items-center gap-2 mt-4">
          <input
            type="checkbox"
            id="pinned"
            checked={isPinned}
            onChange={(e) => setIsPinned(e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="pinned" className="text-gray-700">Pinned Post</label>
        </div> 
      <hr />


      <br />
      <strong>testing text</strong>
      <hr />
      <p>
        !Lorem ipsum dolor, sit amet consectetur adipisicing elit. Commodi minus illum nisi est? At quisquam id nulla molestias delectus, rerum quas provident illo corrupti dolor minus, sint vero obcaecati incidunt?    
      </p>
    </div>
  )
}
export default LeftSidebarDashboard