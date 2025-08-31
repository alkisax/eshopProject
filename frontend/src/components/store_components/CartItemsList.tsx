
import { Pagination } from "@mui/material";
import axios from "axios";
import { UserAuthContext } from "../../context/UserAuthContext";
import Loading from "../Loading";
import { useEffect } from "react";


const CartItemsList = () => {
  const [currentPage, setCurrentPage] = useState(1); // ✅ start from 1
  const [pageCount, setPageCount] = useState(0);
  const ITEMS_PER_PAGE = 3; // try smaller to test pagination

  useEffect(() => {
    const fetchAllCartItems= async () => {
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
  return (
    <>
      CartItemsList
    </>
  )
}
export default CartItemsList