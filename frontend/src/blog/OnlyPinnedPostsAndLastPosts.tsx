import { useState, useEffect, useContext } from "react"
import { Link } from "react-router-dom"
import axios from 'axios';
import RenderedEditorJsContent from "./blogComponents/RenderedEditorJsContent";
import { getPreviewContent } from "./blogUtils/editorHelper";
import { VariablesContext } from "../context/VariablesContext";
import type { PostType } from "./blogTypes/blogTypes";

const OnlyPinnedPostsAndLastPosts = () => {
  const { url } = useContext(VariablesContext);
  const [loading, setLoading] = useState(true)
  const [pinnedPosts, setPinnedPosts] = useState<PostType[]>([])
  const [lastPosts, setLastPosts] = useState<PostType[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get<PostType[]>(`${url}/api/posts`);
        // console.log("API response.data:", response.data);
        const pinnedOnly = response.data.filter(post => post.pinned === true);

        // Sort all posts by createdAt (newest first) and take the last 3
        const lastThree = response.data
          .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
          .slice(0, 3);

        setLastPosts(lastThree);
        setPinnedPosts(pinnedOnly); 
        setLoading(false);
      } catch (error) {
        console.error("Error fetching posts:", error);
        setLoading(false); 
      }
    };
    
    fetchPosts();
  }, [url]);

  return (
    <>
      <p>pinned:</p>
      <div className="p-4 max-w-4xl mx-auto">
        {loading && <p>Loading...</p>}
        {!loading && pinnedPosts.length === 0 && <p>No posts found</p>}

        <div className="grid gap-6">
            {!loading && pinnedPosts.length !== 0 &&
              pinnedPosts
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
                      {new Date(post.createdAt!).toLocaleString()}
                    </p>
                  </div>
                </Link>
              ))
            }        
        </div>
      </div>

      <p>τελευταίες δημοσιευσεις:</p>
      <div className="p-4 max-w-4xl mx-auto">
        {loading && <p>Loading...</p>}
        {!loading && lastPosts.length === 0 && <p>No posts found</p>}

        <div className="grid gap-6">
            {!loading && lastPosts.length !== 0 &&
              lastPosts
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
                      {new Date(post.createdAt!).toLocaleString()}
                    </p>
                  </div>
                </Link>
              ))
            }        
        </div>
      </div>
    </>
  )
}
export default OnlyPinnedPostsAndLastPosts