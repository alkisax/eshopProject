import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import RenderedEditorJsContent from "../blogComponents/RenderedEditorJsContent";
import { getPreviewContent } from "../blogUtils/editorHelper";
import { VariablesContext } from "../../context/VariablesContext";
import type { PostType } from "../blogTypes/blogTypes";
import { Helmet } from "react-helmet-async";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Grid,
  Typography,
} from "@mui/material";
import NewsSkeleton from "../../components/skeletons/NewsSkeleton";

const News = () => {
  const { url } = useContext(VariablesContext);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<PostType[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);

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

  if (loading) {
    return (
      <NewsSkeleton />
    );
  }

  if (!loading && posts.length === 0) {
    return (
      <Typography variant="h6" align="center" color="text.secondary" mt={4}>
        No news posts found
      </Typography>
    );
  }

  return (
    <>
      <Helmet>
        <title>Νέα | Έχω μια Ιδέα</title>
        <meta
          name="description"
          content="Διαβάστε τα τελευταία νέα από το εργαστήρι μας: εκδηλώσεις, παρουσιάσεις και ενημερώσεις για χειροποίητα κοσμήματα."
        />
        <link
          rel="canonical"
          href={window.location.origin + window.location.pathname}
        />
      </Helmet>

      <Typography
        component='h1'
        variant="h3"
        gutterBottom
        sx={{
          fontSize: { xs: "1.8rem", md: "2.5rem" },
          fontWeight: "bold",
          textAlign: "center",
          mb: 4,
        }}
      >
        Νέα από το Εργαστήρι
      </Typography>

      <Box p={4} maxWidth="lg" mx="auto">
        <Grid container spacing={3}>
          {posts.map((post) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={post._id}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: 3,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardActionArea
                  component={Link}
                  to={`/posts/${post.slug}`}
                  sx={{ textDecoration: "none" }}
                >
                  <CardContent>
                    {/* Title */}
                    <Typography
                      variant="h6"
                      gutterBottom
                      fontWeight="bold"
                      color="primary"
                    >
                      {post.title}
                    </Typography>

                    {/* Preview content */}
                    <RenderedEditorJsContent
                      editorJsData={getPreviewContent(post.content)}
                      subPageName={
                        typeof post.subPage === "object" ? post.subPage.name : ""
                      }
                    />

                    {/* Date */}
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      mt={2}
                    >
                      {new Date(post.createdAt!).toLocaleString()}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>    
    </>
  );
};

export default News;
