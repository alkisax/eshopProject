/*
 1️⃣.
 entry point για την λειτουργεία blog με rich text. Ξεκινάμε απο εδώ
  → useInitEditor
 - φυλάει το βασικό μου state
 */

import { Button, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
// import {  useState, useRef } from "react";
// import type EditorJS from "@editorjs/editorjs";

// import Dashboard from "./Dashboard";
// import type { EditorJsContent } from "../blogTypes/blogTypes";

const BlogHome = () => {
  // χρειάζομαι μια μεταβλητή για να φορτωσω το Instance απο τον κειμενογράφο
  // useRef is a React Hook that gives you a mutable object whose .current property persists across renders. useRef(initialValue) returns { current: initialValue }. Unlike useState, updating .current does not trigger a re-render
  // το editorRef.current = new EditorJS γίνετε στο useInitEditor και του βάζουμε μέσα όλον τον Editor. Εδώ απλως φτιάχνουμε το "κουτί" αναμονής
  // const editorRef = useRef<EditorJS | null>(null);
  // const [editorJsData, setEditorJsData] = useState<EditorJsContent | null>(null);

  const navigate = useNavigate();

  return (
    <>
      <Stack
        direction="column"
        spacing={2}
        alignItems="center"
        sx={{ width: "100%" }}
      >
        {/* Νέα */}
        <Button
          id="news-btn"
          variant="contained"
          size="large"
          onClick={() => navigate("/news")}
          sx={{
            px: 5,
            py: 2,
            fontWeight: "bold",
            fontSize: "1.1rem",
            borderRadius: 3,
            color: "white",
            width: "100%",
            maxWidth: 280,
            backgroundImage: `url("https://cloud.appwrite.io/v1/storage/buckets/68a01b0400291ae356ca/files/68c9572500153c4aa090/view?project=6898d8be0020602b146e")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            boxShadow: "0 6px 12px rgba(0,0,0,0.25)",
            "&:hover": {
              opacity: 0.9,
              boxShadow: "0 8px 16px rgba(0,0,0,0.35)",
            },
          }}
        >
          Νεα
        </Button>

        {/* Ανακοινώσεις */}
        <Button
          id="announcements-btn"
          variant="contained"
          size="large"
          onClick={() => navigate("/announcements")}
          sx={{
            px: 5,
            py: 2,
            fontWeight: "bold",
            fontSize: "1.1rem",
            borderRadius: 3,
            color: "white",
            width: "100%",
            maxWidth: 280,
            backgroundImage: `url("https://cloud.appwrite.io/v1/storage/buckets/68a01b0400291ae356ca/files/68c9572b002dab2a4856/view?project=6898d8be0020602b146e")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            boxShadow: "0 6px 12px rgba(0,0,0,0.25)",
            "&:hover": {
              opacity: 0.9,
              boxShadow: "0 8px 16px rgba(0,0,0,0.35)",
            },
          }}
        >
          Ανακοινωσεις
        </Button>
      </Stack>

      {/* temporary TO BE REMOVED */}
      {/* <Dashboard 
        editorJsData={editorJsData} 
        setEditorJsData={setEditorJsData}
        editorRef={editorRef}
      /> */}
    </>
  )
}

export default BlogHome