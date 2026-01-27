// frontend\src\Layouts\StoreLayout.tsx
import { Outlet, useNavigate } from "react-router-dom";
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
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null);
  const [maxPrice, setMaxPrice] = useState(100);

  const [pageCount, setPageCount] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  // ↓ λειτουργία επιστροφής στην σελίδα που είμασταν: (πχ: είμαι στην σελίδα 4 των paginated προιόντων. επισκευτομαι ενα προϊόν και μετα παταω το back του browser. με πάει στην σελίδα 1 αντι για την 4)
  // παίρνω των αρηθμό της σελ απο url param
  const pageFromUrl = Number(params.get("page")) || 1;
  useEffect(() => {
    setCurrentPage(pageFromUrl);
  }, [pageFromUrl]);

  useEffect(() => {
    // επιστρέφει κατι σαν '?page=4&cat=Δαχτυλίδια'
    // η μορφή του location είναι σαν
    // location = { pathname: '/store', search: '?page=4&cat=Δαχτυλίδια', hash: '', state: null, key: 'abc123' }
    const params = new URLSearchParams(location.search);
    // Τα query params στο URL είναι πάντα strings
    params.set("page", String(currentPage));
    // { replace: true }: «αντί να προσθέσεις νέο history entry, αντικατέστησε το τρέχον»
    navigate({ search: params.toString() }, { replace: true });
  }, [currentPage, location.search, navigate]);

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

  // φτιάξαμε μια νέα fetch commodities για να φέρνει τα προιόντα με paginated απο το backend. Παρότι έχουμε fetch paginated εδώ κάνουμε get απο το search(paginated) γιατι η search μου φαίρνει paginated τα πάντα αν δεν έχει παραμέτρους αρα κάνει το ίδιο πράγμα.
  const fetchPaginatedCommodities = useCallback(async () => {
    try {
      setIsLoading(true);

      const token = localStorage.getItem("token");

      // Custom paramsSerializer:
      // Η axios ΔΕΝ κάνει σωστό encoding για ελληνικά arrays στο query string.  Αν της δώσεις { categories: ["Σκουλαρίκια"] } μπορεί να σπάσει ή να στείλει λάθος encoding, και ο backend να πάρει undefined. Το URLSearchParams κάνει σωστή κωδικοποίηση UTF-8 ΚΑΙ στέλνει σωστά: categories=Σκουλαρίκια
      const res = await axios.get(`${url}/api/commodity/search`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          search: search || undefined,
          categories:
            selectedCategories.length > 0 ? selectedCategories : undefined,
          priceMin: priceRange ? priceRange[0] : undefined,
          priceMax: priceRange ? priceRange[1] : undefined,
        },
        paramsSerializer: (params) => {
          const searchParams = new URLSearchParams();

          Object.keys(params).forEach((key) => {
            const value = params[key];

            if (Array.isArray(value)) {
              value.forEach((v) => searchParams.append(key, v));
            } else if (value !== undefined) {
              searchParams.append(key, value);
            }
          });

          return searchParams.toString();
        },
      });

      const data = res.data.data;

      setMaxPrice(data.maxPrice ?? 100);
      setCommodities(data.items);
      setPageCount(data.pageCount);
    } catch (err) {
      console.error("Pagination fetch failed", err);
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, url, currentPage, search, selectedCategories, priceRange]); // To fetchPaginatedCommodities ξαναδημιουργείται μόνο όταν αλλάξει κάποια από αυτές όταν αλλάζουν categories → νέο fetch - όταν αλλάζει search → νέο fetch ⚠️ οχι απλός ένα dependancy αλλα μέρος της λειτουργείας του search και categories

  useEffect(() => {
    fetchPaginatedCommodities();
  }, [fetchPaginatedCommodities]);

  // φέρνει όλες τις κατηγορίες για το filtering. θα μπορούσα να το έκανα και εδώ απο το commodities αλλα αφου έχω dedicated endpoint είναι μάλλον καλύτερα
  useEffect(() => {
    const fetchCategories = async () => {
      const res = await axios.get(`${url}/api/category`);
      if (res.data.status) {
        const cats = (res.data.data as CategoryType[]).filter((c) => !c.isTag);
        setAllCategories(cats);
      }
    };
    fetchCategories();
  }, [url]);
  const parentCategories = allCategories.filter((cat) => !cat.parent);

  // κάνει set το state με τις κατηγορίες που έχουν επιλεχθει
  const handleToggleCategory = (cat: string, checked: boolean) => {
    // Αν το checkbox μπήκε on (checked === true) → κάνουμε spread το προηγούμενο array και προσθέτουμε τη νέα κατηγορία. Αν το checkbox βγήκε off (checked === false) → κρατάμε όλες τις κατηγορίες εκτός από αυτήν
    setSelectedCategories((prev) => {
      const next = checked ? [...prev, cat] : prev.filter((c) => c !== cat);
      console.log("SELECTED CATEGORIES:", next);
      return next;
    });

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
    setPriceRange(null);
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
            priceRange={priceRange}
            maxPrice={maxPrice}
            onSearch={handleSearch}
            onToggleCategory={handleToggleCategory}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
            onSemanticSearch={handleSemanticSearch}
            onPriceChange={setPriceRange}
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
              <Outlet
                context={{
                  commodities:
                    semanticResults.length > 0 ? semanticResults : commodities,
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
