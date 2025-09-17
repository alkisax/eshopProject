import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Box } from "@mui/material";

const LayoutWithNavbar = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh", // παίρνει όλο το ύψος viewport
      }}
    >
      {/* Navbar πάντα στην κορυφή */}
      <Navbar />

      {/* Content - μεγαλώνει όσο χρειάζεται */}
      <Box sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>

      {/* Footer στο τέλος */}
      <Footer />
    </Box>
  );
};

export default LayoutWithNavbar;