// src/pages/CommodityPage.tsx
import { useParams } from "react-router-dom";
import { useCallback, useContext, useEffect, useState } from "react";
import axios from "axios";
import { Typography, CircularProgress, Box, Button, Stack, Paper, } from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { TextField, Rating, Pagination } from "@mui/material";
import { UserAuthContext } from "../../context/UserAuthContext";
import type { CommodityType } from "../../types/commerce.types";
import { VariablesContext } from "../../context/VariablesContext";
import { CartActionsContext } from "../../context/CartActionsContext";
import type { IUser } from "../../types/types";
import type { Types } from "mongoose";
import { AiModerationContext } from "../../context/AiModerationContext";
import { useAnalytics } from "@keiko-app/react-google-analytics"; // GA

const CommodityPage = () => {
  const { url, setHasFavorites } = useContext(VariablesContext);
  const { addOneToCart } = useContext(CartActionsContext)!;
  const { aiModerationEnabled } = useContext(AiModerationContext);

  const [commodity, setCommodity] = useState<CommodityType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState<number | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false); //προστέθηκε αυτό για να μην κάνει autoload το uaggestion και μου ΄καίει' τα λεφτα στο openAI api
  const [suggested, setSuggested] = useState<CommodityType[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
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

  const { tracker } = useAnalytics() || {}; //GA

  // GA google analitics - track specific view of item
  useEffect(() => {
    if (commodity && tracker?.trackEvent) {
      tracker.trackEvent("view_item", {
        item_id: commodity._id,
        item_name: commodity.name,
        price: commodity.price,
        currency: commodity.currency,
      });
    }
  }, [commodity, tracker]);

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

      let approvedFlag = true;

      // ✅ If AI moderation is active, pre-check comment
      if (aiModerationEnabled) {
        const modRes = await axios.post(
          `${url}/api/moderationAi`,
          { commentToCheck: newComment },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("modRes.data.data", modRes.data.data);
        
        // If flagged, store as unapproved
        if (modRes.data.data === false) {
          approvedFlag = false;
        }
      }

      // always save the comment to DB
      await axios.post(
        `${url}/api/commodity/${id}/comments`,
        { user: user._id, text: newComment, rating: newRating, isApproved: approvedFlag},
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

  // χρησιμοποιείτε στην παρακάτω useEffect
  interface SemanticSearchResult {
    commodity: CommodityType;
    score: number;
  }

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!showSuggestions || !commodity?._id) return;

      try {
        const res = await axios.get<{ status: boolean; data: SemanticSearchResult[] }>(
          `${url}/api/ai-embeddings/search`,
          { params: { query: commodity.name } } // TODO στο μέλλον θα πρέπει το backend να δέχετε vector
        );

        // flatten to just commodities
        setSuggested(res.data.data.map(r => r.commodity));
      } catch (err) {
        console.error("Error fetching suggestions:", err);
      }
    };

    fetchSuggestions();
  }, [showSuggestions, commodity, url]);

  // favorites logic. πρώτα φέρνω ενα arr με τα id τους και έλεγχω αν το commodity._id είναι ήδη μεσα σε αυτα. Μετα δύο useEffect για να προσθέσω αφαιρέσω
  useEffect(() => {
    const fetchFavoritesStatus = async () => {
      const userId = user?.id || user?._id;
      if (!userId || !commodity?._id) return;

      const token = localStorage.getItem("token");
      try {
        const res = await axios.get(`${url}/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const favs: string[] = res.data.data.favorites || [];
        setIsFavorite(favs.includes(commodity._id.toString()));
      } catch (err) {
        console.error("Failed to check favorites", err);
      }
    };
    fetchFavoritesStatus();
  }, [user, commodity, url]);

  const handleAddToFavorites = async () => {
    const userId = user?.id || user?._id;
    if (!userId || !commodity?._id) return;

    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `${url}/api/users/${userId}/favorites`,
        { commodityId: commodity._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHasFavorites(true);
      setIsFavorite(true);
    } catch (err) {
      console.error("Failed to add favorite", err);
    }
  };

  const handleRemoveFromFavorites = async () => {
    const userId = user?.id || user?._id;
    if (!userId || !commodity?._id) return;
    
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${url}/api/users/${userId}/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { commodityId: commodity._id }, // DELETE needs data in axios
      });
      setIsFavorite(false);
        // ✅ re-check favorites count
      const res = await axios.get(`${url}/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const favs = res.data.data.favorites || [];
      setHasFavorites(favs.length > 0);
    } catch (err) {
      console.error("Failed to remove favorite", err);
    }
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

        {/* === Price === */}
        <Typography
          id="item-price"
          variant="h5"
          sx={{ fontWeight: "bold", color: "primary.main" }}
        >
          {new Intl.NumberFormat("el-GR", {
            style: "currency",
            currency: "EUR",
          }).format(commodity.price)}
        </Typography>

        {/* === Description === */}
        <Typography
          id="item-descrition"
          variant="body1"
          component="p"
          // paragraph → depricated
        >
          {commodity.description || "No description available."}
        </Typography>

        {/* === Categories === */}
        {(commodity.category as string[])?.length > 0 && (
          <Typography 
            id="item-categories"
            variant="body2"
          >
            Categories: {(commodity.category as string[]).join(", ")}
          </Typography>
        )}

        {/* === Stock === */}
        <Typography 
          id="item-stock"
          variant="body2"
        >
          {commodity.stock > 0
            ? `In stock (${commodity.stock} available)`
            : "Out of stock"}
        </Typography>

        {/* === Add to Cart === */}
        <Button
          id="item-add-to-cart-btn"
          variant="contained"
          sx={{
            mt: 2,
            width: 200,
              color: "#fff",
              fontWeight: "bold",
              "&:hover": {
                backgroundColor: "#FFd500",
                color: "#4a3f35",
              },
          }}
          disabled={commodity.stock === 0}
          onClick={() => addOneToCart(commodity._id)}
        >
          {commodity.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </Button>

        <Button
          id="item-favorites"
          variant="outlined"
          sx={{ 
            mt: 1,
            width: 200,
          }}
          disabled={!user}
          onClick={isFavorite ? handleRemoveFromFavorites : handleAddToFavorites}
          startIcon={isFavorite ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
        >
          {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
        </Button>

        <Button
          id="item-suggestions"
          variant="outlined"
          sx={{ mt: 2, width: 200 }}
          onClick={() => setShowSuggestions(prev => !prev)}
        >
          {showSuggestions ? "Hide Suggestions" : "Show Suggestions"}
        </Button>

        {showSuggestions && suggested.length > 0 && (
          <Paper sx={{ p: 2, mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Suggested for you
            </Typography>
            <Stack
              id="item-suggestion-stack"
              direction="row"
              spacing={2}
              sx={{ overflowX: "auto" }}
            >
              {suggested
                .filter(s => s._id !== commodity._id)
                .slice(0, 2) // only 2 suggestions
                .map(s => (
                  <Box
                    id={`item-suggestion-${s._id}`}
                    key={s._id}
                    sx={{
                      minWidth: 180,
                      p: 1,
                      border: "1px solid #ddd",
                      borderRadius: 2,
                      cursor: "pointer",
                      "&:hover": { boxShadow: 2 }
                    }}
                    onClick={() => (window.location.href = `/commodity/${s._id}`)}
                  >
                    <img
                      src={s.images?.[0] || "/placeholder.jpg"}
                      alt={s.name}
                      style={{
                        width: "100%",
                        height: 120,
                        objectFit: "cover",
                        borderRadius: 4
                      }}
                    />
                    <Typography variant="subtitle2" sx={{ mt: 1 }}>
                      {s.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: s.currency.toUpperCase()
                      }).format(s.price)}
                    </Typography>
                  </Box>
                ))}
            </Stack>
          </Paper>
        )}

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
                id="item-user-review-textfield"
                label="Write a review"
                fullWidth
                multiline
                minRows={2}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                <Rating
                  id="item-user-rating"
                  value={newRating}
                  onChange={(_, val) => setNewRating(val)}
                />
                <Button
                  id="item-user-submit-rating-btn"
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
                id={`item-comments-${c._id}`}
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

