import ReactPaginate from "react-paginate";

interface PaginationProps {
  loading: boolean;
  posts: unknown[];
  goToPage: (page: number) => void;
  currentPage: number;
  pageCount: number;
  handlePageClick: (event: { selected: number }) => void;
}

const Pagination = ({ loading, posts, goToPage, currentPage, pageCount, handlePageClick}: PaginationProps) => {
  
  return(
    <>
        {/* ✅ Pagination Component */}
        {!loading && posts.length > 10 && (
          <div className="mt-6 flex justify-center items-center gap-2">
            {/* First Button */}
            <button
              onClick={() => goToPage(0)}
              disabled={currentPage === 0}
              className={`px-3 py-1 border rounded ${
                currentPage === 0 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              First
            </button>

            <ReactPaginate
              previousLabel={"← Previous"}
              nextLabel={"Next →"}
              breakLabel={"..."}
              pageCount={pageCount}
              marginPagesDisplayed={2}
              pageRangeDisplayed={3}
              onPageChange={handlePageClick}
              forcePage={currentPage} // ✅ Sync with state
              containerClassName={"flex gap-2"}
              pageClassName={"px-3 py-1 border rounded cursor-pointer"}
              activeClassName={"bg-blue-500 text-white"}
              previousClassName={"px-3 py-1 border rounded cursor-pointer"}
              nextClassName={"px-3 py-1 border rounded cursor-pointer"}
              breakClassName={"px-3 py-1 border rounded"}
            />

            {/* Last Button */}
            <button
              onClick={() => goToPage(pageCount - 1)}
              disabled={currentPage === pageCount - 1}
              className={`px-3 py-1 border rounded ${
                currentPage === pageCount - 1 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              Last
            </button>
          </div>
        )}
    </>
  )
}
export default Pagination