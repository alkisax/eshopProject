import { useContext, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { Button, List, ListItem, ListItemButton, ListItemText, Pagination, Typography } from "@mui/material";
import { CartActionsContext } from '../../context/CartActionsContext'
import type { CommodityType } from "../../types/commerce.types";
import { UserAuthContext } from "../../context/UserAuthContext";
import Loading from "../Loading";

type ContextType = {
  commodities: CommodityType[];
  pageCount: number;
  currentPage: number;
  setCurrentPage: (p: number) => void;
};

const StoreItemList = () => {
  const { addOneToCart } = useContext(CartActionsContext)!
  const { isLoading } = useContext(UserAuthContext);

  const { commodities, pageCount, currentPage, setCurrentPage } = useOutletContext<ContextType>();

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
            <ListItem
              key={commodity._id.toString()}
              sx={{ textDecoration: "none", color: "inherit" }}
              disablePadding
              secondaryAction={
                <Button
                  variant="contained"
                  size="small"
                  onClick={(e) => {
                    e.preventDefault(); // prevent navigation when clicking Add
                    addOneToCart(commodity._id);
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
