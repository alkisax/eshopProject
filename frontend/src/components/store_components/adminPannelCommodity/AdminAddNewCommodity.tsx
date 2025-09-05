// src/components/admin/AdminAddNewCommodity.tsx
import { useState, useContext } from "react";
import {
  TextField, Button, Typography, Paper, Stack
} from "@mui/material";
import { VariablesContext } from "../../../context/VariablesContext";
import { UserAuthContext } from "../../../context/UserAuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminAddNewCommodity = () => {
  const { url } = useContext(VariablesContext);
  const { setIsLoading } = useContext(UserAuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    price: 0,
    currency: "eur",
    stripePriceId: "",
    stock: "" as number | "",
    active: true,
    images: [] as string[], // for now array of URLs
  });

  const handleChange = (field: string, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${url}/api/commodity`,
        {
          name: form.name,
          description: form.description,
          category: form.category.split(",").map((c) => c.trim()),
          price: form.price,
          currency: form.currency,
          stripePriceId: form.stripePriceId,
          stock: form.stock === "" ? 0 : form.stock,
          active: form.active,
          images: form.images,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Commodity created:", res.data.data);
      // χρειαζόμαστε κάτι να κάνει refresh στο AdminCommoditiesPanel
      navigate("/admin-panel", { state: { refresh: true } });
    } catch (err) {
      console.error("Error creating commodity:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600 }}>
      <Typography variant="h5" gutterBottom>
        Add New Commodity
      </Typography>

      <Stack spacing={2}>
        <TextField
          label="Name"
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />

        <TextField
          label="Description"
          multiline
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
        />

        <TextField
          label="Categories (comma separated)"
          value={form.category}
          onChange={(e) => handleChange("category", e.target.value)}
        />

        <TextField
          label="Price"
          type="number"
          value={form.price}
          onChange={(e) => handleChange("price", Number(e.target.value))}
        />

        <TextField
          label="Currency"
          value={form.currency}
          onChange={(e) => handleChange("currency", e.target.value)}
        />

        <TextField
          label="Stripe Price ID"
          value={form.stripePriceId}
          onChange={(e) => handleChange("stripePriceId", e.target.value)}
        />

        <TextField
          label="Stock"
          type="number"
          value={form.stock}
          onChange={(e) => {
            const val = e.target.value;
            handleChange("stock", val === "" ? "" : Number(val));
          }}
        />

        {/* Later we can add image uploader (Appwrite integration) here */}

        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
          >
            Save
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default AdminAddNewCommodity;
