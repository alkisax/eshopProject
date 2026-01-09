// frontend\src\Layouts\LayoutWithNavbarAndFooter.tsx
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
// import Footer from "../components/Footer";
import FooterDesigner from "./deisgnComponents/FooterDesigner";
import { Box } from "@mui/material";

const LayoutWithNavbarAndFooter = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <Navbar />
      <Box sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>
      {/* <Footer /> */}
      <FooterDesigner />
    </Box>
  );
};

export default LayoutWithNavbarAndFooter;
