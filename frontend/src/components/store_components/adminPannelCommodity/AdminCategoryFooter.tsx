// src/components/admin/categories/AdminCategoryFooter.tsx
import { useState } from "react";
import { TableRow, TableCell, Stack, TextField, Button, IconButton, Switch, FormControlLabel } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { CategoryType } from "../../../types/commerce.types";
import axios from "axios";
import { useContext } from "react";
import { VariablesContext } from "../../../context/VariablesContext";
import { slugify } from "../../../utils/slugify";

interface Props {
  category: CategoryType & { _id?: string };
  close: () => void;
  onSaved: () => Promise<void>;
}

const AdminCategoryFooter = ({ category, close, onSaved }: Props) => {
  const { url } = useContext(VariablesContext);
  const [form, setForm] = useState({
    name: category.name || "",
    slug: category.slug || "",
    description: category.description || "",
    image: category.image || "",
    featured: !!category.featured,
    order: category.order ?? 0,
    active: category.active ?? true,
    isTag: !!category.isTag,
  });

  // ts workaround
  type FormValue = string | number | boolean | string[] | null | undefined;
  const handle = (k: string, v: FormValue) => setForm((p) => ({ ...p, [k]: v }));

  const save = async () => {
    const token = localStorage.getItem("token");
    const payload = {
      ...form,
      slug: form.slug?.trim() ? form.slug.trim() : slugify(form.name),
    };
    await axios.patch(
      `${url}/api/category/${category._id}`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    await onSaved();
  };

  return (
    <TableRow>
      <TableCell colSpan={7}>
        <Stack spacing={2} sx={{ p: 1 }}>
          <Stack direction="row" justifyContent="flex-end">
            <IconButton onClick={close}><CloseIcon /></IconButton>
          </Stack>

          <TextField
            label="Name"
            value={form.name}
            onChange={(e) => handle("name", e.target.value)}
            size="small"
          />
          <TextField
            label="Slug"
            helperText="Leave empty to auto-generate from name"
            value={form.slug}
            onChange={(e) => handle("slug", e.target.value)}
            size="small"
          />
          <TextField
            label="Description"
            value={form.description}
            onChange={(e) => handle("description", e.target.value)}
            size="small"
            multiline
          />
          <TextField
            label="Image URL"
            value={form.image}
            onChange={(e) => handle("image", e.target.value)}
            size="small"
          />
          <TextField
            label="Order"
            type="number"
            value={form.order}
            onChange={(e) => handle("order", Number(e.target.value))}
            size="small"
          />

          <FormControlLabel
            control={<Switch checked={form.active} onChange={(_e, v) => handle("active", v)} />}
            label="Active"
          />
          <FormControlLabel
            control={<Switch checked={form.isTag} onChange={(_e, v) => handle("isTag", v)} />}
            label="Is Tag"
          />
          <FormControlLabel
            control={<Switch checked={form.featured} onChange={(_e, v) => handle("featured", v)} />}
            label="Featured"
          />

          <Stack direction="row" spacing={1}>
            <Button variant="contained" onClick={save}>Save</Button>
            <Button variant="outlined" onClick={close}>Cancel</Button>
          </Stack>
        </Stack>
      </TableCell>
    </TableRow>
  );
};

export default AdminCategoryFooter;
