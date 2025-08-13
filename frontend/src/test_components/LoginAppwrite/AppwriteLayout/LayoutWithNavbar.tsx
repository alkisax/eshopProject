import { Outlet } from "react-router-dom";
import GithubNavbarTest from "../ComponentsAppwriteLogin/NavbarAppwrite";

const LayoutWithNavbar = () => {
  return (
    <>
      <GithubNavbarTest />
      <Outlet /> {/* This renders the nested route */}
    </>
  );
};

export default LayoutWithNavbar