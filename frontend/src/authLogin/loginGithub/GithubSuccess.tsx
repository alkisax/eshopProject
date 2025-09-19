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
  return <p>Github login succesfull.</p>;
};

export default GithubSuccess;
