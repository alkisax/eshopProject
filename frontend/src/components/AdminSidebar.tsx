import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Divider } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import GroupIcon from "@mui/icons-material/Group";
import UploadIcon from "@mui/icons-material/Upload";

interface AdminSidebarProps {
  onSelect: (panel: string) => void;
}

const AdminSidebar = ({ onSelect }: AdminSidebarProps) => {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 220,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 220,
          boxSizing: "border-box",
          mt: '64px', // push below AppBar (adjust if navbar is taller)
          borderRight: '1px solid #ddd',
          backgroundColor: '#f5f5f5',
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)', // right shadow
        },
      }}
    >
      {/* Adds space equal to AppBar height so content starts below it */}
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
          <ListItemButton onClick={() => onSelect("uploads")}>
            <ListItemIcon>
              <UploadIcon />
            </ListItemIcon>
            <ListItemText primary="Local Uploads (avoid)" />
          </ListItemButton>
        </ListItem>

        {/* Add more items with icons here */}
      </List>
    </Drawer>
  );
};

export default AdminSidebar;

