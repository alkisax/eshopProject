//frontend\src\components\store_components\commodity_page_components\ItemDescription.tsx

import { Typography } from "@mui/material";
import type { CommodityType } from "../../../types/commerce.types";

interface Props {
  commodity: CommodityType;
}

const ItemDescription = ({ commodity }: Props) => {
  return (
    <>
      {/* === Price ===
      <Typography
        id="item-price"
        variant="body1"
        component="p"
        sx={{
          fontWeight: "bold",
          color: "primary.main",
          fontSize: "1.25rem",
        }}
      >
        {new Intl.NumberFormat("el-GR", {
          style: "currency",
          currency: "EUR",
        }).format(commodity.price)}
      </Typography> */}

      {/* === Description === */}
      <Typography
        id="item-descrition"
        variant="body1"
        component="p"
        // paragraph → depricated
      >
        {commodity.description || "No description available."}
      </Typography>

      {commodity.details && commodity.details.trim().length > 0 && (
        <Typography id="item-details" variant="body1" component="p">
          <strong>Details:</strong> {commodity.details}
        </Typography>
      )}

      {commodity.tips && commodity.tips.trim().length > 0 && (
        <Typography id="item-tips" variant="body1" component="p">
          <strong>Tips:</strong> {commodity.tips}
        </Typography>
      )}

      {/* === Categories === */}
      {(commodity.category as string[])?.length > 0 && (
        <Typography id="item-categories" variant="body2">
          Categories: {(commodity.category as string[]).join(", ")}
        </Typography>
      )}

      {/* === Stock === */}
      {/* <Typography id="item-stock" variant="body2">
        {commodity.stock > 0
          ? `In stock (${commodity.stock} available)`
          : "Out of stock"}
      </Typography> */}
    </>
  );
};

export default ItemDescription;
