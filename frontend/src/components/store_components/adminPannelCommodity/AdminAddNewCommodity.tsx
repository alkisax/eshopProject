// src/components/admin/AdminAddNewCommodity.tsx
import { useState, useContext } from "react";
import {
  TextField, Button, Typography, Paper, Stack
} from "@mui/material";
import { VariablesContext } from "../../../context/VariablesContext";
import { UserAuthContext } from "../../../context/UserAuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAppwriteUploader } from "../../../hooks/useAppwriteUploader"

const AdminAddNewCommodity = () => {
  const { url } = useContext(VariablesContext);
  const { setIsLoading } = useContext(UserAuthContext);
  const navigate = useNavigate();

  // αποθηκεύουμε την φόρμα μας προσορινά σε ένα state
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

  // επαναχρησιμοποιούμε τις λειτουργιες upload που μεταφέραμε στο hook. **Αυτό είναι ένα συμαντικό αρχείο**, έχει όλη την λογική μας
  const { ready, uploadFile, getFileUrl } = useAppwriteUploader();

  const handleChange = (field: string, value: string | number | boolean | string[]) => {
    // το διατηρεί όλο ίδιο εκτός απο το οτι αλλαζει την τιμή του field που μας έρχετε απο τα params
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
      // χρειαζόμαστε κάτι να κάνει refresh στο AdminCommoditiesPanel. Χρησιμοποιούμε useLocation
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

        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            label="Stripe Price ID"
            value={form.stripePriceId}
            onChange={(e) => handleChange("stripePriceId", e.target.value)}
            fullWidth
          />
          {/* προσθέσαμε ένα λινκ για το stripe για να μπορείς να προσθέσεις στο stipe νεα εμπορεύματα */}
          <Button
            variant="outlined"
            href="https://dashboard.stripe.com/login?redirect=%2Fdashboard"
            target="_blank"
            rel="noopener noreferrer"
          >
            Get ID
          </Button>
        </Stack>

        <TextField
          label="Stock"
          type="number"
          value={form.stock}
          onChange={(e) => {
            const val = e.target.value;
            handleChange("stock", val === "" ? "" : Number(val));
          }}
        />

        <>
          <Typography variant="subtitle1">Images</Typography>

          {/* Paste URLs manually */}
          <TextField
            label="Image URLs (comma separated)"
            value={form.images.join(", ")}
            onChange={(e) =>
              handleChange("images", e.target.value.split(",").map((s) => s.trim()))
            }
          />

          {/* Upload file */}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={async (e) => {
              // οταν δουλευουμε με type="file" έχουμε προσβαση στο e.target.files που είναι ένα ψευδο-arr με τα αρχεία που έοχυμε
              if (!e.target.files) return;
              // μετατρέπουμε του ψευδο-arr σε αρρ
              const files = Array.from(e.target.files);

              const uploadedUrls: string[] = [];
              // εδώ ξεκινάει η for loop μας για τα αρχεια που θα τα ανεβάσει στο appwrite και θα μας επιστρέψει το url. Χρησιμοπποιεί τις functions απο το Hook
              for (const file of files) {
                try {
                  const res = await uploadFile(file);
                  const url = getFileUrl(res.$id); // Appwrite fileId → direct view URL
                  uploadedUrls.push(url);
                } catch (err) {
                  console.error("Upload failed:", err);
                }
              }

              // ανανεώνουμε το state διατηρόντας το ίδιο και προσθέτοντασ το arr με τα urls
              setForm((prev) => ({
                ...prev,
                images: [...prev.images, ...uploadedUrls],
              }));
            }}
            disabled={!ready}
          />

          {/* Preview list */}
          <Stack direction="row" spacing={2} flexWrap="wrap">
            {form.images.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={`preview-${idx}`}
                style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 4 }}
              />
            ))}
          </Stack>        
        </>

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
