// frontend/src/components/store_components/adminPannelCommodity/AdminCommentsPanel.tsx
import { useEffect, useState, useContext, useCallback } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, IconButton, TablePagination, Tooltip, Stack
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { VariablesContext } from "../../../context/VariablesContext";
import axios from "axios";
import type { CommodityType } from "../../../types/commerce.types";
import type { IUser } from "../../../types/types";

interface CommentType {
  _id?: string;
  user: string | IUser;
  text: string | object;
  rating?: number;
  isApproved?: boolean;
  createdAt?: string;
  commodity: CommodityType; // populated on backend
}

const AdminCommentsPanel = () => {
  const { url } = useContext(VariablesContext);

  const [comments, setComments] = useState<CommentType[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchComments = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get<{ status: boolean; data: CommentType[] }>(
        `${url}/api/commodity/comments`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.status) {
        setComments(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  }, [url]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!window.confirm("Delete this comment?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${url}/api/commodity/comments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchComments();
    } catch (err) {
      console.error("Failed to delete comment", err);
    }
  };

  const handleToggleApproval = async (id?: string, current?: boolean) => {
    if (!id) return;
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${url}/api/commodity/comments/${id}`,
        { isApproved: !current },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchComments();
    } catch (err) {
      console.error("Failed to toggle approval", err);
    }
  };

  const getUserName = (u: string | IUser) => {
    if (!u) return "Anonymous";
    if (typeof u === "string") return u;
    return u.username || u.name || "User";
  };

  const getUserEmail = (u: string | IUser) => {
    if (!u) return "—";
    if (typeof u === "string") return u;
    return u.email || "—";
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        All Comments
      </Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              {/* hidden on small screens */}
              <TableCell sx={{ display: { xs: "none", lg: "table-cell" } }}>
                User
              </TableCell>
              {/* always visible */}
              <TableCell>Email</TableCell>
              <TableCell>Commodity</TableCell>
              <TableCell>Text</TableCell>
              {/* hidden on small screens */}
              <TableCell sx={{ display: { xs: "none", lg: "table-cell" } }}>
                Rating
              </TableCell>
              <TableCell sx={{ display: { xs: "none", lg: "table-cell" } }}>
                Approved
              </TableCell>
              <TableCell sx={{ display: { xs: "none", lg: "table-cell" } }}>
                Created
              </TableCell>
              {/* always visible */}
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {comments
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((c) => (
                <TableRow key={c._id} hover>
                  {/* hidden on small screens */}
                  <TableCell sx={{ display: { xs: "none", lg: "table-cell" } }}>
                    {getUserName(c.user)}
                  </TableCell>
                  {/* always visible */}
                  <TableCell>{getUserEmail(c.user)}</TableCell>
                  <TableCell>{c.commodity?.name || "—"}</TableCell>
                  <TableCell>
                    {typeof c.text === "string"
                      ? c.text
                      : JSON.stringify(c.text)}
                  </TableCell>
                  {/* hidden on small screens */}
                  <TableCell sx={{ display: { xs: "none", lg: "table-cell" } }}>
                    {c.rating ?? "—"}
                  </TableCell>
                  <TableCell sx={{ display: { xs: "none", lg: "table-cell" } }}>
                    {c.isApproved ? "✅" : "❌"}
                  </TableCell>
                  <TableCell sx={{ display: { xs: "none", lg: "table-cell" } }}>
                    {c.createdAt
                      ? new Date(c.createdAt).toLocaleString()
                      : "—"}
                  </TableCell>
                  {/* always visible */}
                  <TableCell align="right">
                    <Stack direction="row" spacing={1}>
                      <Tooltip title={c.isApproved ? "Disapprove" : "Approve"}>
                        <IconButton
                          size="small"
                          color={c.isApproved ? "success" : "default"}
                          onClick={() =>
                            handleToggleApproval(c._id, c.isApproved)
                          }
                        >
                          {c.isApproved ? (
                            <CancelIcon fontSize="small" />
                          ) : (
                            <CheckCircleIcon fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(c._id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={comments.length}
        page={page}
        onPageChange={(_e, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
      />
    </Paper>
  );
};

export default AdminCommentsPanel;
