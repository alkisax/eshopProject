import { useEffect, useState, useContext } from "react";
import axios from "axios";
import {  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Pagination, Stack, Typography, } from "@mui/material";
import { VariablesContext } from "../../context/VariablesContext";
import type { PostType } from "../../blog/blogTypes/blogTypes";

// αυτή η αλλαγή έγινε γιατι όταν πατάμε admin δνε πάμε σε νέα σελίδα αλλά αλλάζουμε tab στο admin panel οπου μάλιστα πρέπει να περάσουμε και ένα state για το id ωστε να φορτωθεί ο editor populated
interface Props {
  onEdit: (id: string) => void;
}

const AdminPostsPanel = ({ onEdit }: Props) => {
  const { url } = useContext(VariablesContext);

  const [posts, setPosts] = useState<PostType[]>([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(5);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get(`${url}/api/posts`);
        setPosts(res.data.data || res.data);
      } catch (err) {
        console.error("Error fetching posts:", err);
      }
    };
    fetchPosts();
  }, [url]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await axios.delete(`${url}/api/posts/${id}`);
      setPosts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Error deleting:", err);
      alert("Failed to delete post.");
    }
  };

  const handleEdit = (id: string) => {
    onEdit(id);
  };

  // Pagination logic
  const paginatedPosts = posts.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        All Posts
      </Typography>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>SubPage</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedPosts.map((post) => (
              <TableRow key={post._id}>
                <TableCell>{post.title}</TableCell>
                <TableCell>
                  {typeof post.subPage === "object"
                    ? post.subPage?.name
                    : post.subPage}
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleEdit(post._id!)}
                    >
                      Update
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleDelete(post._id!)}
                    >
                      Remove
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
        <Pagination
          count={Math.ceil(posts.length / rowsPerPage)}
          page={page}
          onChange={(_, value) => setPage(value)}
        />
      </Stack>
    </Paper>
  );
};

export default AdminPostsPanel;
