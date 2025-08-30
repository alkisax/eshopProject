import { useContext, useEffect, useState } from "react";
import { Pagination } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import axios from "axios";

import { VariablesContext } from "../../context/VariablesContext";
import type { CommodityType, ParticipantType } from "../../types/commerce.types";
import { UserAuthContext } from "../../context/UserAuthContext";
import Loading from "../Loading";

const Store = () => {
  const { url } = useContext(VariablesContext);
  const { user, isLoading, setIsLoading } = useContext(UserAuthContext);

  const [currentPage, setCurrentPage] = useState(1); // ✅ start from 1
  const [pageCount, setPageCount] = useState(0);


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
  
  const addToCart = async () => {
    console.log('enter addToCart')

    // 1. get user from context
    console.log('setp 1. See if user has participant. user from context: ', user);
    const email = user?.email
    if (!email) {
      console.error('email is required')
    }

    // 2. see if user is assosiated with a participant
    let participant: ParticipantType | null = null // If the try block throws, then participant is never assigned before the if (participant) check.Initialize it to null right away

    try {
      const response = await axios.get<{ status: boolean; data: ParticipantType }>(`${url}/api/participant/by-email?email=${email}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      participant = response.data.data
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        console.log("No participant found, will create a new one...");
      } else {
        throw err;
      }
    }

    if (participant) {
      console.log(`User already has participant id: ${participant._id}`);
    } else {
      // 3. if user without participant, create participant and add it to user
      console.log('step 3. User has not participant association');
      
      const newParticipantData = {
        name: user?.name,
        surname: user?.surname,
        email: user?.email,
        user: user?._id,
        transactions: []
      }
      const response = await axios.post<{ status: boolean; data: ParticipantType }>(`${url}/api/participant/`, newParticipantData)

      const newParticipant = response.data.data
      participant = newParticipant;

      console.log(`step 3. User is associeted with a new participant. id: ${participant._id}`);        
    }



    // 4. if no user create a participant 
    // 5. check if participant has a cart if no create one
    // 6. add commodity to cart
  }

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
              <IconButton  
                color="primary" 
                size="small" 
                sx={{ ml: 2 }}
                onClick={() => addToCart()}
              >
                <ShoppingCartIcon />
              </IconButton >
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
