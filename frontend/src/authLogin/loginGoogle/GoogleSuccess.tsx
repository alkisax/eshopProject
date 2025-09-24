import { useEffect, useContext  } from "react";
import { useSearchParams  } from "react-router-dom";
import { UserAuthContext } from "../../context/UserAuthContext"; 
import { jwtDecode } from "jwt-decode";
import type { GoogleJwtPayload } from "../../types/types";

const GoogleSuccess = () => {
  const [searchParams] = useSearchParams();
  const { setUser } = useContext(UserAuthContext);
  // const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    // const email = searchParams.get("email");

    if (token) {
      localStorage.setItem("token", token);
    } else {
      console.warn("No token found in query params");
      return;
    }

    try {
      const decoded = jwtDecode<GoogleJwtPayload>(token);

      setUser({
        _id: decoded.id,
        username: decoded.username || decoded.email.split("@")[0],
        name: decoded.name,
        email: decoded.email,
        roles: decoded.roles,
        hasPassword: false,
        provider: "google",
      });
    } catch (err) {
      console.error("Failed to decode Google token", err);
    }

    // refreshUser().finally(() => {
    //   navigate("/");
    // });
    window.location.href = "/"; // TODO hard reload

  }, [searchParams, setUser]); 

  return(
    <>
      <p>Login successful! Redirecting...</p>  
    </>
  ) 
};

export default GoogleSuccess;