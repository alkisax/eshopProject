import React, { useState } from "react";
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
  Button,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useTheme } from "@mui/material/styles";

interface StoreSidebarProps {
  search: string;
  allCategories: string[];
  selectedCategories: string[];
  onSearch: (query: string) => void;
  onToggleCategory: (category: string, checked: boolean) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

const StoreSidebar: React.FC<StoreSidebarProps> = ({
  search,
  allCategories,
  selectedCategories,
  onSearch,
  onToggleCategory,
  onApplyFilters,
  onClearFilters,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [mobileOpen, setMobileOpen] = useState(false);

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
        value={search}                     // 👈 use the real state here
        onChange={(e) => onSearch(e.target.value)}
        sx={{ mb: 2, mt: 8 }}
      />

      {/* 📦 Categories */}
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Categories
      </Typography>
      <List dense disablePadding>
        <FormGroup>
          {allCategories.map((cat) => (
            <ListItem key={cat} disablePadding>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedCategories.includes(cat)}
                    onChange={(e) => onToggleCategory(cat, e.target.checked)}
                  />
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
            top: 72,
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
            mt: isMobile ? 0 : "64px",
            borderRight: "1px solid #ddd",
            backgroundColor: "#f5f5f5",
            boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
            p: 2,
          },
        }}
      >
        {drawerContent}
        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          onClick={onApplyFilters}
        >
          Apply Filters
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          fullWidth
          sx={{ mt: 1 }}
          onClick={onClearFilters}
        >
          Clear Filters
        </Button>
      </Drawer>
    </>
  );
};

export default StoreSidebar;
