# backend

## dao
```js
// για category filter και search bar. τα αποτελέσματα είναι paginated γιατί μπορεί να είναι πολλά
// in: σελίδα και limit pagination, search param, categories param (πάνω απο μία κατηγορίες). out: pagination info, search results items
const searchCommodities = async ({
  page,
  limit, // πόσα προϊόντα δείχνουμε ανά σελίδα
  search,
  categories,
}: {
  page: number;
  limit: number;
  search?: string;
  categories?: string[];
}): Promise<{
  items: CommodityType[];
  total: number;
  page: number;
  pageCount: number;
}> => {
  // επειδή δεν ξέρουμε αν θα είναι search bar, category filter ή και τα δύο, φτιάχνουμε την μεταβλητή filter που αργότερα θα μπεί μέσα στην αναζήτηση στην εντολή της mongo. Ειναι type unknown γιατι θα είναι παραμέτροι query της mongo
  //  Αν υπάρχουν ΚΑΙ categories ΚΑΙ search, το filter γίνεται: { category: { $in: ["Silver", "Gold"] }, name: { $regex: "ring", $options: "i" } }
  const filter: Record<string, unknown> = {};

  // 📌 category filtering
  // normalize('NFC') → λύνει πρόβλημα με ελληνικούς χαρακτήρες που μπορεί να σταλούν σε διαφορετική unicode μορφή (π.χ. τα τονισμένα γράμματα. Έτσι "Σκουλαρίκια" από browser και DB θα συγκρίνονται 100% ίδια.
  if (categories && categories.length > 0) {
    const normalized = categories.map((c) => c.normalize('NFC'));
    filter.category = { $in: normalized };
  }

  // 📌 name search
  //$options: 'i' → case insensitive (Ring, ring, RING)
  if (search && search.trim() !== '') {
    filter.name = { $regex: search, $options: 'i' };
  }

  // pagination func δες παραπάνω
  const safePage = page > 0 ? page : 1;
  const safeLimit = limit > 0 ? limit : 10;

  // Προσπέρασε τα πρώτα n αποτελέσματα και ξεκίνα να μου επιστρέφεις από το επόμενο. Οπότε αν 0 προσπερνάει 0 προϊόντα, αν 1 προσπερνάει safelimit προϊόντα (10) κλπ
  const skip = (safePage - 1) * safeLimit;

  const items = await Commodity.find(filter)
    .sort({ createdAt: 1 }) // to σορτ μοιάζει αυθέρετο αλλα χρειάζετε για να επιστρέφει κάθε φορά τα ίδια προβλεπόμενα αποτελέσματα
    .skip(skip) // Προσπέρασε τα πρώτα n αποτελέσματα - εντολή mongoDB
    .limit(safeLimit) // πόσα αποτελέσματα να επιστρέψει - εντολή mongoDB
    .select('-vector');

  const total = await Commodity.countDocuments(filter);

  return {
    items,
    total,
    page: safePage,
    pageCount: Math.ceil(total / safeLimit) || 1,
  };
};
```

## controller
```ts
// search με search bar ή/και category(ies) filtering
// in: pagination info (page, limit), query
// out: pagination info, filtered items
const search = async (req: Request, res: Response) => {
  try {
    // pagination params
    let page: number = 1;
    let limit: number = 12;

    const pageParam = req.query.page;
    const limitParam = req.query.limit;

    // απο το query μου έρχονται όλα σε string
    if (typeof pageParam === 'string') {
      const parsed = Number(pageParam);
      if (!Number.isNaN(parsed) && parsed > 0) {
        page = parsed;
      }
    }

    if (typeof limitParam === 'string') {
      const parsed = Number(limitParam);
      if (!Number.isNaN(parsed) && parsed > 0) {
        limit = parsed;
      }
    }

    // --- search param ---
    let search: string | undefined = undefined;
    const searchParam = req.query.search;

    if (typeof searchParam === 'string') {
      const trimmed = searchParam.trim();
      if (trimmed !== '') {
        search = trimmed;
      }
    }

    // --- categories param ---
    let categories: string[] | undefined = undefined;
    const categoriesParam = req.query.categories;

    if (Array.isArray(categoriesParam)) {
      categories = categoriesParam.map((c) => String(c));
    } else if (typeof categoriesParam === 'string') {
      categories = [categoriesParam];
    }

    // --- DAO call ---
    const result = await commodityDAO.searchCommodities({
      page,
      limit,
      search,
      categories,
    });

    // --- response ---
    return res.status(200).json({
      status: true,
      data: result,
    });
  } catch (err) {
    return handleControllerError(res, err);
  }
};

// GET commodity by ID
const findById = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res
      .status(400)
      .json({ status: false, error: 'Commodity ID is required' });
  }

  try {
    const commodity = await commodityDAO.findCommodityById(id);
    return res.status(200).json({ status: true, data: commodity });
  } catch (error) {
    return handleControllerError(res, error);
  }
};
```
- route & app
```ts
// για το search bar και category filtering. επιστρέφει paginated αποτελέσματα
router.get('/search', commodityController.search);

app.use('/api/commodity', commodityRoutes);
```
# frontend

```tsx
  const [pageCount, setPageCount] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

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

      setCommodities(data.items);
      setPageCount(data.pageCount);
    } catch (err) {
      console.error("Pagination fetch failed", err);
    } finally {
      setIsLoading(false);
    }
  }, [
    url,
    currentPage,
    ITEMS_PER_PAGE,
    selectedCategories,
    search,
    setIsLoading,
  ]);  // To fetchPaginatedCommodities ξαναδημιουργείται μόνο όταν αλλάξει κάποια από αυτές όταν αλλάζουν categories → νέο fetch - όταν αλλάζει search → νέο fetch ⚠️ οχι απλός ένα dependancy αλλα μέρος της λειτουργείας του search και categories

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
```
