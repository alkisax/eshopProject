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
import Inventory2Icon from '@mui/icons-material/Inventory2';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ArticleIcon from "@mui/icons-material/Article"; 
import DynamicFeedIcon from '@mui/icons-material/DynamicFeed';
import { CloudUpload } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import SsidChartIcon from '@mui/icons-material/SsidChart';

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
          <ListItemButton id="admin-sidebar-users" onClick={() => onSelect("users")}>
            <ListItemIcon>
              <PeopleIcon />
            </ListItemIcon>
            <ListItemText primary="Users" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton id="admin-sidebar-participants" onClick={() => onSelect("participants")}>
            <ListItemIcon>
              <GroupIcon />
            </ListItemIcon>
            <ListItemText primary="Participants" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton id="admin-sidebar-transactions" onClick={() => onSelect("transactions")}>
            <ListItemIcon>
              <ReceiptIcon />
            </ListItemIcon>
            <ListItemText primary="Transactions" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton id="admin-sidebar-commodities" onClick={() => onSelect("commodities")}>
            <ListItemIcon>
              <Inventory2Icon />
            </ListItemIcon>
            <ListItemText primary="Commodities" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton id="admin-sidebar-cloud-uploads" onClick={() => onSelect("cloudUploads")}>
            <ListItemIcon>
              <CloudUpload />
            </ListItemIcon>
            <ListItemText primary="cloud Uploads (use this)" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton id="admin-sidebar-local-uploads" onClick={() => onSelect("uploads")}>
            <ListItemIcon>
              <UploadIcon />
            </ListItemIcon>
            <ListItemText primary="Local Uploads (avoid)" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton id="admin-sidebar-clear-old" onClick={() => onSelect("clearOld")}>
            <ListItemIcon>
              <DeleteSweepIcon />
            </ListItemIcon>
            <ListItemText primary="Clear old" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton id="admin-sidebar-categories" onClick={() => onSelect("categories")}>
            <ListItemIcon>
              <CategoryIcon />
            </ListItemIcon>
            <ListItemText primary="Categories" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton id="admin-sidebar-comments" onClick={() => onSelect("comments")}>
            <ListItemIcon>
              <CommentIcon />
            </ListItemIcon>
            <ListItemText primary="comments" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton id="admin-sidebar-create-posts" onClick={() => onSelect("blog")}>
            <ListItemIcon>
              <ArticleIcon />
            </ListItemIcon>
            <ListItemText primary="Create/Edit blog posts" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton id="admin-sidebar-posts" onClick={() => onSelect("posts")}>
            <ListItemIcon>
              <DynamicFeedIcon />
            </ListItemIcon>
            <ListItemText primary="Posts" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton id="admin-sidebar-analytics" onClick={() => onSelect("analytics")}>
            <ListItemIcon>
              <SsidChartIcon /> 
            </ListItemIcon>
            <ListItemText primary="Analytics" />
          </ListItemButton>
        </ListItem>

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
