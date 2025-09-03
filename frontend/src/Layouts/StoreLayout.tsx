import { Outlet } from "react-router-dom";
import StoreSidebar from "../components/store_components/StoreSidebar";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { VariablesContext } from "../context/VariablesContext";

const StoreLayout = () => {
  const { url } = useContext(VariablesContext);
  
  const [search, setSearch] = useState("");
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await axios.get(`${url}/api/commodity/categories`);
      if (res.data.status) {
        setAllCategories(res.data.data);
      }
    };
    fetchCategories();
  }, [url]);

  const handleToggleCategory = (cat: string, checked: boolean) => {
    setSelectedCategories((prev) =>
      checked ? [...prev, cat] : prev.filter((c) => c !== cat)
    );
  };
  const handleApplyFilters = () => {
    setFiltersApplied((prev) => !prev); // just toggle to re-trigger effect
  };

  const handleClearFilters = () => {
    setSearch("");
    setSelectedCategories([]);
    setFiltersApplied((prev) => !prev);
  };

  console.log('filters applied', filtersApplied)

  return (
    <div style={{ display: "flex" }}>
      <StoreSidebar
        allCategories={allCategories}
        selectedCategories={selectedCategories}
        onSearch={setSearch}
        onToggleCategory={handleToggleCategory}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      />
      <main style={{ flexGrow: 1, padding: "16px" }}>
        {/* pass filters down via Outlet context or props */}
        <Outlet context={{ search, categories: selectedCategories, filtersApplied }} />
      </main>
    </div>
  );
};

export default StoreLayout;
