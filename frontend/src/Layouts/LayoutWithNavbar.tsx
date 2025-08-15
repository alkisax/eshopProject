import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

const LayoutWithNavbar = () => {
  return (
    <>
      <Navbar />
      <Outlet /> {/* This renders the nested route */}
    </>
  );
};

export default LayoutWithNavbar