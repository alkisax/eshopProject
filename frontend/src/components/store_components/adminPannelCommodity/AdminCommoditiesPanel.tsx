// src/components/admin/AdminCommoditiesPanel.tsx
import { useEffect, useState, useContext, useCallback } from "react";
import axios from "axios";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Typography, Pagination, IconButton
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddBoxIcon from "@mui/icons-material/AddBox";
import DeleteIcon from "@mui/icons-material/Delete";
import { VariablesContext } from "../../../context/VariablesContext";
import { UserAuthContext } from "../../../context/UserAuthContext";
import type { CommodityType } from "../../../types/commerce.types";
import { useNavigate } from "react-router-dom";
import React from "react";
import AdminCommodityFooter from "./AdminCommodityFooter";

const ITEMS_PER_PAGE = 10;

const AdminCommoditiesPanel = () => {
  const { url } = useContext(VariablesContext);
  const { setIsLoading, isLoading } = useContext(UserAuthContext);
  const [commodities, setCommodities] = useState<CommodityType[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [expanded, setExpanded] = useState<string | null>('')

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
  },[setIsLoading, url])

  useEffect(() => {
    fetchCommodities();
  }, [fetchCommodities, url]);

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
    navigate(`/admin/commodity/new`);
  };

  // edit logic in footer

  // pagination slice
  const paginated = commodities.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        Commodities
      </Typography>

      <Button
        variant="contained"
        color="primary"
        startIcon={<AddBoxIcon />}
        onClick={handleAdd}
        sx={{ mb: 2 }}
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
                    <TableCell>{c.category.join(", ")}</TableCell>
                    <TableCell>{c.price} {c.currency}</TableCell>
                    <TableCell>{c.stock}</TableCell>
                    <TableCell>{c.soldCount}</TableCell>
                    <TableCell>
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
          onChange={(_e, p) => setCurrentPage(p)}
          sx={{ mt: 2, display: "flex", justifyContent: "center" }}
        />
      )}
    </div>
  );
};

export default AdminCommoditiesPanel;
