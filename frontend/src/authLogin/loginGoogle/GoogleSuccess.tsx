import { useEffect } from "react";
import { useSearchParams  } from "react-router-dom";
import axios from 'axios'
// import { useEffect, useContext } from "react";
// import { UserAuthContext } from "../../context/UserAuthContext"; 
// import { jwtDecode } from "jwt-decode";
// import type { GoogleJwtPayload } from "../../types/types";

const GoogleSuccess = () => {
  const [searchParams] = useSearchParams();
  // o user θα γίνετε set μέσο fetchUser() → δεν γίνετε εδω αλλα στα UserAuthContext.tsx και useInitializer.ts 
  // const { setUser } = useContext(UserAuthContext);

  useEffect(() => {
    const exchange = async () => {
      const code = searchParams.get("code");

      if (!code) {
        console.warn("No exchange code found");
        return;
      }

      try {
        const res = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/exchange-code`,
          { code }
        );

        const token = res.data.data.token;
        localStorage.setItem("token", token);

        // αφήνουμε το UserAuthContext να κάνει fetchUser()
        window.location.href = "/";
      } catch (err) {
        console.error("Exchange code failed", err);
      }
    };

    exchange();
  }, [searchParams]);

  return(
    <>
      <p>Login successful! Redirecting...</p>  
    </>
  ) 
};

export default GoogleSuccess;

/* 
έτσι ήταν πριν κάνουμε την αλλαγή code for token
*/
  // useEffect(() => {
  //       const token = searchParams.get("token");

  //   if (token) {
  //     localStorage.setItem("token", token);
  //   } else {
  //     console.warn("No token found in query params");
  //     return;
  //   }

  //   try {
  //     const decoded = jwtDecode<GoogleJwtPayload>(token);

  //     // o user θα γίνετε set μέσο fetchUser()
  //     const { setUser } = useContext(UserAuthContext);
  //     setUser({
  //       _id: decoded.id,
  //       username: decoded.username || decoded.email.split("@")[0],
  //       name: decoded.name,
  //       email: decoded.email,
  //       roles: decoded.roles,
  //       hasPassword: false,
  //       provider: "google",
  //     });
  //   } catch (err) {
  //     console.error("Failed to decode Google token", err);
  //   }

  //   // refreshUser().finally(() => {
  //   //   navigate("/");
  //   // });
  //   window.location.href = "/"; // TODO hard reload

  // }, [searchParams, setUser]); 