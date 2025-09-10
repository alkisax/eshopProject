// src/components/admin/categories/SetParentDialog.tsx
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Autocomplete, TextField } from "@mui/material";
import { useMemo, useState } from "react";
import type { CategoryType } from "../../../types/commerce.types";

interface Props {
  open: boolean;
  childId: string;
  categories: CategoryType[];
  onClose: () => void;
  onSet: (parentId: string) => Promise<void>;
}

const SetParentDialog = ({ open, childId, categories, onClose, onSet }: Props) => {
  const [parentId, setParentId] = useState<string | null>(null);

  // Exclude self from candidates; optionally also exclude current children if you want basic cycle safety
  const options = useMemo(() => {
    return categories
      .filter(c => c._id !== childId)
      .map(c => ({ id: c._id as string, label: c.name as string }));
  }, [categories, childId]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Set Parent Category</DialogTitle>
      <DialogContent>
        <Autocomplete
          options={options}
          onChange={(_e, v) => setParentId(v?.id ?? null)}
          renderInput={(params) => <TextField {...params} label="Parent" />}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={!parentId}
          onClick={async () => {
            if (!parentId) return;
            await onSet(parentId);
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SetParentDialog;
