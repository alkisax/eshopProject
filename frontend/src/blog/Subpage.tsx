import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useParams  } from 'react-router-dom';
import axios from 'axios';
import RenderedEditorJsContent from "../components/RenderedEditorJsContent";
import { getPreviewContent } from "../utils/editorHelper";
import { usePagination } from "../hooks/usePagination";
import Pagination from "../components/Pagination";

const Subpage = ({ backEndUrl, forcedName }) => {
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState([])
  const [pages, setPages] = useState([])

  useEffect(() => {
    const getpages = async () => {
      const res = await axios.get(`${backEndUrl}/api/subPages`)
      setPages(res.data)
    }
    getpages()
  }, [backEndUrl])

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`${backEndUrl}/api/posts`);
        setPosts(response.data); 
        setLoading(false);
      } catch (error) {
        console.error("Error fetching posts:", error);
        setLoading(false); 
      }
    };
    
    fetchPosts();
  }, [backEndUrl]);

  const { name: paramName } = useParams();
  const name = forcedName || paramName;
  const currentSubPage = pages.find((page) => page.name === name)
  const currentPageId = currentSubPage?._id
  const filteredPosts = posts.filter(
    (post) => post.subPage?._id === currentPageId
  )

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (a.pinned !== b.pinned) {
      return b.pinned - a.pinned; // pinned first
    }
    return new Date(b.createdAt) - new Date(a.createdAt); // newest first
  });

  // Use pagination on sortedPosts
  const { currentItems: currentPosts, pageCount, currentPage, handlePageClick, goToPage } =
  usePagination(sortedPosts, 10);

  return (
    <>
      <div className="p-4 max-w-4xl mx-auto">
        {loading && <p>Loading...</p>}
        {!loading && posts.length === 0 && <p>No posts found</p>}

        <div className="grid gap-6">
            {!loading && posts.length !== 0 &&
              [...currentPosts]
                .sort((a, b) => b.pinned - a.pinned)
                .map((post) => (
                <Link to={`/posts/${post._id}`} key={post._id}>
                  <div 
                    className={`bg-slate-100 text-black shadow-md rounded-2xl p-6 hover:shadow-lg transition-shadow ${post.pinned ? "border-4 border-gray-400" : "border border-gray-300"}`}
                  >
                      <RenderedEditorJsContent
                        editorJsData={getPreviewContent(post.content)}
                        subPageName={post.subPage?.name}
                      />

                    <p className="text-sm text-gray-500 mt-4">
                      {new Date(post.createdAt).toLocaleString()}
                    </p>
                  </div>
                </Link>
              ))
            }        
        </div>
        <Pagination
          loading={loading}
          posts={sortedPosts} // Pass the full list, not paginated
          goToPage={goToPage}
          currentPage={currentPage}
          pageCount={pageCount}
          handlePageClick={handlePageClick}
        /> 
      </div>
    </>
  )
}
export default Subpage