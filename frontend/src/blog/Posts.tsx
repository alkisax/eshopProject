import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from 'axios';
import RenderedEditorJsContent from "../components/RenderedEditorJsContent";
import { getPreviewContent } from "../utils/editorHelper";
import { usePagination } from "../hooks/usePagination";
import Pagination from "../components/Pagination";

const Posts = ({ backEndUrl }) => {
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState([])

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
  

  const { currentItems: currentPosts, pageCount, currentPage, handlePageClick, goToPage } =
  usePagination(posts, 10);

  return (
    <>
      {/* <h1 className="text-2xl font-bold mb-4 text-center">All Posts</h1> */}
      <div className="p-4 max-w-4xl mx-auto">
        {loading && <p>Loading...</p>}
        {!loading && posts.length === 0 && <p>No posts found</p>}

        <div className="grid gap-6">
            {!loading && posts.length !== 0 &&
              currentPosts.map((post) => (
                <Link to={`/posts/${post._id}`}>
                  <div 
                    key={post._id}
                    className="bg-slate-100 text-black shadow-md rounded-2xl p-6 border border-gray-300 hover:shadow-lg transition-shadow"
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
          posts={posts}
          goToPage={goToPage}
          currentPage={currentPage}
          pageCount={pageCount}
          handlePageClick={handlePageClick}
        />

      </div>
    </>
  )
}
export default Posts