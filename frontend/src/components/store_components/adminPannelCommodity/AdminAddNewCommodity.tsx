// src/components/admin/AdminAddNewCommodity.tsx
import { useState, useContext, useMemo, useEffect } from "react";
import {
  TextField,
  Button,
  Typography,
  Paper,
  Stack,
  Autocomplete,
  Box,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { VariablesContext } from "../../../context/VariablesContext";
import { UserAuthContext } from "../../../context/UserAuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAppwriteUploader } from "../../../hooks/useAppwriteUploader";
import { slugify } from "../../../utils/slugify";
import AdminVariantsEditor from "./AdminCommodityFooterComponents/AdminVariantsEditor";
import type { EditableVariant } from "./AdminCommodityFooterComponents/AdminVariantsEditor";
import type { CommodityType } from "../../../types/commerce.types";

const AdminAddNewCommodity = () => {
  const { url, categories, refreshCategories } = useContext(VariablesContext);
  const { setIsLoading } = useContext(UserAuthContext);
  const navigate = useNavigate();

  // αποθηκεύουμε την φόρμα μας προσορινά σε ένα state
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: [] as string[],
    price: 0,
    currency: "eur",
    stripePriceId: "",
    stock: "" as number | "",
    active: true,
    images: [] as string[], // for now array of URLs
  });

  // state για variants
  const [editableVariants, setEditableVariants] = useState<EditableVariant[]>(
    []
  );

  // εχουμε ανάγκη ένα state για να φυλαμε τα αρχεια για το suggestion
  const [files, setFiles] = useState<string[]>([]);

  // επαναχρησιμοποιούμε τις λειτουργιες upload που μεταφέραμε στο hook. **Αυτό είναι ένα συμαντικό αρχείο**, έχει όλη την λογική μας
  const { ready, uploadFile, getFileUrl, listFiles } = useAppwriteUploader();

  const handleChange = (
    field: string,
    value: string | number | boolean | string[]
  ) => {
    // το διατηρεί όλο ίδιο εκτός απο το οτι αλλαζει την τιμή του field που μας έρχετε απο τα params
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // added for categories
  //Without useMemo: Every render, React will re-run that code and build a new Set object, even if allCategoryNames didn’t change. With useMemo: React will only re-run the function when allCategoryNames changes. If the component re-renders for some other reason (state/props change unrelated to categories), React will reuse the last Set instead of creating a new one.
  // useMemo(() => ..., [allCategoryNames]) (το [] σαν useEffect και useCallback)
  // έχουμε set γιατί ολλα τα categories είναι μοναδικα
  // δημιουργεί ένα Memo set array με μόνα τα ονόματα σε μικρό
  const existingSet = useMemo(
    () => new Set(categories.map((n) => n.name.toLowerCase())),
    [categories]
  );

  // added for categories
  // θελουμε αν προστεθεί μια νεα κατηγορια να προστεθεί και στην βάση δεδομένων. οι κατηγορίες πια δεν είνα strings
  const ensureCategoriesExist = async (names: string[]) => {
    const token = localStorage.getItem("token");

    // κρατάμε μόνο τις κατηγορίες που δεν υπάρχουν ήδη
    const toCreate = names.filter((n) => !existingSet.has(n.toLowerCase()));
    if (toCreate.length === 0) return;

    // εδώ θα τα στείλουμε **ένα-ένα με for...of** την δημιουργια του καθε axios post, όχι Promise.all ← αυτο είναι χρήσιμο. να το μάθω αργότερα
    for (const name of toCreate) {
      try {
        await axios.post(
          `${url}/api/category`,
          {
            name,
            slug: slugify(name),
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (e) {
        console.warn(`Category create failed for "${name}"`, e);
      }
    }

    // refresh local list (optional) - το στείλαμε στο context
    await refreshCategories();
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      // 1) Normalize categories from input
      const categoryNames = form.category.map((c) => c.trim()).filter(Boolean);

      // 2) Ensure they exist in DB (creates missing, refreshes context)
      await ensureCategoriesExist(categoryNames);

      //normilize variants
      const normalizedVariants = editableVariants.map((v) => ({
        active: v.active,
        attributes: Object.fromEntries(
          v.attributes
            .filter((a) => a.key.trim())
            .map((a) => [a.key.trim(), a.value])
        ),
      }));

      const token = localStorage.getItem("token");

      const payload: Partial<CommodityType> = {
        name: form.name,
        description: form.description,
        category: categoryNames,
        price: form.price,
        currency: form.currency,
        stripePriceId: form.stripePriceId,
        stock: form.stock === "" ? 0 : form.stock,
        active: form.active,
        images: form.images,
      };

      if (normalizedVariants.length > 0) {
        payload.variants = normalizedVariants;
      }

      const res = await axios.post(`${url}/api/commodity`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Commodity created:", res.data.data);
      // χρειαζόμαστε κάτι να κάνει refresh στο AdminCommoditiesPanel. Χρησιμοποιούμε useLocation
      navigate("/admin-panel", { state: { refresh: true } });
    } catch (err) {
      console.error("Error creating commodity:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // list of strings for the <Autocomplete options={…}>
  // δημιουργεί ένα array με μόνο τα ονοματα των categories
  const nameOptions = useMemo(
    () => categories.map((c) => c.name),
    [categories]
  );

  // φέρνει τα 5 πιο προσφατα αρχεία. η listfiles έιναι συνα΄ρτηση του cloudupload
  useEffect(() => {
    const loadRecentFiles = async () => {
      if (!ready) return;
      try {
        const res = await listFiles(1, 5);
        const urls = res.files.map((f) => getFileUrl(f.$id));
        setFiles(urls);
      } catch (err) {
        console.error("Failed to fetch recent files:", err);
      }
    };
    loadRecentFiles();
  }, [ready, getFileUrl, listFiles]);

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

        {/* multiple: πολλές τιμές, freesolo: επιτρέπει να προσθέσεις και τιμές που δεν είναι στην λίστα, opions={nameOptions}: η λίστα με τις τιμές μου, renderInput={(params) => (): κανει ένα Loop  */}
        <Autocomplete
          multiple
          freeSolo
          options={nameOptions}
          value={form.category}
          onChange={(_e, value) => handleChange("category", value)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Categories"
              placeholder="Type and press Enter…"
            />
          )}
        />

        <AdminVariantsEditor
          variants={editableVariants}
          onChange={setEditableVariants}
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

          {/* Paste URLs manually with suggestions */}
          <Autocomplete
            freeSolo
            multiple
            openOnFocus
            filterSelectedOptions
            options={files}
            getOptionLabel={(option) => option}
            value={form.images}
            onChange={(_e, value) => handleChange("images", value)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Image URLs"
                placeholder="Paste or type URL"
              />
            )}
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

          {/* Preview list with X buttons */}
          <Stack direction="row" spacing={2} flexWrap="wrap">
            {form.images.map((url, idx) => (
              <Box
                key={idx}
                sx={{ position: "relative", display: "inline-block" }}
              >
                <img
                  src={url}
                  alt={`preview-${idx}`}
                  style={{
                    width: 80,
                    height: 80,
                    objectFit: "cover",
                    borderRadius: 4,
                  }}
                />
                <IconButton
                  size="small"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      images: prev.images.filter((_, i) => i !== idx),
                    }))
                  }
                  sx={{
                    position: "absolute",
                    top: -8,
                    right: -8,
                    bgcolor: "white",
                    border: "1px solid #ccc",
                    borderRadius: "50%",
                    padding: "2px",
                    "&:hover": { bgcolor: "error.light" },
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Stack>
        </>

        <Stack direction="row" spacing={2}>
          <Button variant="contained" color="primary" onClick={handleSubmit}>
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
