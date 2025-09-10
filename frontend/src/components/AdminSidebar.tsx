import { useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import PeopleIcon from "@mui/icons-material/People";
import GroupIcon from "@mui/icons-material/Group";
import UploadIcon from "@mui/icons-material/Upload";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import CategoryIcon from "@mui/icons-material/Category";
import CommentIcon from '@mui/icons-material/Comment';
import { CloudUpload } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";

interface AdminSidebarProps {
  onSelect: (panel: string) => void;
}

const AdminSidebar = ({ onSelect }: AdminSidebarProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // ✅ true when on mobile width
  const [mobileOpen, setMobileOpen] = useState(false); // ✅ controls mobile drawer open/close

  const drawerContent = (
    <>
      <Toolbar />
      <Divider />

      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={() => onSelect("users")}>
            <ListItemIcon>
              <PeopleIcon />
            </ListItemIcon>
            <ListItemText primary="Users" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton onClick={() => onSelect("participants")}>
            <ListItemIcon>
              <GroupIcon />
            </ListItemIcon>
            <ListItemText primary="Participants" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton onClick={() => onSelect("transactions")}>
            <ListItemIcon>
              <GroupIcon />
            </ListItemIcon>
            <ListItemText primary="Transactions" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton onClick={() => onSelect("commodities")}>
            <ListItemIcon>
              <GroupIcon />
            </ListItemIcon>
            <ListItemText primary="Commodities" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton onClick={() => onSelect("cloudUploads")}>
            <ListItemIcon>
              <CloudUpload />
            </ListItemIcon>
            <ListItemText primary="cloud Uploads (use this)" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton onClick={() => onSelect("uploads")}>
            <ListItemIcon>
              <UploadIcon />
            </ListItemIcon>
            <ListItemText primary="Local Uploads (avoid)" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton onClick={() => onSelect("clearOld")}>
            <ListItemIcon>
              <DeleteSweepIcon />
            </ListItemIcon>
            <ListItemText primary="Clear old" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton onClick={() => onSelect("categories")}>
            <ListItemIcon>
              <CategoryIcon />
            </ListItemIcon>
            <ListItemText primary="Categories" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton onClick={() => onSelect("comments")}>
            <ListItemIcon>
              <CommentIcon />
            </ListItemIcon>
            <ListItemText primary="comments" />
          </ListItemButton>
        </ListItem>

        {/* Add more items with icons here */}
      </List>
    </>
  );

  return (
    <>
      {/* ✅ Hamburger button visible only on mobile */}
      {isMobile && (
        <IconButton
          onClick={() => setMobileOpen(!mobileOpen)}
          sx={{
            position: "fixed",
            top: 72, // push below AppBar
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

      {/* ✅ Drawer changes mode depending on screen size */}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"} // mobile → temporary (slides in), desktop → permanent (always visible)
        open={isMobile ? mobileOpen : true} // mobile controlled by hamburger, desktop always open
        onClose={() => setMobileOpen(false)} // ✅ close when clicking outside (only mobile)
        sx={{
          width: 220,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 220,
            boxSizing: "border-box",
            mt: isMobile ? 0 : "64px", // push below AppBar only on desktop
            borderRight: "1px solid #ddd",
            backgroundColor: "#f5f5f5",
            boxShadow: "2px 0 8px rgba(0,0,0,0.1)", // right shadow
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default AdminSidebar;
