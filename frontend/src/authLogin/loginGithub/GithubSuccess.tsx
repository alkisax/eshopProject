import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { account } from "../appwriteConfig";
import axios from "axios";
import { UserAuthContext } from "../../context/UserAuthContext";

const GithubSuccess = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(UserAuthContext);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // 1. Get the Appwrite user after GitHub OAuth
        const sessionUser = await account.get();

        // 2. Sync with your backend
        const syncRes = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/appwrite/sync`,
          { email: sessionUser.email }
        );

        if (syncRes.data.status) {
          const { user: dbUser, token } = syncRes.data.data;
          localStorage.setItem("token", token);
          setUser(dbUser);
          navigate("/");
        } else {
          alert("Failed to sync user");
        }
      } catch (err) {
        console.error("GitHub login failed:", err);
      }
    };
    fetchUser();
  }, [navigate, setUser]);

  return <p>Completing GitHub login...</p>;
};

export default GithubSuccess;
