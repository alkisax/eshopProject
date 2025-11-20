// frontend\src\components\store_components\commodity_page_components\ItemSuggestions.tsx

import { Box, Paper, Stack, Typography } from "@mui/material";
import type { CommodityType } from "../../../types/commerce.types";

interface Props {
  suggestions: CommodityType[];
  currentId: string;
}

const ItemSuggestions = ({ suggestions, currentId }: Props) => {
  if (!suggestions || suggestions.length === 0) return null;

  return (
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
        {suggestions
          .filter((s) => s._id !== currentId)
          .slice(0, 2)
          .map((s) => (
            <Box
              id={`item-suggestion-${s._id}`}
              key={s._id}
              sx={{
                minWidth: 180,
                p: 1,
                border: "1px solid #ddd",
                borderRadius: 2,
                cursor: "pointer",
                "&:hover": { boxShadow: 2 },
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
                  borderRadius: 4,
                }}
              />

              <Typography variant="subtitle2" sx={{ mt: 1 }}>
                {s.name}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {new Intl.NumberFormat("el-GR", {
                  style: "currency",
                  currency: s.currency.toUpperCase(),
                }).format(s.price)}
              </Typography>
            </Box>
          ))}
      </Stack>
    </Paper>
  );
};

export default ItemSuggestions;