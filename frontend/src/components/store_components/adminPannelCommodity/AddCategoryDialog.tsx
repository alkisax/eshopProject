// src/components/admin/categories/AddCategoryDialog.tsx
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack } from "@mui/material";
import { useState } from "react";
import { slugify } from "../../../utils/slugify";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: { name: string; slug: string; description?: string }) => Promise<void>;
}

const AddCategoryDialog = ({ open, onClose, onCreate }: Props) => {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  const submit = async () => {
    const payload = {
      name: name.trim(),
      slug: slug.trim() || slugify(name),
      description: description.trim() || undefined,
    };
    await onCreate(payload);
    setName(""); setSlug(""); setDescription("");
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Category</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <TextField label="Slug (optional)" value={slug} onChange={(e) => setSlug(e.target.value)} />
          <TextField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} multiline />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" disabled={!name.trim()} onClick={submit}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddCategoryDialog;
