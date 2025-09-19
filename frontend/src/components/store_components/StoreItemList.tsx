import { useContext, useState } from "react";
// import { useEffect } from "react"; // GA
import { Link, useOutletContext } from "react-router-dom";
import {
  Button,
  Pagination,
  Typography,  
  Card,
  CardActions,
  CardActionArea,
  CardContent,
  CardMedia,
  // Grid
} from "@mui/material";
// import { Grid } from "@mui/material/";
import Grid from "@mui/material/Grid";
import { CartActionsContext } from "../../context/CartActionsContext";
import type { CommodityType } from "../../types/commerce.types";
import { UserAuthContext } from "../../context/UserAuthContext";
import Loading from "../Loading";

// all google analytics are commented out and will be added again in future
// GA
// import { useAnalytics } from "@keiko-app/react-google-analytics";

type ContextType = {
  commodities: CommodityType[]; // already paginated in StoreLayout
  pageCount: number;
  currentPage: number;
  setCurrentPage: (p: number) => void;
  fetchCart: () => Promise<void>;
};

const StoreItemList = () => {
  const { addOneToCart } = useContext(CartActionsContext)!;
  const { isLoading } = useContext(UserAuthContext);

  // επειδή αυτό δεν είναι ένα κανονικό παιδί του layout αλλα μπάινει στο outlet του layout, 
  // τα props έρχονται με την useOutletContext (δες και σχόλια στο layout)
  const { commodities, pageCount, currentPage, setCurrentPage, fetchCart } =
    useOutletContext<ContextType>();

  const [loadingItemId] = useState<string | null>(null); 
  // turning off add btn while prossecing to avoid axios spamming


  // // GA
  // const { tracker } = useAnalytics();
  // // GA
  // useEffect(() => {
  //   if (commodities.length > 0) {
  //     tracker.trackEvent("view_item_list", {
  //       item_list_id: "store_grid",
  //       items: commodities.map((c) => ({
  //         item_id: c._id,
  //         item_name: c.name,
  //         price: c.price,
  //         currency: c.currency,
  //       })),
  //     });
  //   }
  // }, [commodities, tracker]);

  // MUI pagination
  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setCurrentPage(page);
  };

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Commodity List
      </Typography>

      {isLoading ? (
        <Loading />
      ) : commodities.length === 0 ? (
        // UX improvement: empty state message
        <Typography variant="body1" sx={{ mt: 2 }}>
          No commodities found. Try changing search or filters.
        </Typography>
      ) : (
      <Grid container spacing={3}>
        {commodities.map((commodity) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={commodity._id.toString()}>
            <Card
              sx={{
                height: "40vh", // ~2–2.5 items per screen
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                borderRadius: 3,
                boxShadow: 3,
              }}
            >
              <CardActionArea 
                component={Link} 
                to={`/commodity/${commodity._id}`}
                // // GA
                // onClick={() =>
                //   tracker.trackEvent("view_item", {
                //     item_id: commodity._id,
                //     item_name: commodity.name,
                //   })
                // }
              >
                <CardMedia
                  component="img"
                  height="160"
                  image={
                    commodity.images && commodity.images.length > 0
                      ? commodity.images[0]
                      : "/placeholder.jpg"
                  }
                  alt={commodity.name}
                />
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {commodity.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {commodity.price} {commodity.currency}
                  </Typography>
                </CardContent>
              </CardActionArea>

              <CardActions sx={{ justifyContent: "flex-end", p: 2 }}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={async (e) => {
                    e.preventDefault(); // prevent navigation when clicking Add
                    await addOneToCart(commodity._id);
                    await fetchCart();
                  }}
                  disabled={loadingItemId === commodity._id}
                >
                  + Add One
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      )}


      {!isLoading && pageCount > 1 && (
        <Pagination
          count={pageCount}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
          shape="rounded"
          sx={{ mt: 2, display: "flex", justifyContent: "center" }}
        />
      )}
    </>
  );
};

export default StoreItemList;
