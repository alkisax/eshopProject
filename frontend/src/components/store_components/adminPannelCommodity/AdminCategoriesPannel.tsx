// src/components/admin/categories/AdminCategoriesPanel.tsx
import { useContext, useState } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  IconButton,
  Chip,
  Stack,
  Switch,
  Tooltip,
} from "@mui/material";
// import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
// import AccountTreeIcon from "@mui/icons-material/AccountTree";
import CallSplitIcon from "@mui/icons-material/CallSplit";
import AddBoxIcon from "@mui/icons-material/AddBox";
import EscalatorWarningTwoToneIcon from "@mui/icons-material/EscalatorWarningTwoTone";
import { VariablesContext } from "../../../context/VariablesContext";
import { UserAuthContext } from "../../../context/UserAuthContext";
import type { CategoryType } from "../../../types/commerce.types";
// import AdminCategoryFooter from "./AdminCategoryFooter";
import SetParentDialog from "./SetParentDialog";
import AddCategoryDialog from "./AddCategoryDialog";

const AdminCategoriesPanel = () => {
  const { url, categories, refreshCategories } = useContext(VariablesContext);
  const { setIsLoading } = useContext(UserAuthContext);

  // const [expanded, setExpanded] = useState<string | null>(null);
  // το state αυτό δεν είναι ένα απλό boolean, φυλάει και το id αν είναι θετικό
  const [openSetParent, setOpenSetParent] = useState<null | {
    childId: string;
  }>(null);
  const [openAdd, setOpenAdd] = useState<boolean>(false);

  //unused vars
  // console.log(expanded);

  // children names via ids
  const childNames = (c: CategoryType): string[] => {
    if (!c.children || c.children.length === 0) return [];
    return (
      c.children
        .map((id) => categories.find((category) => category._id === id)?.name)
        // cleans the array to only include valid names
        .filter(Boolean) as string[]
    );
  };

  const parentName = (c: CategoryType): string | null => {
    if (!c.parent || typeof c.parent !== "object") return null;
    return c.parent.name ?? null;
  };

  const toggleFlag = async (
    c: CategoryType,
    field: "active" | "isTag",
    value: boolean
  ) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      // το field απο τα params. κάνει toggle δυο πραγματα
      await axios.patch(
        `${url}/api/category/${c._id}`,
        { [field]: value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await refreshCategories();
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveParent = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${url}/api/category/${id}/remove-parent`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await refreshCategories();
    } catch (err) {
      console.error("Error removing parent:", err);
    }
  };

  const handleSetParent = async (parentId: string) => {
    if (!openSetParent) return;
    const token = localStorage.getItem("token");
    await axios.post(
      `${url}/api/category/make-parent`,
      { parentId, childId: openSetParent.childId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    await refreshCategories();
    setOpenSetParent(null);
  };

  const handleAddCategory = async (payload: Partial<CategoryType>) => {
    const token = localStorage.getItem("token");
    await axios.post(`${url}/api/category`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    await refreshCategories();
    setOpenAdd(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      await axios.delete(`${url}/api/category/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await refreshCategories();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* το κουμπί για δημιουργία νεου επάνω δεξια. Αν το state openAdd αλλάξει ανοίγει αναδιώμενο παράθυρο */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography variant="h5">Categories</Typography>
        {/* startIcon={<AddBoxIcon />} → Render this icon to the left of the button text, */}
        <Button
          variant="contained"
          startIcon={<AddBoxIcon />}
          onClick={() => setOpenAdd(true)}
        >
          Add Category
        </Button>
      </Stack>

      {/* πρωτα ανοίγουμε TableContainer μέσα του table. Μέσα στο table TableHead και TableBody */}
      {/* component={Paper} → instead of rendering as <div>…</div>, render as a <Paper>…</Paper> */}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {/* Always visible */}
              <TableCell>Name / Slug & Actions</TableCell>
              {/* Hidden on small → display: { xs: "none", md: "table-cell" } */}
              <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                Parent
              </TableCell>
              <TableCell sx={{ display: { xs: "none", lg: "table-cell" } }}>
                Children
              </TableCell>
              <TableCell
                align="center"
                sx={{ display: { xs: "none", md: "table-cell" } }}
              >
                Active
              </TableCell>
              <TableCell
                align="center"
                sx={{ display: { xs: "none", md: "table-cell" } }}
              >
                Tag
              </TableCell>
            </TableRow>
          </TableHead>

          {/* ο κυρίως πίνακας στον οποίο θα κάνουμε map τις κατηγορίες */}
          <TableBody>
            {categories.map((c) => {
              // διαφορες ιδιότητες της κάθε κατηγορίας μες στο map
              const id = c._id as string;
              const parent = parentName(c);
              const children = childNames(c);

              // Το "return" εδώ δεν είναι νέο return της συνάρτησης component, αλλά το return του callback της .map(). Κάθε τέτοιο return αποδίδει ένα <TableRow> για την τρέχουσα κατηγορία.
              return (
                // το hover μου κάνει γκρι την γραμμή
                <TableRow key={id} hover>
                  {/* === Always visible on all screens === */}
                  {/* το πρώτο και κύριο κελί με τα κουμπιά δράσης και το όνομα */}
                  <TableCell sx={{ verticalAlign: "top" }}>
                    <Stack spacing={0.75}>
                      {/* Name + slug */}
                      <Stack spacing={0.25}>
                        <Typography fontWeight={600} noWrap>
                          {c.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          noWrap
                        >
                          {c.slug}
                        </Typography>
                      </Stack>

                      {/* Actions inline for small screens */}
                      <Stack
                        direction="row"
                        spacing={0.5}
                        flexWrap="wrap"
                        useFlexGap
                      >
                        {/* το tooltip μου δείχνει το ενημερωτικό popup label */}

                        <Tooltip title="Set parent">
                          {/* αλλάζει το state του openSetParent και κάνει trigger το άνοιγμα του σχετικού παραθύρου (παρακάτω) */}
                          <IconButton
                            size="small"
                            onClick={() => setOpenSetParent({ childId: id })}
                          >
                            <EscalatorWarningTwoToneIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Remove parent">
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveParent(id)}
                          >
                            <CallSplitIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Stack>
                  </TableCell>

                  {/* === Hidden on small, shown on bigger screens === */}
                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                    {parent ? (
                      <Chip label={parent} size="small" />
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        —
                      </Typography>
                    )}
                  </TableCell>

                  {/* αυτό είναι το μόνο που έχει display: lg (όλα τα άλλα έχουν md) με αποτέλεσμα να κρίβετε και στις μεσαίες οθόνες */}
                  <TableCell sx={{ display: { xs: "none", lg: "table-cell" } }}>
                    {children.length > 0 ? (
                      children.map((n) => (
                        <Chip key={n} label={n} size="small" />
                      ))
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        —
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                    <Switch
                      size="small"
                      checked={c.active ?? true}
                      onChange={(_e, checked) =>
                        toggleFlag(c, "active", checked)
                      }
                    />
                  </TableCell>

                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                    <Switch
                      size="small"
                      checked={!!c.isTag}
                      onChange={(_e, checked) =>
                        toggleFlag(c, "isTag", checked)
                      }
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* dialogs */}
      {/* μεταφερθηκαν σε δικό τους component */}
      {openSetParent && (
        <SetParentDialog
          // διαφορα Props
          open
          childId={openSetParent.childId}
          onClose={() => setOpenSetParent(null)}
          // Νεο η onSet χρησιμοποιείτε εδώ για να μεταφέρω το state απο το παιδί στον πατέρα
          onSet={handleSetParent}
        />
      )}

      {openAdd && (
        <AddCategoryDialog
          open
          onClose={() => setOpenAdd(false)}
          onCreate={handleAddCategory}
        />
      )}

      {/* ===================== ADMIN CATEGORIES PANEL – INSTRUCTIONS ===================== */}
      <Paper
        sx={{ p: 2, mt: 4, backgroundColor: "#f7f7f7" }}
        variant="outlined"
      >
        <Typography variant="h6" sx={{ mb: 1 }}>
          Instructions – Category Management
        </Typography>

        <Typography variant="body2" sx={{ mb: 1 }}>
          • This panel manages the full category tree of the e-shop. Categories
          may have parents, children, or function as standalone tags.
        </Typography>

        <Typography variant="body2" sx={{ mb: 1 }}>
          • <b>Add Category</b>: Opens a dialog where you define name, slug and
          flags. New categories are added globally and become immediately
          available for all commodities.
        </Typography>

        <Typography variant="body2" sx={{ mb: 1 }}>
          • <b>Set Parent</b>: Assigns a parent category to the selected one.
          This creates a hierarchical structure (parent → children).
        </Typography>

        <Typography variant="body2" sx={{ mb: 1 }}>
          • <b>Remove Parent</b>: Detaches the category from its current parent,
          returning it to root level.
        </Typography>

        <Typography variant="body2" sx={{ mb: 1 }}>
          • <b>Active</b>: Controls whether the category is visible and usable
          in the front-end filtering system.
        </Typography>

        <Typography variant="body2" sx={{ mb: 1 }}>
          • <b>Tag</b>: When enabled, the category acts as a lightweight tag.
          Useful for grouping commodities without strict hierarchy.
        </Typography>

        <Typography variant="body2" sx={{ mb: 1 }}>
          • <b>Children</b>: Displays all categories that list the current one
          as their parent. These relationships are updated automatically when
          setting or removing parents.
        </Typography>

        <Typography variant="body2">
          • <b>Delete Category</b>: Removes the category from the system. Use
          with caution — commodities referencing this category will keep the
          text name but will no longer link to a valid category entry.
        </Typography>
      </Paper>
    </div>
  );
};

export default AdminCategoriesPanel;
