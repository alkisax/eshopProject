// src/components/admin/AdminCommoditiesPanel.tsx
import { useEffect, useState, useContext, useCallback } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  Pagination,
  IconButton,
  Stack,
  Tooltip,
  TextField,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddBoxIcon from "@mui/icons-material/AddBox";
import DeleteIcon from "@mui/icons-material/Delete";
import { VariablesContext } from "../../../context/VariablesContext";
import { UserAuthContext } from "../../../context/UserAuthContext";
import type { CommodityType } from "../../../types/commerce.types";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import React from "react";
import AdminCommodityFooter from "./AdminCommodityFooter";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";

const ITEMS_PER_PAGE = 10;

const AdminCommoditiesPanel = () => {
  const { url } = useContext(VariablesContext);
  const { setIsLoading, isLoading } = useContext(UserAuthContext);
  const [commodities, setCommodities] = useState<CommodityType[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [expanded, setExpanded] = useState<string | null>("");
  const [search, setSearch] = useState(""); // 🔍 added search state

  // 📍 React Router hook that gives info about the current URL (path, query, state).
  // Here we use it to detect { state: { refresh: true } } when navigating back from "Add Commodity"
  // so we know to re-fetch the commodity list.
  const location = useLocation();
  const navigate = useNavigate();

  // αυτό ήταν το παλιο που έκανε client size pagination αφού έφερνε πρωτα ολα τα εμπορεύματα. Που είναι λάθος αρχιτεκτονική
  // const fetchCommodities = useCallback(async () => {
  //   try {
  //     setIsLoading(true);
  //     const token = localStorage.getItem("token");
  //     const res = await axios.get<{ status: boolean; data: CommodityType[] }>(
  //       `${url}/api/commodity`,
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );
  //     setCommodities(res.data.data);
  //     setPageCount(Math.ceil(res.data.data.length / ITEMS_PER_PAGE));
  //   } catch (err) {
  //     console.error("Error fetching commodities:", err);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }, [setIsLoading, url]);

  // useEffect(() => {
  //   fetchCommodities();
  // }, [fetchCommodities, url]);

  // αυτο προστέθηκε για να μπορεί το new commodity που βρίσκετε σε διαφορετικό endpoint αλλα κάνει render στην ιδια σελίδα να προκαλεί refresh στα αντικείμενα οταν προστήθετε κάτι νέο. Χρησιμοποιεί useLocation. δες σχολιο παραπάνω
  // useEffect(() => {
  //   if (location.state?.refresh) {
  //     fetchCommodities();
  //   }
  // }, [location.state, fetchCommodities]);

  const fetchPaginatedCommodities = useCallback(async () => {
    console.log("paginated");

    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.get(`${url}/api/commodity/search`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          search: search || undefined,
          includeInactive: true,
        },
      });

      const data = res.data.data;
      setCommodities(data.items);
      setPageCount(data.pageCount);
    } catch (err) {
      console.error("Error fetching paginated commodities:", err);
    } finally {
      setIsLoading(false);
    }
  }, [url, currentPage, search, setIsLoading]);

  // αυτο προστέθηκε για να μπορεί το new commodity που βρίσκετε σε διαφορετικό endpoint αλλα κάνει render στην ιδια σελίδα να προκαλεί refresh στα αντικείμενα οταν προστήθετε κάτι νέο. Χρησιμοποιεί useLocation. δες σχολιο παραπάνω
  useEffect(() => {
    fetchPaginatedCommodities();
  }, [location.state, fetchPaginatedCommodities]);

  const handleSaveCommodity = async (
    id: string,
    data: Partial<CommodityType>
  ) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.patch<{ status: boolean; data: CommodityType }>(
        `${url}/api/commodity/${id}`,
        {
          // only allow some fields to be updated
          name: data.name,
          description: data.description,
          details: data.details,
          tips: data.tips,
          category: data.category,
          price: data.price,
          currency: data.currency,
          stripePriceId: data.stripePriceId,
          stock: data.stock,
          active: data.active,
          images: data.images,
          variants: data.variants,
          requiresProcessing: data.requiresProcessing,
          processingTimeDays: data.processingTimeDays,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Commodity updated:", res.data.data);
      await fetchPaginatedCommodities(); // refresh
    } catch (err) {
      console.error("Error updating commodity:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestockCommodity = async (id: string, qty: number) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.patch<{ status: boolean; data: CommodityType }>(
        `${url}/api/commodity/${id}`,
        { stock: qty }, // ⚡ total new stock value, not increment
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Commodity restocked:", res.data.data);
      await fetchPaginatedCommodities(); // refresh list
    } catch (err) {
      console.error("Error restocking commodity:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this commodity?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${url}/api/commodity/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPaginatedCommodities();
    } catch (err) {
      console.error("Error deleting commodity:", err);
    }
  };

  const handleAdd = () => {
    navigate(`/admin-panel/commodity/new`);
  };

  const handleVectorizeCommodity = async (id: string) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      await axios.post(
        `${url}/api/ai-embeddings/vectorize/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("created vector for commodity");
      await fetchPaginatedCommodities();
    } catch (err) {
      console.error("Error vectorizing commodity:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // edit logic in footer

  // client side pagination removed but kept commented out for history
  // 🔍 client-side filter for small datasets (<100)
  // const filtered = commodities.filter((c) => {
  //   const lower = search.toLowerCase();
  //   return (
  //     c.name?.toLowerCase().includes(lower) ||
  //     c.description?.toLowerCase().includes(lower) ||
  //     (Array.isArray(c.category) &&
  //       c.category.some(
  //         (cat) => typeof cat === "string" && cat.toLowerCase().includes(lower)
  //       ))
  //   );
  // });

  // client side pagination removed but kept commented out for history
  // const dynamicPageCount = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  // // pagination slice
  // const paginated = filtered.slice(
  //   (currentPage - 1) * ITEMS_PER_PAGE,
  //   currentPage * ITEMS_PER_PAGE
  // );

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        Commodities
      </Typography>

      {/* 🔍 Search bar for small admin datasets */}
      <TextField
        id="admin-commodity-search"
        label="Search commodities"
        variant="outlined"
        size="small"
        fullWidth
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setCurrentPage(1);
        }}
        sx={{ mb: 2, maxWidth: 300 }}
      />

      <Button
        variant="contained"
        color="primary"
        startIcon={<AddBoxIcon />}
        onClick={handleAdd}
        sx={{ mb: 2, ml: 2 }}
      >
        Add Commodity
      </Button>

      {isLoading && <p>Loading...</p>}
      {!isLoading && commodities.length === 0 && <p>No commodities found.</p>}

      {!isLoading && commodities.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Sold</TableCell>
                <TableCell>Variants</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {commodities.map((c) => (
                <React.Fragment key={c._id?.toString()}>
                  <TableRow>
                    <TableCell>{c.name}</TableCell>
                    <TableCell>{(c.category as string[]).join(", ")}</TableCell>
                    <TableCell>
                      {c.price} {c.currency}
                    </TableCell>
                    <TableCell>{c.stock}</TableCell>
                    <TableCell>{c.soldCount}</TableCell>
                    <TableCell>
                      {c.variants?.length
                        ? `${c.variants.length} variants`
                        : "—"}
                    </TableCell>

                    {/* Actions cell */}
                    <TableCell>
                      {/* On large screens → row of buttons */}
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ display: { xs: "none", sm: "flex" } }}
                      >
                        <IconButton
                          color="primary"
                          onClick={() => setExpanded(c._id!.toString())}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(c._id!.toString())}
                        >
                          <DeleteIcon />
                        </IconButton>
                        <Tooltip title="Vectorize">
                          <IconButton
                            color={
                              c.vector && c.vector.length > 0
                                ? "success"
                                : "warning"
                            }
                            onClick={() =>
                              handleVectorizeCommodity(c._id!.toString())
                            }
                          >
                            <PrecisionManufacturingIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>

                      {/* On small screens → stacked buttons */}
                      <Stack
                        direction="column"
                        spacing={0.5}
                        sx={{ display: { xs: "flex", sm: "none" } }}
                      >
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => setExpanded(c._id!.toString())}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDelete(c._id!.toString())}
                        >
                          Delete
                        </Button>
                        <Button
                          variant="outlined"
                          color={
                            c.vector && c.vector.length > 0
                              ? "success"
                              : "warning"
                          }
                          onClick={() =>
                            handleVectorizeCommodity(c._id!.toString())
                          }
                          size="small"
                          startIcon={<PrecisionManufacturingIcon />}
                        >
                          Vectorize
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>

                  {expanded === c._id && (
                    <AdminCommodityFooter
                      setExpanded={setExpanded}
                      commodity={c}
                      onSave={handleSaveCommodity}
                      onRestock={handleRestockCommodity}
                    />
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {pageCount > 1 && (
        <Pagination
          count={pageCount}
          page={currentPage}
          onChange={(_, p) => setCurrentPage(p)}
          sx={{ mt: 2, display: "flex", justifyContent: "center" }}
        />
      )}

      {/* ===================== ADMIN COMMODITIES PANEL – INSTRUCTIONS ===================== */}
      <Paper
        sx={{ p: 2, mt: 4, backgroundColor: "#f7f7f7" }}
        variant="outlined"
      >
        <Typography variant="h6" sx={{ mb: 1 }}>
          Instructions – Commodities Management
        </Typography>

        <Typography variant="body2" sx={{ mb: 1 }}>
          • This panel lists all products in the shop. You can search, edit,
          restock, delete, vectorize, or create new commodities.
        </Typography>

        <Typography variant="body2" sx={{ mb: 1 }}>
          • <b>Edit</b>: Expands the product row and opens the editing footer.
          You can change name, description, categories, price, currency, Stripe
          price ID, stock, active state, and images.
        </Typography>

        <Typography variant="body2" sx={{ mb: 1 }}>
          • <b>Categories</b>: Categories are stored as strings. When editing,
          you may type new categories freely. If a category does not exist in
          the database, the system creates it automatically (with slugified
          name).
        </Typography>

        <Typography variant="body2" sx={{ mb: 1 }}>
          • <b>Images</b>: You can add images either by pasting URLs or by
          uploading files (handled via Appwrite). Uploaded images generate
          public URLs automatically. Each thumbnail can be removed individually.
        </Typography>

        <Typography variant="body2" sx={{ mb: 1 }}>
          • <b>Restock</b>: Updates the total stock number (not increment).
          Example: setting “20” makes the product’s total stock = 20.
        </Typography>

        <Typography variant="body2" sx={{ mb: 1 }}>
          • <b>Vectorize</b>: Sends the product through the AI embeddings
          endpoint. This creates semantic vectors used for “similar products”
          suggestions. The icon turns green when vectors already exist.
        </Typography>

        <Typography variant="body2" sx={{ mb: 1 }}>
          • <b>Delete</b>: Permanently removes the product and all internal
          references. Use only when absolutely necessary.
        </Typography>

        <Typography variant="body2" sx={{ mb: 1 }}>
          • <b>Add Commodity</b>: Opens the create page. On save, it returns to
          this panel and automatically refreshes the list (via React Router
          location state).
        </Typography>

        <Typography variant="body2">
          • Pagination and search help navigate large catalogs. Filtering is
          local and updates automatically as you type.
        </Typography>
      </Paper>
    </div>
  );
};

export default AdminCommoditiesPanel;
