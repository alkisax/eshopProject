// frontend\src\components\store_components\commodity_page_components\ItemActionsBtns.tsx

import { Button } from "@mui/material";
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
    <>
      {/* ADD TO CART */}
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
        disabled={stock === 0}
        onClick={onAddToCart}
      >
        {stock === 0 ? "Out of Stock" : "Add to Cart"}
      </Button>

      {/* FAVORITES */}
      <Button
        id="item-favorites"
        variant="outlined"
        sx={{
          mt: 1,
          width: 200,
        }}
        disabled={!userExists}
        onClick={onToggleFavorite}
        startIcon={
          isFavorite ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />
        }
      >
        {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
      </Button>

      {/* SUGGESTIONS TOGGLE */}
      <Button
        id="item-suggestions"
        variant="outlined"
        sx={{ mt: 2, width: 200 }}
        onClick={onToggleSuggestions}
      >
        {showSuggestions ? "Hide Suggestions" : "Show Suggestions"}
      </Button>
    </>
  );
};

export default ItemActionsBtns;
