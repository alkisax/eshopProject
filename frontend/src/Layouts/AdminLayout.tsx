// frontend\src\Layouts\AdminLayout.tsx
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
import AdminBlogPanel from "../blog/blogComponents/AdminBlogPanel";
import AdminPostsPanel from "../blog/blogComponents/AdminPostsPanel";
import AdminAnalyticsPanel from "../components/store_components/adminPannelCommodity/AdminAnalyticsPanel";
import AdminExcelPanel from "../components/store_components/adminPannelCommodity/AdminExcelPanel";

const AdminLayout = () => {
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);  

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
        {activePanel === "excelTools" && <AdminExcelPanel />}
        {/* αυτα χρειάζονται να περάσουν και state το id του post γιατί αν πατήσω update στο posts θα με μεταφέρει σε άλλο panel που θα πρέπει να πάρει το id του post για να κάνει Populate  */}
        {activePanel === "blog" && <AdminBlogPanel editingPostId={editingPostId} />}
        {activePanel === "posts" && <AdminPostsPanel onEdit={(id) => {
          setEditingPostId(id);
          setActivePanel("blog");
        }} />}
        {activePanel === "clearOld" && <AdminClearOldPanel />}
        {activePanel === "analytics" && <AdminAnalyticsPanel />}
        {!activePanel && <p>Select a panel from the sidebar</p>}
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
