// frontend\src\components\store_components\StoreItemList.tsx
import { useContext } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { Button, Pagination, Typography, Card, CardActions, CardActionArea, CardContent, CardMedia, } from "@mui/material";
import Grid from "@mui/material/Grid";
import { CartActionsContext } from "../../context/CartActionsContext";
import type { CommodityType } from "../../types/commerce.types";
import { UserAuthContext } from "../../context/UserAuthContext";
// import Loading from "../Loading";

import { useEffect } from "react"; // GA
import { useAnalytics } from "@keiko-app/react-google-analytics"; // GA
import StoreItemListSkeleton from "../skeletons/StoreItemListSkeleton";
import { confirmRequiresProcessing } from "../../utils/confirmRequiresProcessing";

type ContextType = {
  commodities: CommodityType[]; // already paginated in StoreLayout
  pageCount: number;
  currentPage: number;
  setCurrentPage: (p: number) => void;
  fetchCart: () => Promise<void>;
  selectedCategories: string[];
};

const StoreItemList = () => {
  const { addOneToCart } = useContext(CartActionsContext)!;
  const { isLoading } = useContext(UserAuthContext);
  const { tracker } = useAnalytics() || {}; //GA

  // επειδή αυτό δεν είναι ένα κανονικό παιδί του layout αλλα μπάινει στο outlet του layout, 
  // τα props έρχονται με την useOutletContext (δες και σχόλια στο layout)
  const { commodities, pageCount, currentPage, setCurrentPage, fetchCart, selectedCategories } = useOutletContext<ContextType>();

  // const [loadingItemId] = useState<string | null>(null); 
  // turning off add btn while prossecing to avoid axios spamming

  // GA - gogle analitics track if item passes in a list view (δεν το έχει πατήσει απλός πέρασε απο μπροστά του)
  useEffect(() => {
    if (commodities.length > 0 && tracker?.trackEvent) {
      tracker.trackEvent("view_item_list", {
        item_list_id: "store_grid",
        items: commodities.map((c) => ({
          item_id: c._id,
          item_name: c.name,
          price: c.price,
          currency: c.currency,
        })),
      });
    }
  }, [commodities, tracker]);

  // MUI pagination
  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setCurrentPage(page);
  };

  return (
    <>
      <Typography
        variant="h4"
        component="h1" // seo reads h1 renders h4
        gutterBottom
      >
        Χειροποίητα Κοσμήματα
      </Typography>

      {selectedCategories.length > 0 && (
        <Typography 
          variant="subtitle1"
          component="h2"
          color="text.secondary"
          sx={{ mb: 2 }}
        >
          {selectedCategories.join(", ")}
        </Typography>
      )}

      {isLoading ? (
        <StoreItemListSkeleton />
      ) : commodities.length === 0 ? (
        // UX improvement: empty state message
        <Typography variant="body1" sx={{ mt: 2 }}>
          No items found. Try changing search or filters.
        </Typography>
      ) : (
      <Grid
        id="commodity-list"
        container
        spacing={3}
      >
        {commodities.map((commodity) => (
          <Grid
            size={{ xs: 12, sm: 6, md: 4 }}
            key={commodity._id.toString()}
          >
            <Card
              sx={{
                height: "100%", // let the grid control height
                display: "flex",
                flexDirection: "column",
                borderRadius: 3,
                boxShadow: 3,
              }}
            >
              <CardActionArea
                component={Link}
                to={`/commodity/${commodity.slug ?? commodity._id}`}
                sx={{
                  flexGrow: 1,              // 👈 take all vertical space
                  display: "flex",
                  flexDirection: "column",  // stack image + content
                  alignItems: "stretch",    // stretch full width
                }}
              >
                <CardMedia
                  component="img"
                  height="160"
                  image={
                    commodity.images?.[0] || "/placeholder.jpg"
                  }
                  alt={commodity.name}
                  title={commodity.name}
                  loading="lazy"
                />
                <CardContent
                  sx={{
                    flexGrow: 1,           // 👈 stretch so all cards equalize
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    {commodity.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {commodity.price} {commodity.currency}
                  </Typography>
                </CardContent>
              </CardActionArea>

              {/* Always pinned bottom */}
              <CardActions
                sx={{
                  justifyContent: "center", // center button horizontally
                  p: 2,
                }}
              >
                <Button
                  id="add-one-list-item-btn"
                  variant="contained"
                  size="small"
                  onClick={async (e) => {
                    e.preventDefault();
                    if (!confirmRequiresProcessing(commodity)) return;
                    await addOneToCart(commodity._id);
                    await fetchCart();
                  }}
                  sx={{
                    backgroundColor: "#48C4Cf",
                    color: "#fff",
                    fontWeight: "bold",
                    "&:hover": {
                      backgroundColor: "#FFd500",
                      color: "#4a3f35",
                    },
                  }}
                >
                  + Add One to cart
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
