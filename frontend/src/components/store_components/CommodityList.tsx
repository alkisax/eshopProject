import { useContext, useEffect, useState } from "react";
import { Pagination } from "@mui/material";
import axios from "axios";

import { VariablesContext } from "../../context/VariablesContext";
import type { CommodityType } from "../../types/commerce.types";
import { UserAuthContext } from "../../context/UserAuthContext";
import Loading from "../Loading";

const Store = () => {
  const [currentPage, setCurrentPage] = useState(1); // ✅ start from 1
  const [pageCount, setPageCount] = useState(0);

  const { url } = useContext(VariablesContext);
  const { isLoading, setIsLoading } = useContext(UserAuthContext);
  const [commodities, setCommodities] = useState<CommodityType[]>([]);

  const ITEMS_PER_PAGE = 3; // try smaller to test pagination

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
    fetchAllCommodities();
  }, [currentPage, setIsLoading, url]);
  
  // const addToCart = () => {
  //   // export user from token
  //   // check if user is associated with a participant
  //   // check if participant exists if not create one
  //   // add participant to user
  //   // get participant id
  //   // chack if participant has cart if no create one
  //   // get commodity id
  //   // add commidity to cart
  // }

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page); // ✅ page is already 1-based
  };

  return (
    <>
      <h2>Commodity List</h2>
      {isLoading ? (
        <Loading />
      ) : (
        <ul>
          {commodities.map((c) => (
            <li key={c._id.toString()}>
              <strong>{c.name}</strong> — {c.price} {c.currency}
            </li>
          ))}
        </ul>
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
