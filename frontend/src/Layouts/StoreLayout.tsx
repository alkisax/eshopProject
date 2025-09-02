import { Outlet } from "react-router-dom";
import StoreSidebar from "../components/store_components/StoreSidebar";
import { useState } from "react";

const StoreLayout = () => {
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<string[]>([]);

  const handleToggleCategory = (cat: string, checked: boolean) => {
    setCategories((prev) =>
      checked ? [...prev, cat] : prev.filter((c) => c !== cat)
    );
  };

  return (
    <div style={{ display: "flex" }}>
      <StoreSidebar
        onSearch={setSearch}
        onToggleCategory={handleToggleCategory}
      />
      <main style={{ flexGrow: 1, padding: "16px" }}>
        {/* pass filters down via Outlet context or props */}
        <Outlet context={{ search, categories }} />
      </main>
    </div>
  );
};

export default StoreLayout;
