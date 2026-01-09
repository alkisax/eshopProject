// frontend\src\components\store_components\commodity_page_components\ItemReviews.tsx
import {
  Box,
  Typography,
  Rating,
  Button,
  Pagination,
  TextField,
  Paper,
} from "@mui/material";
import type { IUser } from "../../../types/types";
import type { Types } from "mongoose";
import type { EditorJsData } from "../../../types/commerce.types";

interface Review {
  _id?: string;
  user: string | IUser | Types.ObjectId | undefined;
  text: string | EditorJsData;
  rating?: number;
  isApproved?: boolean;
}

interface Props {
  user: IUser | null;
  comments: Review[];
  newComment: string;
  newRating: number | null;
  setNewComment: (val: string) => void;
  setNewRating: (val: number | null) => void;
  handleAddComment: () => void;

  commentPage: number;
  setCommentPage: (page: number) => void;
  commentsPerPage: number;
}

const ReviewsSection = ({
  user,
  comments,
  newComment,
  newRating,
  setNewComment,
  setNewRating,
  handleAddComment,
  commentPage,
  setCommentPage,
  commentsPerPage,
}: Props) => {
  const totalComments = comments.length;

  const paginated = comments.slice(
    (commentPage - 1) * commentsPerPage,
    commentPage * commentsPerPage
  );

  const ratings = comments
    .map((c) => c.rating)
    .filter((r): r is number => typeof r === "number");

  const averageRating =
    ratings.length > 0
      ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
      : null;

  const getCommentUserLabel = (
    u: string | IUser | Types.ObjectId | undefined
  ): string => {
    if (!u) return "Anonymous";
    if (typeof u === "string") return u;
    if (typeof u === "object" && "username" in u && u.username)
      return u.username;
    return "Anonymous";
  };

  const hasUserAlreadyCommented = Boolean(
    user &&
      comments.some((c) => {
        if (!c.user) return false;
        if (typeof c.user === "string") return c.user === user.username;
        if (typeof c.user === "object" && "username" in c.user)
          return c.user.username === user.username;
        return false;
      })
  );

  return (
    <Paper sx={{ p: 2, mt: 4 }}>
      <Typography variant="h6">Customer Reviews</Typography>

      {averageRating && (
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Rating value={Number(averageRating)} precision={0.5} readOnly />
          <Typography sx={{ ml: 1 }}>({averageRating} / 5)</Typography>
        </Box>
      )}

      {/* === WRITE A REVIEW === */}
      {user && !hasUserAlreadyCommented && (
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

      {/* === COMMENTS LIST === */}
      {paginated.length > 0 ? (
        paginated.map((c, idx) => (
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
            {typeof c.rating === "number" && (
              <Typography variant="body2">⭐ {c.rating}/5</Typography>
            )}
          </Box>
        ))
      ) : (
        <Typography variant="body2">No reviews yet.</Typography>
      )}

      {/* === PAGINATION === */}
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
  );
};

export default ReviewsSection;
