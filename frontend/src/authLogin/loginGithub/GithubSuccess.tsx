import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
// import { account } from "../appwriteConfig";
// import axios from "axios";
import { UserAuthContext } from "../../context/UserAuthContext";
// import type { IUser } from "../../types/types";

const GithubSuccess = () => {
  const navigate = useNavigate();
  // const { setUser, refreshUser } = useContext(UserAuthContext);
  const { refreshUser } = useContext(UserAuthContext);

  useEffect(() => {
    if (window.location.hash === "#") {
      console.log('reachded finished login');
      refreshUser?.(); // fetches Appwrite session and backend sync
      navigate("/");        // redirect after login       
    };
  }, [refreshUser, navigate]);

  // useEffect(() => {
  //   const fetchUser = async () => {
  //     try {
  //       // 1. Get the Appwrite user after GitHub OAuth
  //       const sessionUser = await account.get();

  //       // 2. Sync with your backend
  //       const syncRes = await axios.post(
  //         `${import.meta.env.VITE_BACKEND_URL}/api/auth/appwrite/sync`,
  //         { email: sessionUser.email }
  //       );

  //       if (syncRes.data.status) {
  //         const { user: dbUser, token } = syncRes.data.data;
  //         localStorage.setItem("token", token);
  //         console.log('token from github success', token);
          
  //         const newUser: IUser = {
  //           _id: dbUser._id,
  //           username: dbUser.username,
  //           name: dbUser.name,
  //           email: dbUser.email,
  //           roles: dbUser.roles,
  //           hasPassword: dbUser.hashedPassword ? true : false,
  //           provider: "github",
  //         }

  //         setUser(newUser);
  //         console.log('New user: ', newUser);
          
  //         navigate("/");
  //       } else {
  //         alert("Failed to sync user");
  //       }
  //     } catch (err) {
  //       console.error("GitHub login failed:", err);
  //     }
  //   };
  //   fetchUser();
  // }, [navigate, setUser]);

  return <p>Github login succesfull.</p>;
};

export default GithubSuccess;
