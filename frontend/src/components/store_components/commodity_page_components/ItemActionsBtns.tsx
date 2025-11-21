// frontend\src\components\store_components\commodity_page_components\ItemActionsBtns.tsx

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
  // showSuggestions,
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

      {/* ADD TO CART */}
      <Button
        id="item-add-to-cart-btn"
        variant="contained"
        sx={{
          width: '150px',
          height: '150px',
          borderRadius: 0,
          color: "#fff",
          fontWeight: "bold",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          "&:hover": {
            backgroundColor: "#FFd500",
            color: "#4a3f35",
          },
        }}
        disabled={stock === 0}
        onClick={onAddToCart}
      >
        Cart
      </Button>

      {/* FAVORITES */}
      <Button
        id="item-favorites"
        variant="outlined"
        sx={{
          width: '150px',
          height: '150px',
          borderRadius: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        disabled={!userExists}
        onClick={onToggleFavorite}
      >
        {isFavorite
          ? <FavoriteIcon color="error" />
          : <FavoriteBorderIcon />}
      </Button>

      {/* SUGGESTIONS */}
      <Button
        id="item-suggestions"
        variant="outlined"
        sx={{
          width: '150px',
          height: '150px',
          borderRadius: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        onClick={onToggleSuggestions}
      >
        Δείξε προτάσεις
      </Button>
    </Box>
  );
};

export default ItemActionsBtns;
