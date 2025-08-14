import { useContext } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { UserAuthContext } from "../../../context/UserAuthContext";

const PrivateRoute = () => {
  const { user } = useContext(UserAuthContext);

  return user ? <Outlet /> : <Navigate to={"/appwrite-login"} />;
};

export default PrivateRoute;