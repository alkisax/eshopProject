import { useContext } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { UserAuthContext } from "../../context/UserAuthContext";

const AdminPrivateRoute = () => {
  const { user } = useContext(UserAuthContext);

  // Only allow access if user exists and has 'ADMIN' role
  if (user && user.roles?.includes("ADMIN")) {
    return <Outlet />;
  } else {
    // Redirect non-admins to login or home
    return <Navigate to="/" />;
  }
};

export default AdminPrivateRoute;
