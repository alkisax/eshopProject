// src/components/admin/categories/SetParentDialog.tsx
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Autocomplete, TextField } from "@mui/material";
import { useContext, useState } from "react";
import { VariablesContext } from "../../../context/VariablesContext";
interface Props {
  open: boolean;
  childId: string;
  onClose: () => void;
  onSet: (parentId: string) => Promise<void>;
}

const SetParentDialog = ({ open, childId, onClose, onSet }: Props) => {
  const { categories } = useContext(VariablesContext);
  const [parentId, setParentId] = useState<string | null>(null);

  // Exclude self from candidates
  const categoriesExclSelf = categories
    .filter(c => c._id !== childId)
    .map(c => ({ id: c._id as string, label: c.name as string }));


  return (
    // dialog floats over rest page
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Set Parent Category</DialogTitle>
      {/* main dialog area */}
      <DialogContent>
        <Autocomplete
          options={categoriesExclSelf} // ← εδω του λέω τι να κανει render
          // When user selects an option from the dropdown, store its id in my state
          onChange={(_event, value) => setParentId(value?.id ?? null)}
          // ⛔ Autocomplete χρειάζεται πάντα ένα renderInput για να ξέρει ποιο input field θα εμφανίσει (εδώ ένα TextField με label "Parent")
          renderInput={(params) => <TextField {...params} label="Parent" />}
        />
      </DialogContent>
      {/* dialog footer */}
      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={!parentId}
          onClick={async () => {
            if (!parentId) return;
            // Καλεί τη συνάρτηση onSet που σου έδωσε ο γονιός. Εκεί μέσα (στον γονιό) υπάρχει το handleSetParent, που κάνει axios.post(...) για να συνδέσει το παιδί με τον γονέα στη βάση
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
