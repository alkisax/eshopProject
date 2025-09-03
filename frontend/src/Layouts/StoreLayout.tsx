import { Outlet } from "react-router-dom";
import StoreSidebar from "../components/store_components/StoreSidebar";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { VariablesContext } from "../context/VariablesContext";
import { UserAuthContext } from "../context/UserAuthContext";
import type { CommodityType } from "../types/commerce.types";

const StoreLayout = () => {
  const { url } = useContext(VariablesContext);
  const { setIsLoading } = useContext(UserAuthContext);

  const [search, setSearch] = useState("");
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [commodities, setCommodities] = useState<CommodityType[]>([]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15; // try smaller to test pagination

  useEffect(() => {
    const fetchAllCommodities = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(`${url}/api/commodity/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const allCommodities: CommodityType[] = res.data.data;

        // ✅ keep *all* items in state, no slicing here
        setCommodities(allCommodities);
      } catch {
        console.log("error fetching commodities");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllCommodities();
  }, [url, setIsLoading]);

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await axios.get(`${url}/api/commodity/categories`);
      if (res.data.status) {
        setAllCategories(res.data.data);
      }
    };
    fetchCategories();
  }, [url]);
    
  const filtered = commodities.filter((c) => {
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.some((cat) => c.category.includes(cat));
    const matchesSearch =
      search === "" || c.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const pageCount = (Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
        <Outlet context={{ commodities: paginated, pageCount, currentPage, setCurrentPage }} />
      </main>
    </div>
  );
};

export default StoreLayout;
