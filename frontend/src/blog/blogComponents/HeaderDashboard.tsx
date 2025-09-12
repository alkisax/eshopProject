/*
  5️⃣.
  - εδώ βρίσκονται οι διάφορες λειτουργείες και κουμπιά για την δημιουγεία/edit ένως νέου η παλιού post
  - δεν έχει ούτε λογική ούτε state μέσα του όλα τα state setters functions τα παίρνει απο το dashboard
  - μέσα του κάνει render το dropdown του CustomPageCreatorComponent
  - Μετά δες: CustomPageCreatorComponent.tsx → create/manage subpages.
*/
import type { EditorJsContent, SubPageType } from "../blogTypes/blogTypes";
import type EditorJS from "@editorjs/editorjs"; // ✅ class type
import CustomPageCreatorComponent from './CustomPageCreatorComponent';
import { Button, Checkbox, Divider, FormControlLabel, Paper, Stack, Typography } from "@mui/material";

interface Props {
  navigateToPosts: () => void;
  setEditorJsData: (data: EditorJsContent | null) => void;
  editorRef: React.RefObject<EditorJS | null>;
  handlePreview: (
    editorRef: React.RefObject<EditorJS | null>,
    setEditorJsData: (data: EditorJsContent | null) => void
  ) => Promise<void>;
  handleSubmit: (
    editorRef: React.RefObject<EditorJS | null>,
    setEditorJsData: (data: EditorJsContent | null) => void,
    isEditMode: boolean,
    id: string | undefined,
    backEndUrl: string | undefined,
    selectedPage: string,
    isPinned: boolean
  ) => Promise<void>;

  // 🔽 FIXED: simplified signatures
  handlePageSelect: (pageId: string) => void;
  handleNewPageSubmit: (newPage: string) => void;

  backEndUrl?: string;
  isEditMode: boolean;
  id?: string;

  pages: SubPageType[];
  // setPages: React.Dispatch<React.SetStateAction<SubPageType[]>>;
  selectedPage: string;
  // setSelectedPage: React.Dispatch<React.SetStateAction<string>>;
  newPage: string;
  setNewPage: React.Dispatch<React.SetStateAction<string>>;
  isPinned: boolean;
  setIsPinned: (val: boolean) => void;
}

const HeaderDashboard = ({
  navigateToPosts,
  editorRef,
  setEditorJsData,
  handlePreview,
  handleSubmit,
  isEditMode,
  id,
  backEndUrl,
  selectedPage,
  isPinned,
  setIsPinned,
  handlePageSelect,
  handleNewPageSubmit,
  pages,
  // setPages,
  newPage,
  setNewPage,
  // setSelectedPage,
}: Props) => {

  return (
    <Paper
      elevation={1}
      sx={{
        bgcolor: "blue.50",
        color: "blue.900",
        p: 2,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        width: "100%",
        overflow: "hidden",
      }}
    >
      {/* Posts button */}
      <Button
        variant="contained"
        color="primary"
        size="small"
        onClick={navigateToPosts}
      >
        Posts
      </Button>

      <Divider />

      {/* Section: Post */}
      <Typography variant="subtitle2" fontWeight="bold">
        Post:
      </Typography>

      <CustomPageCreatorComponent
        handlePageSelect={handlePageSelect}   // ✅ just pass it
        selectedPage={selectedPage}
        pages={pages}
        newPage={newPage}
        setNewPage={setNewPage}
        handleNewPageSubmit={handleNewPageSubmit} // ✅ just pass it
      />


      {/* Action buttons */}
      <Stack direction="column" spacing={1}>
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={() => handlePreview(editorRef, setEditorJsData)}
        >
          Preview
        </Button>
        <Button
          variant="contained"
          color="secondary"
          size="small"
          onClick={() =>
            handleSubmit(
              editorRef,
              setEditorJsData,
              isEditMode,
              id,
              backEndUrl,
              selectedPage,
              isPinned
            )
          }
        >
          Submit
        </Button>
      </Stack>

      {/* Pinned checkbox */}
      <FormControlLabel
        control={
          <Checkbox
            checked={isPinned}
            onChange={(e) => setIsPinned(e.target.checked)}
            size="small"
          />
        }
        label="Pinned Post"
      />

      <Divider />

      {/* Testing text */}
      <Typography variant="subtitle2" fontWeight="bold">
        Testing text
      </Typography>
      <Typography variant="body2" color="text.secondary">
        !Lorem ipsum dolor, sit amet consectetur adipisicing elit. Commodi minus
        illum nisi est? At quisquam id nulla molestias delectus, rerum quas
        provident illo corrupti dolor minus, sint vero obcaecati incidunt?
      </Typography>
    </Paper>
  );
};

export default HeaderDashboard;