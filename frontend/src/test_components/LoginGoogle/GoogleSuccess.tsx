import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const GoogleSuccess = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const email = searchParams.get("email");
    if (token) {
      localStorage.setItem("token", token);
      // Maybe set some user context state here
      console.log("Logged in user:", email);
    }
  }, [searchParams]);

  return <p>Login successful! You may close this window.</p>;
};

export default GoogleSuccess;