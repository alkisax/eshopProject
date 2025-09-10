import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import AdminUsersPanel from "../components/AdminUsersPanel";
import AdminParticipantsPanel from "../components/store_components/adminPannelCommodity/AdminParticipantsPanel ";
import AdminTransactionsPanel from "../components/store_components/adminPannelCommodity/AdminTransactionsPanel";
import AdminCommoditiesPanel from "../components/store_components/adminPannelCommodity/AdminCommoditiesPanel"
import AdminLocalUploadsPanel from "../components/store_components/adminPannelCommodity/AdminLocalUploadPannel";
import AdminCloudUploadsPanel from "../components/store_components/adminPannelCommodity/AdminCloudUploadsPanel";
import AdminClearOldPanel from "../components/store_components/adminPannelCommodity/AdminClearOldPannel";
import AdminCategoriesPanel from '../components/store_components/adminPannelCommodity/AdminCategoriesPannel'
import AdminCommentsPanel from "../components/store_components/adminPannelCommodity/AdminCommentsPannel";

const AdminLayout = () => {
  const [activePanel, setActivePanel] = useState<string | null>(null);

  return (
    <div style={{ display: "flex" }}>
      <AdminSidebar onSelect={setActivePanel} />
      <main style={{ flexGrow: 1, padding: "16px" }}>
        {activePanel === "users" && <AdminUsersPanel />}
        {activePanel === "participants" && <AdminParticipantsPanel />}
        {activePanel === "transactions" && <AdminTransactionsPanel />}
        {activePanel === "commodities" && <AdminCommoditiesPanel />}
        {activePanel === "cloudUploads" && <AdminCloudUploadsPanel />}
        {activePanel === "uploads" && <AdminLocalUploadsPanel />}
        {activePanel === "categories" && <AdminCategoriesPanel />}
        {activePanel === "comments" && <AdminCommentsPanel />}
        {activePanel === "clearOld" && <AdminClearOldPanel />}
        {!activePanel && <p>Select a panel from the sidebar</p>}
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
