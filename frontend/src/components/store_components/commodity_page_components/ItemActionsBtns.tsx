import { Box, Button } from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";

interface Props {
  stock: number;
  userExists: boolean;
  isFavorite: boolean;
  onAddToCart: () => void;
  onToggleFavorite: () => void;
  showSuggestions: boolean;
  onToggleSuggestions: () => void;
}

const ItemActionsBtns = ({
  stock,
  userExists,
  isFavorite,
  onAddToCart,
  onToggleFavorite,
  showSuggestions,
  onToggleSuggestions,
}: Props) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 2,
        mt: 2,
      }}
    >
      {/* === ADD TO CART === */}
      <Button
        id="item-add-to-cart-btn"
        variant="contained"
        sx={{
          width: "150px",
          height: "150px",
          borderRadius: 0,
          backgroundColor: "#008482",
          color: "#fff",
          fontWeight: "bold",
          textAlign: "center",
          "&:hover": {
            backgroundColor: "#00a5a3",
            color: "#fff",
          },
        }}
        disabled={stock === 0}
        onClick={onAddToCart}
      >
        {stock === 0 ? "Out of Stock" : "Add to Cart"}
      </Button>

      {/* === FAVORITES === */}
      <Button
        id="item-favorites"
        variant="contained"
        sx={{
          width: "150px",
          height: "150px",
          borderRadius: 0,
          backgroundColor: "#008482",
          color: "#fff",
          fontWeight: "bold",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          "&:hover": {
            backgroundColor: "#00a5a3",
            color: "#fff",
          },
        }}
        disabled={!userExists}
        onClick={onToggleFavorite}
      >
        {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
        {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
      </Button>

      {/* === SUGGESTIONS === */}
      <Button
        id="item-suggestions"
        variant="contained"
        sx={{
          width: "150px",
          height: "150px",
          borderRadius: 0,
          backgroundColor: "#008482",
          color: "#fff",
          fontWeight: "bold",
          "&:hover": {
            backgroundColor: "#00a5a3",
            color: "#fff",
          },
        }}
        onClick={onToggleSuggestions}
      >
        {showSuggestions ? "Hide Suggestions" : "Show Suggestions"}
      </Button>
    </Box>
  );
};

export default ItemActionsBtns;
