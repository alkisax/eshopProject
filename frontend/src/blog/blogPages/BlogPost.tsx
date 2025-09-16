import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import RenderedEditorJsContent from "../blogComponents/RenderedEditorJsContent";
import { VariablesContext } from "../../context/VariablesContext";
import {
  Box,
  CircularProgress,
  Container,
  Paper,
  Typography,
} from "@mui/material";
import type { PostType } from "../blogTypes/blogTypes";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { url } = useContext(VariablesContext);

  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<PostType | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`${url}/api/posts/slug/${slug}`);
        const postData: PostType = response.data.data || response.data;
        setPost(postData);
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPost();
    }
  }, [slug, url]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!post) {
    return (
      <Typography variant="h6" align="center" color="text.secondary" mt={4}>
        Post not found
      </Typography>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          borderRadius: 3,
        }}
      >
        {/* Title */}
        <Typography
          variant="h4"
          fontWeight="bold"
          gutterBottom
          color="primary"
          textAlign="center"
        >
          {post.title}
        </Typography>

        {/* Date */}
        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          textAlign="center"
          mb={3}
        >
          {new Date(post.createdAt!).toLocaleString()}
        </Typography>

        {/* Content */}
        <RenderedEditorJsContent
          editorJsData={post.content}
          subPageName={
            typeof post.subPage === "object" ? post.subPage.name : ""
          }
        />
      </Paper>
    </Container>
  );
};

export default BlogPost;
