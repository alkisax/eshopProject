// frontend/src/components/store_components/adminPannelCommodity/AdminCommentsPanel.tsx
import { useEffect, useState, useContext, useCallback } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, IconButton, TablePagination, Tooltip, Stack,
  FormControlLabel,
  Switch
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { VariablesContext } from "../../../context/VariablesContext";
import axios from "axios";
import type { CommentType } from "../../../types/commerce.types";
import { AiModerationContext } from "../../../context/AiModerationContext";

const AdminCommentsPanel = () => {
  const { url } = useContext(VariablesContext);
  const { aiModerationEnabled, setAiModerationEnabled } = useContext(AiModerationContext);

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

  const handleDelete = async (comment: CommentType) => {
    // Prefer explicit commentId if it exists, fallback to comment._id
    const commodityId = comment.commodity?._id || comment._id;
    const commentId = comment.commentId || comment._id;

    console.log("Deleting comment", commentId, "from commodity", commodityId);

    if (!commentId || !commodityId) return;
    if (!window.confirm("Delete this comment?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${url}/api/commodity/${commodityId}/comments/${commentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchComments();
    } catch (err) {
      console.error("Failed to delete comment", err);
    }
  };

  const handleToggleApproval = async (comment: CommentType) => {
    const commodityId = comment.commodity?._id || comment._id;  // commodity id
    const commentId = comment.commentId;                        // comment id

    if (!commodityId || !commentId) return;

    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${url}/api/commodity/${commodityId}/comments/${commentId}`,   // ✅ match backend
        { isApproved: !comment.isApproved },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchComments();
    } catch (err) {
      console.error("Failed to toggle approval", err);
    }
  };

  const getUserName = (u: CommentType["user"]) => {
    if (!u) return "Anonymous";
    if (typeof u === "string") return u; // sometimes it's just the id string
    if ("username" in u && u.username) return u.username;
    if ("name" in u && u.name) return u.name;
    return "User";
  };

  const getUserEmail = (u: CommentType["user"]) => {
    if (!u) return "—";
    if (typeof u === "string") return "—";
    return u.email || "—";
  };

  return (
    <Paper sx={{ p: 2 }}>
      <FormControlLabel
        control={
          <Switch
            checked={aiModerationEnabled}
            onChange={(e) => {
              const enabled = e.target.checked;
              setAiModerationEnabled(enabled);
              console.log(`🔎 AI Moderation turned ${enabled ? "ON" : "OFF"}`);
            }}
          />
        }
        label="AI Moderation"
      />
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
              .map((c, idx) => (
                <TableRow key={`${c._id}-${idx}`} hover>
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
                          onClick={() => handleToggleApproval(c)}
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
                          onClick={() => handleDelete(c)}
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
