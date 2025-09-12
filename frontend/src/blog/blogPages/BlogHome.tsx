/*
 1️⃣.
 entry point για την λειτουργεία blog με rich text. Ξεκινάμε απο εδώ
  → useInitEditor
 - φυλάει το βασικό μου state
 */

import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import {  useState, useRef } from "react";
import type EditorJS from "@editorjs/editorjs";

import Dashboard from "./Dashboard";
import type { EditorJsContent } from "../blogTypes/blogTypes";

const BlogHome = () => {
  // χρειάζομαι μια μεταβλητή για να φορτωσω το Instance απο τον κειμενογράφο
  // useRef is a React Hook that gives you a mutable object whose .current property persists across renders. useRef(initialValue) returns { current: initialValue }. Unlike useState, updating .current does not trigger a re-render
  // το editorRef.current = new EditorJS γίνετε στο useInitEditor και του βάζουμε μέσα όλον τον Editor. Εδώ απλως φτιάχνουμε το "κουτί" αναμονής
  const editorRef = useRef<EditorJS | null>(null);
  const [editorJsData, setEditorJsData] = useState<EditorJsContent | null>(null);

  const navigate = useNavigate();

  return (
    <>
      <Button
        variant="outlined"
        color="secondary"
        size="large"
        onClick={() => navigate("/news")}
      >
        📰 News
      </Button>
      <Button
        variant="outlined"
        color="secondary"
        size="large"
        onClick={() => navigate("/announcements")}
      >
        📢 Announcements
      </Button>

      {/* temporary TO BE REMOVED */}
      <Dashboard 
        editorJsData={editorJsData} 
        setEditorJsData={setEditorJsData}
        editorRef={editorRef}
      />
    </>
  )
}

export default BlogHome