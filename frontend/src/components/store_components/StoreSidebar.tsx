import { useEffect, useState } from "react";
import {
  Drawer,
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

const StoreSidebar = ({
  search,
  allCategories,
  selectedCategories,
  onSearch,
  onToggleCategory,
  onApplyFilters,
  onClearFilters,
}: StoreSidebarProps) => {

  // Είναι React hook από το Material-UI (@mui/material/styles). Σου δίνει πρόσβαση στο theme Το theme είναι κάτι σαν "παγκόσμιο config" για styling. Το ορίζει το ThemeProvider που συνήθως βάζεις γύρω από όλη την app σου. και επειδή εδώ δεν έχουμε είναι default
  const theme = useTheme();
  // ένα boolean που έρχετε απο το MUI
  // Εδώ: true αν το πλάτος της οθόνης <= "sm".
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(search);

  // debounce 1/2
  // αντι να ψάχνει κάθε φορα που γράφφετε ένα γράμμα έχει ένα μικρό delay
  useEffect(() => {
    const timeout = setTimeout(() => {
      onSearch(localSearch);
    }, 50); 
    return () => clearTimeout(timeout);
  }, [localSearch, onSearch]);

  const drawerContent = (
    <>

      <Divider />

      {/* Search box */}
      <TextField
        label="Search products"
        variant="outlined"
        size="small"
        fullWidth
        value={search}
        // debounce 2/2
        // onChange={(e) => onSearch(e.target.value)}
        onChange={(e) => setLocalSearch(e.target.value)}
        sx={{ mb: 2, mt: 8 }}
      />

      {/* Categories */}
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
            // 👇 full height relative to viewport
            height: isMobile ? "100vh" : "calc(100vh - 64px)",
            top: isMobile ? 0 : 64, // start below AppBar on desktop
            bottom: 0,
            borderRight: "1px solid #ddd",
            backgroundColor: "#f5f5f5",
            boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        {/* scrollable content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
          {drawerContent}
        </div>

        {/* pinned bottom buttons */}
        <div
          style={{
            padding: "16px",
            borderTop: "1px solid #ddd",
            backgroundColor: "#fff",
            flexShrink: 0,
          }}
        >
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mb: 1 }}
            onClick={onApplyFilters}
          >
            Apply Filters
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            fullWidth
            onClick={onClearFilters}
          >
            Clear Filters
          </Button>
        </div>
      </Drawer>
    </>
  );
};

export default StoreSidebar;
