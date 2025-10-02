import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import RenderedEditorJsContent from "../blogComponents/RenderedEditorJsContent";
import { getPreviewContent } from "../blogUtils/editorHelper";
import { VariablesContext } from "../../context/VariablesContext";
import type { PostType } from "../blogTypes/blogTypes";
import { Box, Card, CardActionArea, CardContent, CircularProgress, Grid, Typography } from "@mui/material";
import { UserAuthContext } from "../../context/UserAuthContext";
import { Helmet } from "react-helmet-async";

const Announcements = () => {
  const { isLoading, setIsLoading } = useContext(UserAuthContext);
  const { url } = useContext(VariablesContext);
  const [posts, setPosts] = useState<PostType[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`${url}/api/posts`);
        const allPosts: PostType[] = response.data.data || response.data;
        // ✅ keep only posts whose subPage.name is "announcements"
        const newsPosts = allPosts.filter(
          (p) => typeof p.subPage === "object" && p.subPage?.name === "announcements"
        );
        setPosts(newsPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, [setIsLoading, url]);

    if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isLoading && posts.length === 0) {
    return (
      <Typography variant="h6" align="center" color="text.secondary" mt={4}>
        No announcements found
      </Typography>
    );
  }

  return (
    <>
      <Helmet>
        <title>Ανακοινώσεις | Έχω μια Ιδέα</title>
        <meta
          name="description"
          content="Δείτε τις τελευταίες ανακοινώσεις από το εργαστήρι μας: νέα προϊόντα, συμμετοχές σε εκθέσεις και ειδικές ενημερώσεις."
        />
        <link
          rel="canonical"
          href={window.location.origin + window.location.pathname}
        />
      </Helmet>

      <Box p={4} maxWidth="lg" mx="auto">
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          align="center"
          fontWeight="bold"
        >
          Ανακοινώσεις
        </Typography>
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
                  sx={{ textDecoration: "none" }} // no underline
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
                        typeof post.subPage === "object"
                          ? post.subPage.name
                          : ""
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

export default Announcements;
