/*
  6️⃣.
  - δεν έχει λογική όλα έρχονται απο ένα ταιράστιο props απο το dashboard και τα editorHelpers. εδώ κάνει μόνο render το dropdown της επιλογής υποσελίδας
  ✅ εδώ τελειώνει η λογική του dashboard
  ⏩ Δες μετά τα frontend\src\blog\blogComponents\RenderedEditorJsContent.tsx και frontend\src\blog\blogPages\BlogPost.tsx που είναι υπεύθηνα για την προβολη ένώς μόνο ποστ και frontend\src\blog\blogPages\News.tsx και frontend\src\blog\blogPages\Announcements.tsx που είναι υπευθεινα για την προβολή της λίστας των ποστς
*/

import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import type { SubPageType } from "../blogTypes/blogTypes";

interface Props {
  handlePageSelect: (pageId: string) => void;
  selectedPage: string;
  pages: SubPageType[];
  newPage: string;
  setNewPage: React.Dispatch<React.SetStateAction<string>>;
  handleNewPageSubmit: (newPage: string) => void;
}

const CustomPageCreatorComponent = ({
  handlePageSelect,
  selectedPage,
  pages,
  newPage,
  setNewPage,
  handleNewPageSubmit,
}: Props) => {


console.log("Select value =", selectedPage);
console.log("Pages =", pages.map(p => p._id));

  return (
    <Box sx={{ width: "100%", maxWidth: 400, mx: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Dropdown για επιλογή σελίδας */}
      <FormControl fullWidth size="small">
        <InputLabel id="page-select-label">Select a page</InputLabel>
        <Select
          labelId="page-select-label"
          value={selectedPage}
          onChange={(e) => handlePageSelect(e.target.value)}
          label="Select a page"
        >
          <MenuItem value="" disabled>
            <em>Select a page</em>
          </MenuItem>
          {pages.map((p) => (
            <MenuItem key={p._id} value={p._id}>
              {p.name}
            </MenuItem>
          ))}
          <MenuItem value="__new__">+ Create new page</MenuItem>
        </Select>
      </FormControl>

      {/* Αν είναι new page input */}
      {selectedPage === "__new__" && (
        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            label="New page name"
            value={newPage}
            onChange={(e) => setNewPage(e.target.value)}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleNewPageSubmit(newPage)}
          >
            Create
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default CustomPageCreatorComponent;
