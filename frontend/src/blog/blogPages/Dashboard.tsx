/*
  3️⃣.
  - το βασικό dashboard για δημιουργία νέων Posts αργότερα θα μεταφερθεί στο AdminDashboard της συνολικής εφαρμογής
   - η βασική του δουλειά είναι να κάνει render το admin sidebar και τον Editor και να φυλάει και να διαμοιράζει το state που χρησιμοποιούν αυτά τα δύο
   - εισαγάγει όλες τις function απο τον editorHelper
   - επειδεί οι παράμετροι που παιρνάει στο header και editor είναι παρα πολλές έχει ένα μεγάλο επεξηγηματικό σχόλιο
   - Πρώτα δες frontend\src\blog\blogUtils\editorHelper.ts με τις function του και μετα
   - Μετά δες EditorJs.tsx → wrapper around EditorJS that loads/saves content.
*/

import { useNavigate, useParams } from "react-router-dom";
import { useContext, useState } from "react";
import Editor from "../blogUtils/Editor";
import HeaderDashboard from "../blogComponents/HeaderDashboard";
import { handlePreview, handleSubmit, handlePageSelect, handleNewPageSubmit } from "../blogUtils/editorHelper";
import type { EditorJsContent, SubPageType } from "../blogTypes/blogTypes";
import type EditorJS from "@editorjs/editorjs"; // ✅ class type
import { AppBar, Box, Paper, Toolbar } from "@mui/material";
import { VariablesContext } from "../../context/VariablesContext";
interface Props {
  editorJsData: EditorJsContent | null;
  setEditorJsData: (data: EditorJsContent | null) => void;
  editorRef: React.RefObject<EditorJS | null>;
  isEditMode?: boolean;
}

function Dashboard({
  editorJsData,
  setEditorJsData,
  editorRef,
  isEditMode = false,
}: Props) {
  
  const { url } = useContext(VariablesContext);
  // Προσθήκη λογικής για custom pages
  const [pages, setPages] = useState<SubPageType[]>([]);
  const [selectedPage, setSelectedPage] = useState<string>('');
  const [newPage, setNewPage] = useState<string>('');
  const [isPinned, setIsPinned] = useState<boolean>(false);

  const { id } = useParams();
  
  const navigate = useNavigate()

  const navigateToPosts = () => {
    navigate("/posts")
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Header */}
      <AppBar
        position="static"
        color="default"
        sx={{
          boxShadow: 1,
          borderBottom: "1px solid #ddd",
        }}
      >
{/* 
===ΤΙ ΠΕΡΝΑΜΕ ΣΤΟ HeaderDashboard===
👉 State που έρχεται από το Dashboard (πατέρας):
- pages: όλες οι διαθέσιμες σελίδες (SubPages).
- newPage: το όνομα που πληκτρολογεί ο admin όταν θέλει να φτιάξει νέα σελίδα.
- setNewPage: setter για το παραπάνω.
- selectedPage: ποια σελίδα είναι επιλεγμένη τώρα.
- isPinned: αν το post θα είναι "καρφιτσωμένο".
- setIsPinned: setter για το pinned state.
- isEditMode: flag αν επεξεργαζόμαστε παλιό post ή δημιουργούμε νέο.
- id: το id του post όταν είμαστε σε edit mode.
👉 Helpers / functions:
- navigateToPosts: κουμπί για να πάει στη σελίδα "/posts".
- setEditorJsData: setter για να κρατάμε τα δεδομένα του EditorJS στο state.
- editorRef: ref instance του EditorJS (για να καλέσουμε .save()).
- handlePreview: helper που σώζει προσωρινά το περιεχόμενο για preview.
- handleSubmit: helper που αποθηκεύει ή ενημερώνει το post στο backend.
- handlePageSelect: επιλογή subPage (με wrapper για να συνδεθεί με το state).
- handleNewPageSubmit: δημιουργία νέας subPage (με wrapper για να περάσει backendUrl, setters κλπ).
====ΓΙΑΤΙ ΧΡΕΙΑΖΟΝΤΑΙ ΤΑ WRAPPERS ===
Οι functions από το editorHelper.ts έχουν πιο "βαριά" signature:
- handlePageSelect(pageId, setSelectedPage)
- handleNewPageSubmit(newPage, backEndUrl, setPages, setSelectedPage, setNewPage)
- handleSubmit(editorRef, setEditorJsData, isEditMode, id, backEndUrl, selectedPage, isPinned)
Όμως το HeaderDashboard (και το CustomPageCreatorComponent μέσα του) περιμένουν απλές functions:
- handlePageSelect: (pageId: string) => void
- handleNewPageSubmit: (newPage: string) => void
- handleSubmit: (...) => void με backEndUrl ήδη λυμένο.
Γι’ αυτό εδώ τυλίγουμε τις helpers με inline arrow functions ώστε:
- Να τους δώσουμε ήδη τους extra setters/backEndUrl που χρειάζονται.
- Να τις απλοποιήσουμε σε πιο καθαρές signatures, όπως περιμένουν τα child components.

Έτσι κρατάμε το HeaderDashboard "χαζό" (stateless, απλό), 
ενώ όλη η λογική και το state management μένουν στο Dashboard.
*/}
        <Toolbar sx={{ gap: 2, overflowX: "auto" }}>

          <HeaderDashboard
            pages={pages}
            newPage={newPage}
            setNewPage={setNewPage}
            navigateToPosts={navigateToPosts}
            setEditorJsData={setEditorJsData}
            editorRef={editorRef}
            handlePreview={handlePreview}
            selectedPage={selectedPage}
            isPinned={isPinned}
            setIsPinned={setIsPinned}
            isEditMode={isEditMode}
            id={id}
            handlePageSelect={(pageId) => handlePageSelect(pageId, setSelectedPage)} // wrapper: περνάμε μόνο το pageId και συνδέουμε με το setSelectedPage
            handleNewPageSubmit={(newPage) =>
              handleNewPageSubmit(newPage, url, setPages, setSelectedPage, setNewPage)
            } // wrapper: περνάμε μόνο newPage από το child, και εδώ προσθέτουμε backendUrl + setters
            handleSubmit={(
              ref, setData, isEdit, postId, url, page, pinned
            ) => handleSubmit(ref, setData, isEdit, postId, url ?? "", page, pinned)} // 🔑 ensure url is string
          />
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: "100%",
        }}
      >
        {/* 
=== ΤΙ ΠΕΡΝΑΜΕ ΣΤΟ <Editor> ===

👉 Props από το Dashboard (state + setters):
- id: αν υπάρχει, τότε είμαστε σε edit mode για συγκεκριμένο post.
- editorJsData: το τρέχον περιεχόμενο του EditorJS (όπως σώθηκε τελευταία φορά).
- setEditorJsData: setter για να ενημερώνεται το state με το νέο outputData.
- editorRef: το Ref instance του EditorJS (για να μπορούμε να καλέσουμε editorRef.current.save()).
- setIsPinned: setter για το αν είναι "καρφιτσωμένο" το post.
- pages: λίστα από SubPages (categories/sections) που ανήκουν τα posts.
- setPages: setter για να ενημερώνεται η λίστα των SubPages όταν δημιουργούμε ή αλλάζουμε.
- selectedPage: ποια SubPage είναι επιλεγμένη αυτή τη στιγμή για το post.
- setSelectedPage: setter για την επιλογή subPage.
- isEditMode: flag που λέει αν είμαστε σε "δημιουργία νέου" ή "επεξεργασία παλιού".
*/}
        <Paper sx={{ p: 2, minHeight: "80vh" }}>
          <Editor
            id={id}
            editorJsData={editorJsData}
            setEditorJsData={setEditorJsData}
            editorRef={editorRef}
            setIsPinned={setIsPinned}
            pages={pages}
            setPages={setPages}
            selectedPage={selectedPage}
            setSelectedPage={setSelectedPage}
            isEditMode={isEditMode}
          />
        </Paper>
      </Box>
    </Box>
  );
}

export default Dashboard;
