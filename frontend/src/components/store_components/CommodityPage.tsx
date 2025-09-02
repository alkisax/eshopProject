import { useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Typography, CircularProgress, Box, Button } from "@mui/material";
import type { CommodityType } from "../../types/commerce.types";
import { VariablesContext } from "../../context/VariablesContext";

const CommodityPage = () => {
  const { url } = useContext(VariablesContext);
  const [commodity, setCommodity] = useState<CommodityType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const fetchCommodity = async () => {
      try {
        const res = await axios.get(
          `${url}/api/commodity/${id}`
        );
        setCommodity(res.data.data); 
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
      <Typography variant="h4" gutterBottom>
        {commodity.name}
      </Typography>
      <Typography variant="body1" paragraph>
        {commodity.description || "No description available."}
      </Typography>
      <Typography variant="h6">
        Price: {commodity.price} {commodity.currency}
      </Typography>
      <Button
        variant="contained"
        sx={{ mt: 2 }}
        onClick={() => console.log("Add to cart", commodity._id)}
      >
        Add to Cart
      </Button>
    </Box>
  );
};

export default CommodityPage;