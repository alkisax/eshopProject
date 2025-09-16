import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import RenderedEditorJsContent from "../blogComponents/RenderedEditorJsContent";
import { getPreviewContent } from "../blogUtils/editorHelper";
import { VariablesContext } from "../../context/VariablesContext";
import type { PostType } from "../blogTypes/blogTypes";

const News = () => {
  const { url } = useContext(VariablesContext);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<PostType[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`${url}/api/posts`);
        const allPosts: PostType[] = response.data.data || response.data;
        // ✅ keep only posts whose subPage.name is "news"
        const newsPosts = allPosts.filter(
          (p) => typeof p.subPage === "object" && p.subPage?.name === "news"
        );
        setPosts(newsPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [url]);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {loading && <p>Loading...</p>}
      {!loading && posts.length === 0 && <p>No news posts found</p>}

      <div className="grid gap-6">
        {!loading &&
          posts.map((post) => (
            <Link to={`/posts/${post._id}`} key={post._id}>
              <div className="bg-slate-100 text-black shadow-md rounded-2xl p-6 border border-gray-300 hover:shadow-lg transition-shadow">
                <RenderedEditorJsContent
                  editorJsData={getPreviewContent(post.content)}
                  subPageName={
                    typeof post.subPage === "object" ? post.subPage.name : ""
                  }
                />
                <p className="text-sm text-gray-500 mt-4">
                  {new Date(post.createdAt!).toLocaleString()}
                </p>
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
};

export default News;
