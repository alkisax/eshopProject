import axios from 'axios';
import { useState, useEffect } from "react"
import { useParams, useNavigate  } from 'react-router-dom';
import RenderedEditorJsContent from "../components/RenderedEditorJsContent";

const BlogPost = ({ backEndUrl, admin }) => {
  const [loading, setLoading] = useState(true)
  const [post, setPost] = useState(null)

  const { id } = useParams();
  const navigate = useNavigate();

  // if (admin !== null) console.log("BlogPost: is admin?", admin)
  // else console.log("BlogPost: is admin? no")

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`${backEndUrl}/api/posts/${id}`);
        console.log("blogpost:", response);
        
        setPost(response.data); 
        setLoading(false);
      } catch (error) {
        console.error("Error fetching posts:", error);
        setLoading(false); 
      }
    };
    
    if (id) {
      fetchPost();
    }
  }, [backEndUrl, id]);

  const navigateToDashboard = () => {
    navigate('/dashboard');
  }

  const editPost = () => {
    navigate(`/edit/${id}`);
  }

  const deletePost = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await axios.delete(`${backEndUrl}/api/posts/${id}`);
        alert("Post deleted successfully.");
        navigate('/');
      } catch (error) {
        console.error("Error deleting post:", error);
        alert("Failed to delete the post.");
      }
    }
  };

  return (
    <>
      <div className="p-4 max-w-4xl mx-auto">
        {loading && <p>Loading...</p>}
        {!loading && !post && <p>Blog post was not found</p>}

        <div className="grid gap-6">
            {!loading && post &&

                <div 
                  key={post._id}
                  className="bg-slate-100 text-black shadow-md rounded-2xl p-6 border border-gray-300 hover:shadow-lg transition-shadow"
                >
                  <RenderedEditorJsContent editorJsData={post.content} />
                  <p className="text-sm text-gray-500 mt-4">
                    {new Date(post.createdAt).toLocaleString()}
                  </p>
                  {admin && (
                  <div className='btnDiv flex gap-3 mx-3 justify-center'>
                    <button 
                      onClick={navigateToDashboard}
                      className='bg-blue-500 text-white px-4 py-2 rounded'
                    >
                      Dashboard
                    </button>
                    <button 
                      onClick={editPost}
                      className='bg-blue-500 text-white px-4 py-2 rounded'
                    >
                      Edit
                    </button>
                    <button
                      onClick={deletePost}
                      className="bg-red-500 text-white px-4 py-2 rounded"
                    >
                      Delete
                    </button>
                  </div>                    
                  )}
                </div>

            }        
        </div>    
      </div>
    </>
  )
}

export default BlogPost
