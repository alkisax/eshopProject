import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button, List, ListItem, ListItemButton, ListItemText, Pagination, Typography } from "@mui/material";
import axios from "axios";

import { VariablesContext } from "../../context/VariablesContext";
import { CartActionsContext } from '../../context/CartActionsContext'
import type { CommodityType } from "../../types/commerce.types";
import { UserAuthContext } from "../../context/UserAuthContext";
import Loading from "../Loading";

const Store = () => {
  const { url } = useContext(VariablesContext);
  const { globalParticipant } = useContext(VariablesContext);
  const { addOneToCart } = useContext(CartActionsContext)!

  const { isLoading, setIsLoading } = useContext(UserAuthContext);

  const [currentPage, setCurrentPage] = useState(1); // ✅ start from 1
  const [pageCount, setPageCount] = useState(0);
  const [loadingItemId] = useState<string | null>(null); //turning off add btn while prossecing to avoid axios spamming


  const [commodities, setCommodities] = useState<CommodityType[]>([]);

  const ITEMS_PER_PAGE = 15; // try smaller to test pagination

  useEffect(() => {
    const fetchAllCommodities = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(`${url}/api/commodity/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(res);

        const allCommodities: CommodityType[] = res.data.data;

        // ✅ total pages
        setPageCount(Math.ceil(allCommodities.length / ITEMS_PER_PAGE));

        // ✅ slice only the page items
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        setCommodities(allCommodities.slice(start, end));
      } catch {
        console.log("error fetching commodities");
      } finally {
        setIsLoading(false);
      }
    };

    // main reson for this to use unsed vars. but its ok
    console.log('global participant', globalParticipant);
    
    fetchAllCommodities();
  }, [currentPage, globalParticipant, setIsLoading, url]);
  

  // MUI pagination
  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page); // ✅ page is already 1-based
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
export default Store;
