import axios from "axios";
import { useState, useEffect, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Stack,
} from "@mui/material";
import RenderedEditorJsContent from "../blogComponents/RenderedEditorJsContent";
import { VariablesContext } from "../../context/VariablesContext";
import { UserAuthContext } from "../../context/UserAuthContext";
import type { PostType } from "../blogTypes/blogTypes";

const BlogPost = () => {
  const { url } = useContext(VariablesContext);
  const { user, isLoading, setIsLoading } = useContext(UserAuthContext);

  const [post, setPost] = useState<PostType | null>(null);

  const { id } = useParams();
  const navigate = useNavigate();

  const fetchPost = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${url}/api/posts/${id}`);
      setPost(response.data.data || response.data); // backend sometimes wraps in {status,data}
    } catch (error) {
      console.error("Error fetching post:", error);
    } finally {
      setIsLoading(false);
    }
  }, [id, url, setIsLoading]);

  useEffect(() => {
    if (id) fetchPost();
  }, [id, fetchPost]);

  const navigateToDashboard = () => {
    navigate("/dashboard");
  };

  const editPost = () => {
    navigate(`/edit/${id}`);
  };

  const deletePost = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        setIsLoading(true);
        await axios.delete(`${url}/api/posts/${id}`);
        alert("Post deleted successfully.");
        navigate("/");
      } catch (error) {
        console.error("Error deleting post:", error);
        alert("Failed to delete the post.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!isLoading && !post && (
        <Typography variant="body1" color="error">
          Blog post was not found.
        </Typography>
      )}

      {!isLoading && post && (
        <Paper
          elevation={3}
          sx={{ p: 3, borderRadius: 2, bgcolor: "grey.50" }}
        >
          <RenderedEditorJsContent editorJsData={post.content} />

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 2 }}
          >
            {post.createdAt
              ? new Date(post.createdAt).toLocaleString()
              : "No timestamp"}
          </Typography>

          {user && user.roles?.includes("ADMIN") && (
            <Stack
              direction="row"
              spacing={2}
              justifyContent="center"
              sx={{ mt: 3 }}
            >
              <Button variant="outlined" onClick={navigateToDashboard}>
                Dashboard
              </Button>
              <Button variant="contained" onClick={editPost}>
                Edit
              </Button>
              <Button variant="contained" color="error" onClick={deletePost}>
                Delete
              </Button>
            </Stack>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default BlogPost;
