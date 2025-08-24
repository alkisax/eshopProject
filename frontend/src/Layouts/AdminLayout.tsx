import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import AdminUsersPanel from "../components/AdminUsersPanel";

const AdminLayout = () => {
  const [activePanel, setActivePanel] = useState<string | null>(null);

  return (
    <div style={{ display: "flex" }}>
      <AdminSidebar onSelect={setActivePanel} />
      <main style={{ flexGrow: 1, padding: "16px" }}>
        {activePanel === "users" ? (
          <AdminUsersPanel />
        ) : (
          <p>Select a panel from the sidebar</p>
        )}
        {/* Optional: you can still render nested routes */}
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
