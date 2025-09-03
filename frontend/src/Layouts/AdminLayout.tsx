import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import AdminUsersPanel from "../components/AdminUsersPanel";
import AdminParticipantsPanel from "../components/store_components/AdminParticipantsPanel ";
import AdminTransactionsPanel from "../components/store_components/AdminTransactionsPanel";

const AdminLayout = () => {
  const [activePanel, setActivePanel] = useState<string | null>(null);

  return (
    <div style={{ display: "flex" }}>
      <AdminSidebar onSelect={setActivePanel} />
      <main style={{ flexGrow: 1, padding: "16px" }}>
        {activePanel === "users" && <AdminUsersPanel />}
        {activePanel === "participants" && <AdminParticipantsPanel />}
        {activePanel === "transactions" && <AdminTransactionsPanel />}
        {!activePanel && <p>Select a panel from the sidebar</p>}
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
