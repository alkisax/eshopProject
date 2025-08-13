import { useContext } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { UserAuthContext } from "../UserAuthContext";

const PrivateRoute = () => {
  const { user } = useContext(UserAuthContext);

  return user ? <Outlet /> : <Navigate to={"/github-login"} />;
};

export default PrivateRoute;