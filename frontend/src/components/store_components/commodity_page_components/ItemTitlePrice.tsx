// frontend\src\components\store_components\commodity_page_components\ItemTitlePrice.tsx

import { Typography, Box } from "@mui/material";
import type { CommodityType } from "../../../types/commerce.types";

/**
 * Standalone component for:
 * - Title (name of commodity)
 * - Price
 *
 * This will be used in the TOP RIGHT area of the page layout.
 */

interface Props {
  commodity: CommodityType;
}

const ItemTitlePrice = ({ commodity }: Props) => {
  return (
    <Box sx={{ mb: 2 }}>
      {/* === TITLE === */}
      <Typography
        id="item-title"
        variant="h5"
        sx={{
          fontWeight: "bold",
          // textTransform: "uppercase",
          mb: 1,
          lineHeight: 1.2,
        }}
      >
        {commodity.name}
      </Typography>

      {/* === PRICE === */}
      <Typography
        id="item-price"
        variant="body1"
        sx={{
          fontWeight: "bold",
          color: "#000000ff",
          fontSize: "1.25rem",
        }}
      >
        {new Intl.NumberFormat("el-GR", {
          style: "currency",
          currency: commodity.currency?.toUpperCase() || "EUR",
        }).format(commodity.price)}
      </Typography>
    </Box>
  );
};

export default ItemTitlePrice;