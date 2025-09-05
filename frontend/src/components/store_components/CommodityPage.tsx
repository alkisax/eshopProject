// src/pages/CommodityPage.tsx
import { useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import {
  Typography,
  CircularProgress,
  Box,
  Button,
  Stack,
  Paper,
} from "@mui/material";
import type { CommodityType } from "../../types/commerce.types";
import { VariablesContext } from "../../context/VariablesContext";
import { CartActionsContext } from "../../context/CartActionsContext";

const CommodityPage = () => {
  const { url } = useContext(VariablesContext);
  const { addOneToCart } = useContext(CartActionsContext)!;

  const [commodity, setCommodity] = useState<CommodityType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const fetchCommodity = async () => {
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
    };
    if (id) fetchCommodity();
  }, [id, url]);

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
            {selectedImage ? (
              <img
                src={selectedImage}
                alt={commodity.name}
                style={{
                  width: "100%",
                  maxHeight: 400,
                  borderRadius: 8,
                  objectFit: "contain", // full image without distortion
                  backgroundColor: "#fafafa",
                }}
              />
            ) : (
              <Box
                sx={{
                  width: "100%",
                  height: 300,
                  bgcolor: "#eee",
                  borderRadius: 8,
                }}
              />
            )}
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
          {(commodity.comments?.length ?? 0) > 0 ? (
            commodity.comments!.map((c, idx) => (
              <Box
                key={idx}
                sx={{
                  mt: 2,
                  p: 2,
                  border: "1px solid #ddd",
                  borderRadius: 2,
                }}
              >
                <Typography variant="body2">
                  <strong>User:</strong> {c.user}
                </Typography>
                {/* ΕΔΩ ΟΙ ΑΛΛΑΓΕΣ ΓΙΑ EDITOR JS */}
                <Typography variant="body2">
                  {typeof c.text === "string" ? c.text : JSON.stringify(c.text)}
                </Typography>
                {c.rating !== undefined && (
                  <Typography variant="body2">⭐ {c.rating}/5</Typography>
                )}
              </Box>
            ))
          ) : (
            <Typography variant="body2">No reviews yet.</Typography>
          )}
        </Paper>
      </Stack>
    </Box>
  );
};

export default CommodityPage;
