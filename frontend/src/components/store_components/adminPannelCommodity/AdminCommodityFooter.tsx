// src/components/admin/AdminCommodityFooter.tsx
import { useContext, useEffect, useMemo, useState } from "react";
import {
  TableRow,
  TableCell,
  Button,
  TextField,
  Stack,
  IconButton,
  Typography,
  Autocomplete,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Switch, FormControlLabel } from "@mui/material";
import type {
  CommodityType,
  CommodityVariantType,
} from "../../../types/commerce.types";
import { useAppwriteUploader } from "../../../hooks/useAppwriteUploader";
import { VariablesContext } from "../../../context/VariablesContext";
import axios from "axios";
import { slugify } from "../../../utils/slugify";
import AdminVariantsEditor from "./AdminCommodityFooterComponents/AdminVariantsEditor";

interface CommodityFooterProps {
  setExpanded: (id: string | null) => void;
  commodity: CommodityType;
  onSave: (id: string, data: Partial<CommodityType>) => void;
  onRestock: (id: string, newQuantity: number) => void;
}

const AdminCommodityFooter = ({
  setExpanded,
  commodity,
  onSave,
  onRestock,
}: CommodityFooterProps) => {
  const [editMode, setEditMode] = useState(false);

  // αποθηκεύουμε την φόρμα μας προσορινά σε ένα state
  const [form, setForm] = useState<{
    name: string;
    description: string;
    category: string[];
    price: number;
    currency: string;
    stripePriceId: string;
    stock: number;
    active: boolean;
    images: string[];
    variants: CommodityVariantType[];
  }>({
    name: commodity.name || "",
    description: commodity.description || "",
    // ΠΡΟΣΟΧΗ: εδώ πια δουλεύουμε με categories ως λίστα ονομάτων (string[])
    category: (commodity.category as string[]) || [],
    variants: commodity.variants ?? [],
    price: commodity.price || 0,
    currency: commodity.currency || "eur",
    stripePriceId: commodity.stripePriceId || "",
    stock: commodity.stock || 0,
    active: commodity.active ?? true,
    images: commodity.images || [],
  });

  // εχουμε ανάγκη ένα state για να φυλαμε τα αρχεια για το suggestion
  const [files, setFiles] = useState<string[]>([]);

  const [restockQty, setRestockQty] = useState("");

  // επαναχρησιμοποιούμε τις λειτουργιες upload που μεταφέραμε στο hook. **Αυτό είναι ένα συμαντικό αρχείο**, έχει όλη την λογική μας
  const { ready, uploadFile, getFileUrl, listFiles } = useAppwriteUploader();

  // VariablesContext → έχει την παγκόσμια λίστα κατηγοριών + helper για refresh
  const { url, categories, refreshCategories } = useContext(VariablesContext);

  useEffect(() => {
    setForm({
      name: commodity.name || "",
      description: commodity.description || "",
      category: (commodity.category as string[]) || [],
      price: commodity.price || 0,
      currency: commodity.currency || "eur",
      stripePriceId: commodity.stripePriceId || "",
      stock: commodity.stock || 0,
      active: commodity.active ?? true,
      images: commodity.images || [],
      variants: commodity.variants ?? [],
    });
  }, [commodity]);

  const handleChange = (
    field: string,
    value: string | number | string[] | boolean
  ) => {
    // το διατηρεί όλο ίδιο εκτός απο το οτι αλλαζει την τιμή του field που μας έρχετε απο τα params
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // ====== CATEGORIES (ίδια λογική με το "Add New") ======
  // Χρησιμοποιούμε useMemo για να μην φτιάχνουμε νέο Set σε κάθε render
  const existingSet = useMemo(
    () => new Set(categories.map((c) => c.name.toLowerCase())),
    [categories]
  );

  // θελουμε αν προστεθεί μια νεα κατηγορια να προστεθεί και στην βάση δεδομένων. οι κατηγορίες πια δεν είνα strings στα documents, αλλά εδώ διαχειριζόμαστε *ονόματα*
  const ensureCategoriesExist = async (names: string[]) => {
    const token = localStorage.getItem("token");

    // κρατάμε μόνο τις κατηγορίες που δεν υπάρχουν ήδη
    const toCreate = names.filter((n) => !existingSet.has(n.toLowerCase()));
    if (toCreate.length === 0) return;

    // εδώ θα τα στείλουμε **ένα-ένα με for...of** την δημιουργια του καθε axios post, όχι Promise.all ← αυτό είναι ok για τώρα
    for (const name of toCreate) {
      try {
        await axios.post(
          `${url}/api/category`,
          { name, slug: slugify(name) },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (e) {
        console.warn(`Category create failed for "${name}"`, e);
      }
    }

    // refresh local list (optional) - το στείλαμε στο context
    await refreshCategories();
  };

  // list of strings για το <Autocomplete options={…}>
  const categoryNameOptions = useMemo(
    () => categories.map((c) => c.name),
    [categories]
  );

  // φέρνει τα 5 πιο προσφατα αρχεία. η listfiles έιναι συνα΄ρτηση του cloudupload
  useEffect(() => {
    const loadRecentFiles = async () => {
      if (!ready) return;
      try {
        // call your paginated listFiles (page=1, limit=5)
        const res = await listFiles(1, 5);
        // convert to URLs
        const urls = res.files.map((f) => getFileUrl(f.$id));
        setFiles(urls);
      } catch (err) {
        console.error("Failed to fetch recent files:", err);
      }
    };
    loadRecentFiles();
  }, [ready, getFileUrl, listFiles]);

  return (
    <>
      <IconButton
        size="small"
        color="inherit"
        onClick={() => setExpanded(null)}
        sx={{ ml: 1 }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>

      <TableRow>
        <TableCell colSpan={6}>
          {!editMode ? (
            <Stack spacing={2} direction="column" sx={{ mt: 1 }}>
              <Button variant="outlined" onClick={() => setEditMode(true)}>
                Edit
              </Button>

              <TextField
                label="Restock"
                placeholder="update total quantity"
                size="small"
                value={restockQty}
                onChange={(e) => setRestockQty(e.target.value)}
              />

              <Button
                variant="contained"
                onClick={() => {
                  if (restockQty) {
                    onRestock(commodity._id!, Number(restockQty));
                    setRestockQty("");
                  }
                }}
              >
                Update Stock
              </Button>
            </Stack>
          ) : (
            <Stack spacing={2} direction="column" sx={{ mt: 1 }}>
              <TextField
                label="Name"
                size="small"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />

              <TextField
                label="Description"
                size="small"
                multiline
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />

              {/* multiple: πολλές τιμές, freesolo: επιτρέπει να προσθέσεις και τιμές που δεν είναι στην λίστα, options={categoryNameOptions}: η λίστα με τις τιμές μου */}
              <Autocomplete
                multiple
                freeSolo
                options={categoryNameOptions}
                value={form.category}
                onChange={(_e, value) => handleChange("category", value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    label="Categories"
                    placeholder="Type and press Enter…"
                  />
                )}
              />

              <AdminVariantsEditor
                variants={form.variants}
                onChange={(variants) =>
                  setForm((prev) => ({ ...prev, variants }))
                }
              />

              <TextField
                label="Price"
                size="small"
                type="number"
                value={form.price}
                onChange={(e) => handleChange("price", Number(e.target.value))}
              />

              <TextField
                label="Currency"
                size="small"
                value={form.currency}
                onChange={(e) => handleChange("currency", e.target.value)}
              />

              <TextField
                label="Stripe Price ID"
                size="small"
                value={form.stripePriceId}
                onChange={(e) => handleChange("stripePriceId", e.target.value)}
              />

              <TextField
                label="Stock"
                size="small"
                type="number"
                value={form.stock}
                onChange={(e) => handleChange("stock", Number(e.target.value))}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={form.active}
                    onChange={(e) => handleChange("active", e.target.checked)}
                    color="success"
                  />
                }
                label={
                  form.active
                    ? "Active (visible in store)"
                    : "Inactive (hidden from store)"
                }
              />

              {/* === Images Section === */}
              {/* σχόλια για την λειτουργεία του images θα βρείς στο ΑdminAddNewCommodity */}
              <>
                <Typography variant="subtitle1">Images</Typography>

                {/* Manual URLs */}
                <Autocomplete
                  freeSolo
                  multiple
                  openOnFocus
                  filterSelectedOptions
                  options={files} // e.g. ["https://.../file1.png", "https://.../file2.png"]
                  getOptionLabel={(option) => {
                    console.log("Autocomplete option:", option);
                    return option;
                  }}
                  value={form.images}
                  onChange={(_e, value) => {
                    console.log("Autocomplete new value:", value);
                    handleChange("images", value);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Image URLs"
                      size="small"
                      placeholder="Paste or type URL"
                      onFocus={() =>
                        console.log("Input focused, options:", files)
                      }
                    />
                  )}
                />

                {/* Upload file(s) με Appwrite */}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={async (e) => {
                    // οταν δουλευουμε με type="file" έχουμε προσβαση στο e.target.files που είναι ένα ψευδο-arr με τα αρχεία που έχουμε
                    if (!e.target.files) return;
                    // μετατρέπουμε το ψευδο-arr σε arr
                    const files = Array.from(e.target.files);
                    console.log("Files selected for upload:", files);

                    const uploadedUrls: string[] = [];
                    // εδώ ξεκινάει η for loop μας για τα αρχεια που θα τα ανεβάσει στο appwrite και θα μας επιστρέψει το url. Χρησιμοπποιεί τις functions απο το Hook
                    for (const file of files) {
                      try {
                        const res = await uploadFile(file);
                        const url = getFileUrl(res.$id);
                        console.log("Uploaded file → URL:", url);
                        uploadedUrls.push(url);
                      } catch (err) {
                        console.error("Upload failed:", err);
                      }
                    }

                    // ανανεώνουμε το state διατηρόντας το ίδιο και προσθέτοντας το arr με τα urls
                    setForm((prev) => {
                      const updated = {
                        ...prev,
                        images: [...prev.images, ...uploadedUrls],
                      };
                      console.log("Form.images updated:", updated.images);
                      return updated;
                    });
                  }}
                  disabled={!ready}
                />

                {/* Preview thumbnails */}
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {form.images.map((url, idx) => {
                    console.log("Rendering thumbnail:", idx, url);
                    return (
                      <Box
                        key={idx}
                        sx={{
                          position: "relative",
                          display: "inline-block",
                          overflow: "visible",
                        }}
                      >
                        <img
                          src={url}
                          alt={`preview-${idx}`}
                          style={{
                            width: 60,
                            height: 60,
                            objectFit: "cover",
                            borderRadius: 4,
                          }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => {
                            console.log("Deleting image at index:", idx);
                            setForm((prev) => ({
                              ...prev,
                              images: prev.images.filter((_, i) => i !== idx),
                            }));
                          }}
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
                    );
                  })}
                </Stack>
              </>

              <Stack spacing={1} direction="row">
                <Button
                  variant="contained"
                  onClick={async () => {
                    // 1) Normalize categories from input
                    const categoryNames = (form.category || [])
                      .map((c) => (typeof c === "string" ? c.trim() : c))
                      .filter(Boolean) as string[];

                    // 2) Ensure they exist in DB (creates missing, refreshes context)
                    await ensureCategoriesExist(categoryNames);

                    // 3) Save — category stays as array of names (όπως στο create)
                    onSave(commodity._id!, {
                      ...form,
                      category: categoryNames,
                    });
                    setEditMode(false);
                  }}
                >
                  Save
                </Button>

                <Button variant="outlined" onClick={() => setEditMode(false)}>
                  Cancel
                </Button>
              </Stack>
            </Stack>
          )}
        </TableCell>
      </TableRow>
    </>
  );
};

export default AdminCommodityFooter;
