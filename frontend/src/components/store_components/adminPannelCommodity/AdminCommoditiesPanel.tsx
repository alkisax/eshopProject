// src/components/admin/AdminCommoditiesPanel.tsx
import { useEffect, useState, useContext, useCallback } from "react";
import axios from "axios";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Typography, Pagination, IconButton, Stack, Tooltip, TextField
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_pageCount, setPageCount] = useState(0);
  const [expanded, setExpanded] = useState<string | null>('');
  const [search, setSearch] = useState(""); // 🔍 added search state

  // 📍 React Router hook that gives info about the current URL (path, query, state).
  // Here we use it to detect { state: { refresh: true } } when navigating back from "Add Commodity"
  // so we know to re-fetch the commodity list.
  const location = useLocation();
  const navigate = useNavigate();

  const fetchCommodities = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get<{ status: boolean; data: CommodityType[] }>(
        `${url}/api/commodity`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCommodities(res.data.data);
      setPageCount(Math.ceil(res.data.data.length / ITEMS_PER_PAGE));
    } catch (err) {
      console.error("Error fetching commodities:", err);
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, url]);

  useEffect(() => {
    fetchCommodities();
  }, [fetchCommodities, url]);

  // αυτο προστέθηκε για να μπορεί το new commodity που βρίσκετε σε διαφορετικό endpoint αλλα κάνει render στην ιδια σελίδα να προκαλεί refresh στα αντικείμενα οταν προστήθετε κάτι νέο. Χρησιμοποιεί useLocation. δες σχολιο παραπάνω
  useEffect(() => {
    if (location.state?.refresh) {
      fetchCommodities();
    }
  }, [location.state, fetchCommodities]);

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
          category: data.category,
          price: data.price,
          currency: data.currency,
          stripePriceId: data.stripePriceId,
          stock: data.stock,
          active: data.active,
          images: data.images,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Commodity updated:", res.data.data);
      await fetchCommodities(); // refresh
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
      await fetchCommodities(); // refresh list
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
      fetchCommodities();
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
      console.log('created vector for commodity');
      await fetchCommodities();
    } catch (err) {
      console.error("Error vectorizing commodity:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // edit logic in footer

  // 🔍 client-side filter for small datasets (<100)
  const filtered = commodities.filter((c) => {
    const lower = search.toLowerCase();
    return (
      c.name?.toLowerCase().includes(lower) ||
      c.description?.toLowerCase().includes(lower) ||
      (Array.isArray(c.category) &&
        c.category.some(cat => typeof cat === "string" && cat.toLowerCase().includes(lower)))
    );
  });

  const dynamicPageCount = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  // pagination slice
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map((c) => (

                <React.Fragment key={c._id?.toString()}>
                  <TableRow>
                    <TableCell>{c.name}</TableCell>
                    <TableCell>{(c.category as string[]).join(", ")}</TableCell>
                    <TableCell>
                      {c.price} {c.currency}
                    </TableCell>
                    <TableCell>{c.stock}</TableCell>
                    <TableCell>{c.soldCount}</TableCell>

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
                            color={c.vector && c.vector.length > 0 ? "success" : "warning"}
                            onClick={() => handleVectorizeCommodity(c._id!.toString())}
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
                          color={c.vector && c.vector.length > 0 ? "success" : "warning"}
                          onClick={() => handleVectorizeCommodity(c._id!.toString())}
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

      {dynamicPageCount > 1 && (
        <Pagination
          count={dynamicPageCount}
          page={currentPage}
          onChange={(_e, p) => setCurrentPage(p)}
          sx={{ mt: 2, display: "flex", justifyContent: "center" }}
        />
      )}
    </div>
  );
}

export default AdminCommoditiesPanel;
