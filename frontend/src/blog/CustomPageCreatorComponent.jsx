
const CustomPageCreatorComponent = ({
  handlePageSelect,
  selectedPage,
  pages,
  newPage,
  setNewPage,
  handleNewPageSubmit,
  backEndUrl,
  setPages,
  setSelectedPage
}) => {

  return (
    <>
      {/* Προσθήκη λογικής για custom pages */}
      <div className="w-full max-w-md mx-auto">
        <select 
          onChange={(e) => handlePageSelect(e, setSelectedPage)} 
          value={selectedPage}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select a page</option>
          {pages.map(p => (
            <option key={p._id} value={p._id}>{p.name}</option>
          ))}
          <option value="__new__">+ Create new page</option>
        </select>

        {selectedPage === '' && (
          <div>
            <input
              type="text"
              value={newPage}
              onChange={e => setNewPage(e.target.value)}
              placeholder="New page name"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button 
              onClick={() => handleNewPageSubmit(pages, newPage, backEndUrl, setPages, setSelectedPage, setNewPage)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Create page
            </button>
          </div>
        )}
      </div>    
    </>
  )
}

export default CustomPageCreatorComponent