import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
// import { jwtDecode } from "jwt-decode"; 

const GoogleSuccess = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const email = searchParams.get("email");
    if (token) {
      localStorage.setItem("token", token);
      // Maybe set some user context state here
      console.log("Logged in user:", email);

      // try {
      //   // Decode payload (the backend puts id, username, email, roles in there)
      //   const decoded: unknown = jwtDecode(token);
      //   console.log("Decoded JWT payload:", decoded);
      // } catch (err) {
      //   console.error("Failed to decode JWT:", err);
      // }
    } else {
      console.warn("No token found in query params");
    }

  }, [searchParams]);

  return(
    <>
      <p>Login successful! You may close this window.</p>  
    </>
  ) 
};

export default GoogleSuccess;