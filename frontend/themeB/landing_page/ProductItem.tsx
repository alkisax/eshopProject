// frontend/themeB/ProductItem.tsx

import { Link as RouterLink } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";

import type { CommodityType } from "../../src/types/commerce.types";
import { formatCategoryName } from "./formatCategoryName";
import { useSettings } from "../../src/context/SettingsContext";

interface Props {
  commodity: CommodityType;
}

// Product card – UI only
const ProductItem = ({ commodity }: Props) => {
  const { _id, slug, name, price, images, category, currency } = commodity;

  const { settings } = useSettings();

  // theme colors από settings (safe fallbacks)
  const primaryColor = settings?.theme?.primaryColor ?? "#000";
  const secondaryColor = settings?.theme?.secondaryColor ?? "#888";

  const productLink = slug ? `/commodity/${slug}` : `/commodity/${_id}`;

  const imageSrc = images?.[0];

  return (
    <Box
      sx={{
        width: { xs: 300, md: 400 },
        display: "flex",
        flexDirection: "column",
        minHeight: 520, // όλα τα cards ίδιο ύψος
      }}
    >
      {/* Image */}
      <Box
        component={RouterLink}
        to={productLink}
        sx={{
          width: "100%",
          height: { xs: 200, md: 300 },
          overflow: "hidden",
          display: "block",
        }}
      >
        <Box
          component="img"
          src={imageSrc}
          alt={name}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </Box>

      {/* CONTENT – flex column */}
      <Box
        sx={{
          mt: 1.5,
          px: 1,
          display: "flex",
          flexDirection: "column",
          flexGrow: 1, // 🔑 παίρνει όλο τον διαθέσιμο χώρο
        }}
      >
        {/* Title */}
        <Typography
          component={RouterLink}
          to={productLink}
          sx={{
            textAlign: "center",
            fontSize: { xs: "1.4rem", md: "1.8rem" },
            letterSpacing: "0.05em",
            color: primaryColor,
            textDecoration: "none",
          }}
        >
          {name}
        </Typography>

        {/* Category */}
        <Typography
          sx={{
            textAlign: "center",
            color: secondaryColor,
            fontSize: { xs: "0.9rem", md: "1rem" },
            letterSpacing: "0.04em",
            minHeight: 24, // κρατά θέση
          }}
        >
          {category ? formatCategoryName(category) : ""}
        </Typography>

        {/* Price – PUSH TO BOTTOM of content */}
        <Typography
          sx={{
            mt: "auto", // 🔥 ΚΛΕΙΔΙ
            textAlign: "center",
            fontWeight: 600,
            fontSize: { xs: "1.2rem", md: "1.4rem" },
            color: primaryColor,
          }}
        >
          {price} {currency}
        </Typography>
      </Box>

      {/* BUTTON – PUSH TO BOTTOM of card */}
      <Button
        component={RouterLink}
        to={productLink}
        variant="contained"
        sx={{
          mt: "auto", // 🔥 ΚΛΕΙΔΙ
          height: 48,
          backgroundColor: primaryColor,
          color: "#fff",
          "&:hover": {
            backgroundColor: primaryColor,
            opacity: 0.9,
          },
        }}
      >
        View product
      </Button>
    </Box>
  );
};

export default ProductItem;
