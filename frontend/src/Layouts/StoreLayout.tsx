// frontend\src\Layouts\StoreLayout.tsx
import { Outlet } from "react-router-dom";
import StoreSidebar from "../components/store_components/StoreSidebar";
import { useCallback, useContext, useEffect, useState } from "react";
import axios from "axios";
import { VariablesContext } from "../context/VariablesContext";
import { UserAuthContext } from "../context/UserAuthContext";
import type {
  CartType,
  CategoryType,
  CommodityType,
} from "../types/commerce.types";
import CartPreviewFooter from "../components/store_components/CartPreviewFooter";
import { useLocation } from "react-router-dom";
// import CrossGridLayout from "./deisgnComponents/CrossGridLayout";

const StoreLayout = () => {
  const { url } = useContext(VariablesContext);
  const { setIsLoading } = useContext(UserAuthContext);

  const [search, setSearch] = useState("");
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [allCategories, setAllCategories] = useState<CategoryType[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [commodities, setCommodities] = useState<CommodityType[]>([]);
  const [semanticResults, setSemanticResults] = useState<CommodityType[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10; // try smaller to test pagination

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const preselectedCategory = params.get("cat");

  // Αν υπάρχει cat=, επιλέγουμε την κατηγορία ΜΟΝΟ στο αρχικό mount
  useEffect(() => {
    if (preselectedCategory && allCategories.length > 0) {
      // βρες την category με αυτό το name
      const cat = allCategories.find((c) => c.name === preselectedCategory);

      if (cat) {
        setSelectedCategories([cat.name]); // βάση του name, όχι του id
        setCurrentPage(1);
        setFiltersApplied((prev) => !prev); // trigger filtering
      }
    }
  }, [preselectedCategory, allCategories]);

  // φερνει τα commodities απο το backend
  // TODO  ⚠️⚠️⚠️ this fetches all commodities
  useEffect(() => {
    const fetchAllCommodities = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(`${url}/api/commodity/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const allCommodities: CommodityType[] = res.data.data;

        setCommodities(allCommodities);
      } catch {
        console.log("error fetching commodities");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllCommodities();
  }, [url, setIsLoading]);

  // φέρνει όλες τις κατηγορίες για το filtering. θα μπορούσα να το έκανα και εδώ απο το commodities αλλα αφου έχω dedicated endpoint είναι μάλλον καλύτερα
  useEffect(() => {
    const fetchCategories = async () => {
      const res = await axios.get(`${url}/api/category`);
      if (res.data.status) {
        // only top-level categories
        const parentCats = (res.data.data as CategoryType[]).filter(
          (c) => !c.parent && !c.isTag
        ); // exclude tagged categories
        setAllCategories(parentCats);
      }
    };
    fetchCategories();
  }, [url]);
  const parentCategories = allCategories.filter((cat) => !cat.parent);

  // 1/3
  const filterBySearch = (items: CommodityType[], searchText: string) => {
    if (!searchText) return items; // no filter if search is empty

    const lowerSearch = searchText.toLowerCase();
    // todo αλλαγή σε backend category search
    return items.filter((commodity) =>
      commodity.name.toLowerCase().includes(lowerSearch)
    );
  };

  // 2/3
  const filterByCategory = (items: CommodityType[]) => {
    if (selectedCategories.length === 0) return items;

    return items.filter((c) => {
      const cat = c.category as unknown;

      // case 1: single string id
      if (typeof cat === "string") {
        return selectedCategories.includes(cat);
      }

      // case 2: array of string ids
      if (Array.isArray(cat) && cat.every((x) => typeof x === "string")) {
        return cat.some((id) => selectedCategories.includes(id));
      }

      // case 3: populated object
      if (typeof cat === "object" && cat && "_id" in cat) {
        return selectedCategories.includes((cat as { _id: string })._id);
      }

      return false;
    });
  };

  // console.log("selectedCategories", selectedCategories);
  // console.log("commodity categories", commodities.map(c => c.category));
  // 3/3 συνένωση των δυο παραπάνω
  const filtered = filterBySearch(filterByCategory(commodities), search);

  // pagination
  const pageCount = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // κάνει set το state με τις κατηγορίες που έχουν επιλεχθει
  const handleToggleCategory = (cat: string, checked: boolean) => {
    // Αν το checkbox μπήκε on (checked === true) → κάνουμε spread το προηγούμενο array και προσθέτουμε τη νέα κατηγορία. Αν το checkbox βγήκε off (checked === false) → κρατάμε όλες τις κατηγορίες εκτός από αυτήν
    setSelectedCategories((prev) =>
      checked ? [...prev, cat] : prev.filter((c) => c !== cat)
    );
    setCurrentPage(1);
  };

  const handleApplyFilters = () => {
    setFiltersApplied((prev) => !prev); // just toggle to re-trigger effect
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearch("");
    setSemanticResults([]);
    setSelectedCategories([]);
    setFiltersApplied((prev) => !prev);
    setCurrentPage(1);
  };

  const handleSearch = (query: string) => {
    setSearch((prev) => {
      if (prev !== query) {
        setCurrentPage(1); // reset only when query changes
      }
      return query;
    });
  };

  // απλό toggle που μπορεί να χρησιμοποιηθεί για re-render ή future side effects
  console.log("filters applied", filtersApplied);

  const handleSemanticSearch = async (query: string) => {
    if (!query.trim()) {
      setSemanticResults([]);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get<{
        status: boolean;
        data: { commodity: CommodityType; score: number }[];
      }>(`${url}/api/ai-embeddings/search`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { query },
      });

      setSemanticResults(res.data.data.map((r) => r.commodity).slice(0, 5));
    } catch (err) {
      console.error("Semantic search failed", err);
    }
  };

  // FOOTER LOGIC
  const { hasCart, globalParticipant } = useContext(VariablesContext);
  const [cart, setCart] = useState<CartType | null>(null);

  // copy/paste απο cartItemList
  // 📝 Χρησιμοποιούμε useCallback για να "κλειδώσουμε" τη συνάρτηση fetchCart,// ώστε να μη δημιουργείται καινούρια σε κάθε render. Έτσι δεν τρελαίνεται το useEffect και αποφεύγουμε το άπειρο loop / warning για dependencies στο [] του useeffect.
  const fetchCart = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${url}/api/cart/${globalParticipant?._id}`);
      const cartRes: CartType = res.data.data;
      setCart(cartRes);
    } catch {
      console.log("error fetching cart");
    } finally {
      setIsLoading(false);
    }
  }, [url, globalParticipant?._id, setIsLoading]);

  useEffect(() => {
    if (globalParticipant?._id) {
      fetchCart();
    }
  }, [fetchCart, globalParticipant?._id, setIsLoading, url]);

  // κανουμε render τρια πράγματα StoreSidebar το footer και Outlet (το Outlet ειναι placeholder του layout που θα καλυφθεί απο το StoreItemList μεσω του Store )
  return (
    <>
      <div
        style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <div style={{ display: "flex", flexGrow: 1 }}>
          <StoreSidebar
            search={search}
            allCategories={parentCategories}
            selectedCategories={selectedCategories}
            onSearch={handleSearch}
            onToggleCategory={handleToggleCategory}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
            onSemanticSearch={handleSemanticSearch}
          />
          <main
            style={{
              display: "flex",
              flexDirection: "column",
              flexGrow: 1,
              padding: "16px",
            }}
          >
            {/*
              - Props = δίνουμε τιμές/handlers κατευθείαν σε child component: <Child count={count} />
              - Outlet context = δεν μπορούμε να περάσουμε props γιατί το child το δημιουργεί το router. Οπότε δίνουμε context στο <Outlet> και το child τα παίρνει με useOutletContext().
              */}
            <div style={{ flexGrow: 1 }}>
              {/* TODO */}
              {/* changed for front end full mount on memory search - Problem see storeSidebar notes */}
              {/* <Outlet context={{ commodities: paginated, pageCount, currentPage, fetchCart,setCurrentPage }} />  */}
              {/* <CrossGridLayout title="Κατάστημα"> */}
                <Outlet
                  context={{
                    commodities:
                      semanticResults.length > 0 ? semanticResults : paginated, // semantic overrides normal list // already sliced
                    pageCount,
                    currentPage,
                    fetchCart,
                    setCurrentPage,
                    selectedCategories,
                  }}
                />
              {/* </CrossGridLayout> */}
            </div>
            <CartPreviewFooter
              hasCart={hasCart}
              cart={cart}
              fetchCart={fetchCart}
            />
          </main>
        </div>
      </div>
    </>
  );
};

export default StoreLayout;
