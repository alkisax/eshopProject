import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { UserAuthContext } from "../context/UserAuthContext";
import { VariablesContext } from "../context/VariablesContext";
import { Typography, Grid, Card, CardContent, CardMedia, CardActionArea, CardActions, Button } from "@mui/material";
import type { CommodityType } from "../types/commerce.types";
import { Link } from "react-router-dom";

const FavoritesPage = () => {
  const { user } = useContext(UserAuthContext);
  const { url, setHasFavorites } = useContext(VariablesContext);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favoriteCommodities, setFavoriteCommodities] = useState<CommodityType[]>([]);

  // κανονικά εδώ θα έπρεπε να γυρίσω και να κάνω Populate το backend μου. αλλα δεν θέλω και για αυτό με ένα get θα φέρω πρώτα τα id των favorites και μετα με αυτα θα κάνω ένα δεύτερο loop με get για να φέρω client side τα favorites μου. αλλωστε δεν θα είναι και πάρα πολλά.
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user?._id) return;
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get(`${url}/api/users/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFavoriteIds(res.data.data.favorites || []);
        setHasFavorites(favs.length > 0);
      } catch (err) {
        console.error("Failed to fetch favorites", err);
      }
    };
    fetchFavorites();
  }, [user, url, setHasFavorites]);

  useEffect(() => {
    if (favoriteIds.length === 0) {
      setFavoriteCommodities([]);
      return;
    }
    const fetchCommodities = async () => {
      try {
        const promises = favoriteIds.map((id) =>
          axios.get<{ status: boolean; data: CommodityType }>(
            `${url}/api/commodity/${id}`
          )
        );
        const results = await Promise.all(promises);
        const commodities = results.map((r) => r.data.data);
        setFavoriteCommodities(commodities);
      } catch (err) {
        console.error("Failed to fetch commodity details", err);
        setFavoriteCommodities([]);
      }
    };
    fetchCommodities();
  }, [favoriteIds, url]);

  const handleRemoveFavorite = async (commodityId: string) => {
    if (!user?._id) return;
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${url}/api/users/${user._id}/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { commodityId },
      });

      setFavoriteIds((prev) => {
        const updated = prev.filter((id) => id !== commodityId);
        setHasFavorites(updated.length > 0); // ✅ update global navbar heart
        return updated;
      });
    } catch (err) {
      console.error("Failed to remove favorite", err);
    }
  };


  if (!user) return <Typography>Please log in to see favorites.</Typography>;

  return (
    <div>
      <Typography variant="h4" gutterBottom>My Favorites</Typography>
      <Grid
        id="favorites-list"
        container
        spacing={3}
      >
        {favoriteCommodities.map((c) => (
          <Grid
            size={{ xs: 12, sm: 6, md: 4 }}
            key={c._id.toString()}
          >
              <Card>
                <CardActionArea component={Link} to={`/commodity/${c._id}`}>
                  <CardMedia
                    component="img"
                    height="160"
                    image={c.images?.[0] || "/placeholder.jpg"}
                    alt={c.name}
                  />
                  <CardContent>
                    <Typography variant="h6">{c.name}</Typography>
                    <Typography variant="body2">{c.price} {c.currency}</Typography>
                  </CardContent>
                </CardActionArea>

                <CardActions sx={{ justifyContent: "flex-end" }}>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleRemoveFavorite(c._id.toString())}
                  >
                    Remove ❤️
                  </Button>
                </CardActions>
              </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default FavoritesPage;
