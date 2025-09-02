import React, { useContext, useEffect, useState } from "react";
import {
  Drawer,
  Toolbar,
  Divider,
  TextField,
  List,
  ListItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useTheme } from "@mui/material/styles";
import { VariablesContext } from "../../context/VariablesContext";
import axios from "axios";

interface StoreSidebarProps {
  onSearch: (query: string) => void;
  onToggleCategory: (category: string, checked: boolean) => void;
}

const StoreSidebar: React.FC<StoreSidebarProps> = ({ onSearch, onToggleCategory }) => {

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // 👈 true on small screens
  const [mobileOpen, setMobileOpen] = useState(false);

  const [categories, setCategories] = useState<string[]>([]);

  const { url } = useContext(VariablesContext);

    // ✅ Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get<{ status: boolean; data: string[] }>(
          `${url}/api/commodity/categories`
        );
        if (res.data.status) {
          setCategories(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch categories", err);
        setCategories([]); // fallback to empty
      }
    };

    fetchCategories();
  }, [url]);

  const drawerContent = (
    <>
      <Toolbar />
      <Divider />

      {/* 🔍 Search box */}
      <TextField
        label="Search products"
        variant="outlined"
        size="small"
        fullWidth
        onChange={(e) => onSearch(e.target.value)}
        sx={{ mb: 2, mt: 8 }}   // 👈 extra margin top here
      />

      {/* 📦 Categories */}
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Categories
      </Typography>
      <List dense disablePadding>
        <FormGroup>
          {categories.map((cat) => (
            <ListItem key={cat} disablePadding>
              <FormControlLabel
                control={
                  <Checkbox onChange={(e) => onToggleCategory(cat, e.target.checked)} />
                }
                label={cat}
              />
            </ListItem>
          ))}
        </FormGroup>
      </List>
    </>
  );

  return (
    <>
      {/* Hamburger button visible only on mobile */}
      {isMobile && (
        <IconButton
          onClick={() => setMobileOpen(!mobileOpen)}
          sx={{
            position: "fixed",
            top: 72, // 👈 fixed distance below AppBar
            left: 8,
            zIndex: (theme) => theme.zIndex.drawer + 1,
            backgroundColor: "white",
            border: "1px solid #ddd",
            "&:hover": { backgroundColor: "#f0f0f0" },
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      {/* Drawer */}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : true}
        onClose={() => setMobileOpen(false)}
        sx={{
          width: 240,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 240,
            boxSizing: "border-box",
            mt: isMobile ? 0 : "64px", // push below AppBar only on desktop
            borderRight: "1px solid #ddd",
            backgroundColor: "#f5f5f5",
            boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
            p: 2,
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default StoreSidebar;
