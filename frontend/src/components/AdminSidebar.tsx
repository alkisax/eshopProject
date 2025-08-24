import React from "react";
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Divider } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";

interface AdminSidebarProps {
  onSelect: (panel: string) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ onSelect }) => {
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

        {/* Add more items with icons here */}
      </List>
    </Drawer>
  );
};

export default AdminSidebar;

