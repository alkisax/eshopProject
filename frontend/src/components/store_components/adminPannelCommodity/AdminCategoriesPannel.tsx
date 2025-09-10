// src/components/admin/categories/AdminCategoriesPanel.tsx
import { useContext, useMemo, useState } from "react";
import axios from "axios";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Typography, IconButton, Chip, Stack, Switch, Tooltip,
  Box
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import CallSplitIcon from "@mui/icons-material/CallSplit";
import AddBoxIcon from "@mui/icons-material/AddBox";
import { VariablesContext } from "../../../context/VariablesContext";
import { UserAuthContext } from "../../../context/UserAuthContext";
import type { CategoryType } from "../../../types/commerce.types";
import AdminCategoryFooter from "./AdminCategoryFooter";
import SetParentDialog from "./SetParentDialog";
import AddCategoryDialog from "./AddCategoryDialog";

const AdminCategoriesPanel = () => {
  const { url, categories, refreshCategories } = useContext(VariablesContext);
  const { setIsLoading } = useContext(UserAuthContext);

  const [expanded, setExpanded] = useState<string | null>(null);
  const [openSetParent, setOpenSetParent] = useState<null | { childId: string }>(null);
  const [openAdd, setOpenAdd] = useState(false);

  // id -> category
  // το useMemo είναι ένα state που διατηρείτε στα refresh, έχει ένα [] που κάνει trigger την ανανεωσή του 
  const byId = useMemo(() => {
    // το map μας φτιάχνει έναν index πίνακα για να γλυτώσουμε τον χρόνο απο διαρκείς αναζητήσεις. Πρώτα κάνω instansiate το obj 
    const map = new Map<string, CategoryType>();
    // ένας χάρτης με κλειδί το id και τιμή το περιεχόμενο
    for (const c of categories) map.set(c._id as string, c);
    return map;
  }, [categories]);

  // children names via ids (children is ObjectId[])
  const childNames = (c: CategoryType) => {
    if (!c.children || c.children.length === 0) return [];
    return c.children
      .map((id) => byId.get(id as string)?.name)
      .filter(Boolean) as string[];
  };

  const toggleFlag = async (c: CategoryType, field: "active" | "isTag", value: boolean) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
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

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      await axios.delete(`${url}/api/category/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await refreshCategories();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Categories</Typography>
        <Button
          variant="contained"
          startIcon={<AddBoxIcon />}
          onClick={() => setOpenAdd(true)}
        >
          Add Category
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name / Slug & Actions</TableCell>
              <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                Parent
              </TableCell>
              <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                Children
              </TableCell>
              <TableCell align="center">Active</TableCell>
              <TableCell align="center">Tag</TableCell>
              <TableCell align="right" sx={{ display: { xs: "none", sm: "table-cell" } }}>
                Order
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {categories.map((c) => {
              const id = c._id as string;
              const parentName = c.parent ? byId.get(c.parent as string)?.name : null;
              const children = childNames(c);

              // limit chips for compactness
              const MAX_CHIPS = 3;
              const visibleChildren = children.slice(0, MAX_CHIPS);
              const extraCount = Math.max(children.length - visibleChildren.length, 0);

              return (
                <TableRow key={id} hover>
                  {/* NAME / SLUG + ACTIONS (stacked) */}
                  <TableCell sx={{ verticalAlign: "top" }}>
                    <Stack spacing={0.75}>
                      <Stack spacing={0.25}>
                        <Typography fontWeight={600} noWrap>
                          {c.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {c.slug}
                        </Typography>
                      </Stack>

                      {/* Actions below each item */}
                      <Stack
                        direction="row"
                        spacing={0.5}
                        flexWrap="wrap"
                        useFlexGap
                        sx={{ mt: 0.5 }}
                      >
                        <Tooltip title="Edit">
                          <IconButton size="small" color="primary" onClick={() => setExpanded(id)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Set parent">
                          <IconButton size="small" onClick={() => setOpenSetParent({ childId: id })}>
                            <AccountTreeIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Remove parent">
                          <IconButton
                            size="small"
                            onClick={async () => {
                              const token = localStorage.getItem("token");
                              await axios.put(
                                `${url}/api/category/${id}/remove-parent`,
                                {},
                                { headers: { Authorization: `Bearer ${token}` } }
                              );
                              await refreshCategories();
                            }}
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

                      {/* inline footer/editor when expanded */}
                      {expanded === id && (
                        <Box sx={{ mt: 1 }}>
                          <AdminCategoryFooter
                            category={c}
                            close={() => setExpanded(null)}
                            onSaved={async () => {
                              await refreshCategories();
                              setExpanded(null);
                            }}
                          />
                        </Box>
                      )}
                    </Stack>
                  </TableCell>

                  {/* PARENT (hidden on xs) */}
                  <TableCell sx={{ display: { xs: "none", sm: "table-cell" }, verticalAlign: "top" }}>
                    {parentName ? (
                      <Chip label={parentName} size="small" />
                    ) : (
                      <Typography variant="caption" color="text.secondary">—</Typography>
                    )}
                  </TableCell>

                  {/* CHILDREN (hidden on <md) */}
                  <TableCell sx={{ display: { xs: "none", md: "table-cell" }, verticalAlign: "top" }}>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                      {visibleChildren.length ? (
                        <>
                          {visibleChildren.map((n) => (
                            <Chip key={n} label={n} size="small" />
                          ))}
                          {extraCount > 0 && (
                            <Tooltip title={children.slice(MAX_CHIPS).join(", ")}>
                              <Chip label={`+${extraCount}`} size="small" variant="outlined" />
                            </Tooltip>
                          )}
                        </>
                      ) : (
                        <Typography variant="caption" color="text.secondary">—</Typography>
                      )}
                    </Stack>
                  </TableCell>

                  {/* ACTIVE */}
                  <TableCell align="center" sx={{ verticalAlign: "top" }}>
                    <Tooltip title="Toggle active">
                      <Switch
                        size="small"
                        checked={c.active ?? true}
                        onChange={(_e, checked) => toggleFlag(c, "active", checked)}
                      />
                    </Tooltip>
                  </TableCell>

                  {/* TAG */}
                  <TableCell align="center" sx={{ verticalAlign: "top" }}>
                    <Tooltip title="Toggle tag">
                      <Switch
                        size="small"
                        checked={!!c.isTag}
                        onChange={(_e, checked) => toggleFlag(c, "isTag", checked)}
                      />
                    </Tooltip>
                  </TableCell>

                  {/* ORDER (hidden on xs) */}
                  <TableCell align="right" sx={{ display: { xs: "none", sm: "table-cell" }, verticalAlign: "top" }}>
                    {c.order ?? 0}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>


      {/* dialogs */}
      {openSetParent && (
        <SetParentDialog
          open
          childId={openSetParent.childId}
          categories={categories}
          onClose={() => setOpenSetParent(null)}
          onSet={async (parentId) => {
            const token = localStorage.getItem("token");
            await axios.post(
              `${url}/api/category/make-parent`,
              { parentId, childId: openSetParent.childId },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            await refreshCategories();
            setOpenSetParent(null);
          }}
        />
      )}

      {openAdd && (
        <AddCategoryDialog
          open
          onClose={() => setOpenAdd(false)}
          onCreate={async (payload) => {
            const token = localStorage.getItem("token");
            await axios.post(`${url}/api/category`, payload, {
              headers: { Authorization: `Bearer ${token}` }
            });
            await refreshCategories();
            setOpenAdd(false);
          }}
        />
      )}
    </div>
  );
};

export default AdminCategoriesPanel;
