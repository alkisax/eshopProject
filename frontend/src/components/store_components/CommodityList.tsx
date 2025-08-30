import { useContext, useEffect, useState } from "react";
import { Pagination } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

import { VariablesContext } from "../../context/VariablesContext";
import type { CommodityType, ParticipantType } from "../../types/commerce.types";
import { UserAuthContext } from "../../context/UserAuthContext";
import Loading from "../Loading";

const Store = () => {
  const { url } = useContext(VariablesContext);
  const { user, isLoading, setIsLoading } = useContext(UserAuthContext);
  const [participant, setParticipant] = useState<ParticipantType | null>(null)

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

    if (user) {
      // 1. get user from context
      console.log('setp 1. See if user has participant. user from context: ', user);
      const email = user?.email
      if (!email) {
        console.error('email is required')
      }

      // 2. see if user is assosiated with a participant
      try {
        const response = await axios.get<{ status: boolean; data: ParticipantType }>(`${url}/api/participant/by-email?email=${email}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setParticipant(response.data.data)
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
        if (!response) {
          console.error('error creating participant');          
        }

        const newParticipant = response.data.data
        setParticipant(newParticipant);

        console.log(`step 3. User is associeted with a new participant. id: ${newParticipant._id}`);
      }
    } else {
      // 4. if no user create a participant
      console.log('step 4. no existing user. we will create a participant not associated with a user');

      // 4a. check if guest has lockalstorage
      const storedParticipantId = localStorage.getItem("guestParticipantId");
      if (storedParticipantId) {
        // 4b. if yes refetch his cart
        try {
          const response = await axios.get<{ status: boolean; data: ParticipantType }>(
            `${url}/api/participant/${storedParticipantId}`
          );
          setParticipant(response.data.data);
          console.log("Guest restored from localStorage:", response.data.data);
          return; // ✅ Stop here, don’t create a new one
        } catch (err: unknown) {
          console.warn("Stored guest not found in DB, creating a new one...", err);
          localStorage.removeItem("guestParticipantId");
        }
      } else {
        // 4c. if no create a sth to lockal storage.
        const uuidGuest = uuidv4()
        const guestEmail = `guest-${uuidGuest}@eshop.local`;

        const newParticipantData = {
          name: '',
          surname: '',
          email: guestEmail,
          user: '',
          transactions: []
        }

        const response = await axios.post<{ status: boolean; data: ParticipantType }>(`${url}/api/participant/`, newParticipantData)

        const newParticipant = response.data.data
        setParticipant(newParticipant);

        // 🔑 Store the participant id for later refresh
        // added "trust me" at _id with '!'
        localStorage.setItem("guestParticipantId", newParticipant._id!.toString());

        console.log(`step 4. Guest is associeted with a new participant. id: ${newParticipant._id} and email: ${newParticipant.email}`);           
      }
    }

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
