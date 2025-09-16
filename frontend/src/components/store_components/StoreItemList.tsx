import { useContext, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Pagination,
  Typography,
  ListItemAvatar,
  Avatar,
} from "@mui/material";
import { CartActionsContext } from '../../context/CartActionsContext'
import type { CommodityType } from "../../types/commerce.types";
import { UserAuthContext } from "../../context/UserAuthContext";
import Loading from "../Loading";

type ContextType = {
  commodities: CommodityType[];
  pageCount: number;
  currentPage: number;
  setCurrentPage: (p: number) => void;
  fetchCart: () => Promise<void>;
};

const StoreItemList = () => {
  const { addOneToCart } = useContext(CartActionsContext)!
  const { isLoading } = useContext(UserAuthContext);

  // επειδή αυτό δεν είναι ένα κανονικό παιδί του layout αλλα μπάινει στο outlet του, τα props έρχονται με την useOutletCOntext (δες και σχόλια στο layout)
  const { commodities, pageCount, currentPage, setCurrentPage, fetchCart } = useOutletContext<ContextType>();

  const [loadingItemId] = useState<string | null>(null); //turning off add btn while prossecing to avoid axios spamming

  // MUI pagination
  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Commodity List
      </Typography>

      {isLoading ? (
        <Loading />
      ) : (
        <List>
          {commodities.map((commodity) => (
            // Η ιδιότητα secondaryAction είναι prop του MUI ListItem. Σου επιτρέπει να ορίσεις ένα δεύτερο στοιχείο/κουμπί/εικονίδιο που θα εμφανιστεί στα δεξιά του item. Είναι ο τυπικός τρόπος σε MUI lists να βάζεις actions (π.χ. delete, add to cart) χωρίς να χαλάει το layout.
            <ListItem
              key={commodity._id.toString()}
              sx={{ textDecoration: "none", color: "inherit" }}
              disablePadding
              secondaryAction={
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
              }
            >
              <ListItemButton
                component={Link}
                to={`/commodity/${commodity._id}`}
              >
                {/* 👇 small preview thumbnail if available */}
                <ListItemAvatar>
                  <Avatar
                    variant="square"
                    src={commodity.images && commodity.images.length > 0 ? commodity.images[0] : "/placeholder.jpg"}
                    sx={{ width: 56, height: 56, mr: 2 }}
                  />
                </ListItemAvatar>

                <ListItemText
                  primary={commodity.name}
                  secondary={`${commodity.price} ${commodity.currency}`}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
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
