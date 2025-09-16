// src/pages/CommodityPage.tsx
import { useParams } from "react-router-dom";
import { useCallback, useContext, useEffect, useState } from "react";
import axios from "axios";
import {
  Typography,
  CircularProgress,
  Box,
  Button,
  Stack,
  Paper,
} from "@mui/material";
import { TextField, Rating, Pagination } from "@mui/material";
import { UserAuthContext } from "../../context/UserAuthContext";
import type { CommodityType } from "../../types/commerce.types";
import { VariablesContext } from "../../context/VariablesContext";
import { CartActionsContext } from "../../context/CartActionsContext";
import type { IUser } from "../../types/types";
import type { Types } from "mongoose";

const CommodityPage = () => {
  const { url } = useContext(VariablesContext);
  const { addOneToCart } = useContext(CartActionsContext)!;

  const [commodity, setCommodity] = useState<CommodityType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState<number | null>(null);
  const [commentPage, setCommentPage] = useState(1);
  const commentsPerPage = 3;

  const comments = (commodity?.comments ?? []).filter(c => c.isApproved);
  const totalComments = comments.length;
  const paginatedComments = comments.slice(
    (commentPage - 1) * commentsPerPage,
    commentPage * commentsPerPage
  );

  const { id } = useParams<{ id: string }>();

  const { user } = useContext(UserAuthContext);

  const ratings = (commodity?.comments ?? [])
    .map(c => c.rating)
    .filter(r => r !== undefined) as number[];
  const averageRating = ratings.length > 0
    ? (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(1)
    : null;

  const handleAddComment = async () => {
    if (!id || !user) return;
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${url}/api/commodity/${id}/comments`,
        { user: user._id, text: newComment, rating: newRating },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // refresh commodity
      const res = await axios.get(`${url}/api/commodity/${id}`);
      setCommodity(res.data.data);
      setNewComment("");
      setNewRating(null);
      setCommentPage(1); // reset to first page
    } catch (err) {
      console.error("Failed to add comment", err);
    }
  };

  const fetchCommodity = useCallback(async () => {
    try {
      const res = await axios.get(`${url}/api/commodity/${id}`);
      setCommodity(res.data.data);

      // 👇 set first image as selected
      if (res.data.data.images?.length > 0) {
        setSelectedImage(res.data.data.images[0]);
      }
    } catch (err) {
      setError("Failed to load commodity.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id, url]);

  useEffect(() => {
    if (id) fetchCommodity();
  }, [id, fetchCommodity]);

  const getCommentUserLabel = (u: string | IUser | Types.ObjectId | undefined): string => {
    if (!u) return "Anonymous";
    if (typeof u === "string") return u; // you may want to filter guest-xxx here
    if ("username" in (u as IUser) && (u as IUser).username) {
      return (u as IUser).username!;
    }
    return "Anonymous";
  };


  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (!commodity) {
    return <Typography>No commodity found.</Typography>;
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Stack spacing={3}>
        {/* === Title === */}
        <Typography variant="h4" gutterBottom>
          {commodity.name}
        </Typography>

        {/* === Image gallery === */}
        <Box sx={{ display: "flex", gap: 2 }}>
          {/* Main image */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
          <img
            src={selectedImage ? selectedImage : "/placeholder.jpg"}
            alt={commodity.name || "No image"}
            style={{
              width: "100%",
              maxHeight: 400,
              borderRadius: 8,
              objectFit: "contain",
              backgroundColor: "#fafafa",
            }}
            onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.jpg" }}
          />
          </Box>

          {/* Thumbnails */}
          {(commodity.images?.length ?? 0) > 1 && (
            <Stack spacing={1}>
              {commodity.images!.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`thumb-${idx}`}
                  style={{
                    width: 80,
                    height: 80,
                    objectFit: "cover",
                    borderRadius: 4,
                    cursor: "pointer",
                    border: img === selectedImage ? "2px solid #1976d2" : "1px solid #ccc", // highlight selected
                  }}
                  onClick={() => setSelectedImage(img)} // 👈 change main image
                />
              ))}
            </Stack>
          )}
        </Box>

        {/* === Price (moved here, more visible) === */}
        <Typography variant="h5" sx={{ fontWeight: "bold", color: "primary.main" }}>
          {commodity.price} {commodity.currency}
        </Typography>

        {/* === Description === */}
        <Typography variant="body1" paragraph>
          {commodity.description || "No description available."}
        </Typography>

        {/* === Categories === */}
        {commodity.category?.length > 0 && (
          <Typography variant="body2">
            Categories: {commodity.category.join(", ")}
          </Typography>
        )}

        {/* === Stock === */}
        <Typography variant="body2">
          {commodity.stock > 0
            ? `In stock (${commodity.stock} available)`
            : "Out of stock"}
        </Typography>

        {/* === Add to Cart === */}
        <Button
          variant="contained"
          sx={{ mt: 2, width: 200 }}
          disabled={commodity.stock === 0}
          onClick={() => addOneToCart(commodity._id)}
        >
          {commodity.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </Button>

        {/* === Reviews section placeholder === */}
        <Paper sx={{ p: 2, mt: 4 }}>
          <Typography variant="h6">Customer Reviews</Typography>

          {averageRating && (
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Rating value={Number(averageRating)} precision={0.5} readOnly />
              <Typography sx={{ ml: 1 }}>({averageRating} / 5)</Typography>
            </Box>
          )}    

          {/* Only logged-in users can add */}
          {user && (
            <Box sx={{ mt: 2 }}>
              <TextField
                label="Write a review"
                fullWidth
                multiline
                minRows={2}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                <Rating
                  value={newRating}
                  onChange={(_, val) => setNewRating(val)}
                />
                <Button
                  variant="contained"
                  sx={{ ml: 2 }}
                  disabled={!newComment.trim()}
                  onClick={handleAddComment}
                >
                  Post
                </Button>
              </Box>
            </Box>
          )}

          {paginatedComments && paginatedComments.length > 0 ? (
            paginatedComments.map((c, idx) => (
              <Box
                key={c._id?.toString() || idx}
                sx={{ mt: 2, p: 2, border: "1px solid #ddd", borderRadius: 2 }}
              >
                <Typography variant="body2">
                  <strong>User:</strong> {getCommentUserLabel(c.user)}
                </Typography>
                <Typography variant="body2">
                  {typeof c.text === "string" ? c.text : JSON.stringify(c.text)}
                </Typography>
                {typeof c.rating === "number" ? (
                  <Typography variant="body2">
                    ⭐ {c.rating}/5
                  </Typography>
                ) : null}
              </Box>
            ))
          ) : (
            <Typography variant="body2">No reviews yet.</Typography>
          )}

          {/* Pagination */}
          {totalComments > commentsPerPage && (
            <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
              <Pagination
                count={Math.ceil(totalComments / commentsPerPage)}
                page={commentPage}
                onChange={(_, val) => setCommentPage(val)}
                color="primary"
              />
            </Box>
          )}
        </Paper>
      </Stack>
    </Box>
  );
};

export default CommodityPage;

