import { useState } from "react";
import {
  TableRow, TableCell, Button, TextField, 
  Stack, IconButton, Typography
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { CommodityType } from "../../../types/commerce.types";
import { useAppwriteUploader } from "../../../hooks/useAppwriteUploader";

interface CommodityFooterProps {
  setExpanded: (id: string | null) => void;
  commodity: CommodityType;
  onSave: (id: string, data: Partial<CommodityType>) => void;
  onRestock: (id: string, newQuantity: number) => void;
}

const AdminCommodityFooter = ({ setExpanded, commodity, onSave, onRestock }: CommodityFooterProps) => {
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: commodity.name || "",
    description: commodity.description || "",
    category: commodity.category || [],
    price: commodity.price || 0,
    currency: commodity.currency || "eur",
    stripePriceId: commodity.stripePriceId || "",
    stock: commodity.stock || 0,
    active: commodity.active ?? true,
    images: commodity.images || [],
  });
  const [restockQty, setRestockQty] = useState("");

  const { ready, uploadFile, getFileUrl } = useAppwriteUploader();

  const handleChange = (field: string, value: string | number | string[] | boolean) => {
    setForm({ ...form, [field]: value });
  };

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

              <TextField
                label="Category (comma separated)"
                size="small"
                value={form.category.join(", ")}
                onChange={(e) =>
                  handleChange(
                    "category",
                    e.target.value.split(",").map((s) => s.trim())
                  )
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

              {/* === Images Section === */}
              {/* σχόλια για την λειτουργεία του images θα βρείς στο ΑdminAddNewCommodity */}
              <>
                <Typography variant="subtitle1">Images</Typography>

                {/* Manual URLs */}
                <TextField
                  label="Image URLs (comma separated)"
                  size="small"
                  value={form.images.join(", ")}
                  onChange={(e) =>
                    handleChange(
                      "images",
                      e.target.value.split(",").map((s) => s.trim())
                    )
                  }
                />

                {/* Upload file(s) */}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={async (e) => {
                    if (!e.target.files) return;
                    const files = Array.from(e.target.files);
                    const uploadedUrls: string[] = [];
                    for (const file of files) {
                      try {
                        const res = await uploadFile(file);
                        const url = getFileUrl(res.$id);
                        uploadedUrls.push(url);
                      } catch (err) {
                        console.error("Upload failed:", err);
                      }
                    }
                    setForm((prev) => ({
                      ...prev,
                      images: [...prev.images, ...uploadedUrls],
                    }));
                  }}
                  disabled={!ready}
                />

                {/* Preview thumbnails */}
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {form.images.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`preview-${idx}`}
                      style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 4 }}
                    />
                  ))}
                </Stack>              
              </>


              <Stack spacing={1} direction="row">
                <Button
                  variant="contained"
                  onClick={() => {
                    onSave(commodity._id!, form);
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
