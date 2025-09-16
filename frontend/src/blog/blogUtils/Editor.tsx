/*
  4️⃣.
  - Το βασικό κουτί που δημιουργούμε το post η αλλάζουμε αλλάζουμε Post που ήδη υπάρχει. 
  - Αν το ποστ υπάρχει παίρνουμε το id του απο τa props και είναι isEditMode true
  - Κάνει render δυο πράγματα τον Editor και το preview του post
  - Μετα δες: frontend\src\blog\blogComponents\HeaderDashboard.tsx → Sidebar controls for creating/editing posts & subpages. 
*/

import { useEffect, useContext } from 'react';
import axios from 'axios';
import RenderedEditorJsContent from '../blogComponents/RenderedEditorJsContent'
import { useInitEditor } from '../blogHooks/useInitEditor';
import type { EditorJsContent, SubPageType } from "../blogTypes/blogTypes";
import { VariablesContext } from "../../context/VariablesContext";
import type EditorJS from "@editorjs/editorjs"; // ✅ class type
import { Box, Paper } from '@mui/material';


interface Props {
  id?: string;  // useParams might give undefined
  editorJsData: EditorJsContent | null;
  setEditorJsData: (data: EditorJsContent | null) => void;
  editorRef: React.RefObject<EditorJS | null>;
  setIsPinned: React.Dispatch<React.SetStateAction<boolean>>;
  pages: SubPageType[];
  setPages: React.Dispatch<React.SetStateAction<SubPageType[]>>;
  selectedPage: string;
  setSelectedPage: React.Dispatch<React.SetStateAction<string>>;
  isEditMode?: boolean;
}

const Editor = ({ 
  id,
  editorJsData,
  setEditorJsData,
  editorRef,
  setIsPinned,
  pages,
  setPages,
  selectedPage,
  setSelectedPage,
  isEditMode=false
}: Props) => {

  const { url } = useContext(VariablesContext);
  // const { id } = useParams();

  // ✅ σε χωριστό custom hook μεταφέρθηκε όλη η παραμετροποίηση του editorJs
  useInitEditor(editorRef);

  // απο εδώ έρχονται τα tags των subpages
  useEffect(() => {
    const getpages = async () => {
      const res = await axios.get(`${url}/api/subPage`);
      setPages(res.data.data);

      // if already have a selectedPage id, make sure it matches after pages load
      if (selectedPage && !res.data.data.some((p: SubPageType) => p._id === selectedPage)) {
        console.warn("Selected page not found in pages list:", selectedPage);
      }
    };
    getpages();
  }, [url, setPages])

  // 🟧 If in edit mode, fetch post and populate editor
  useEffect(() => {
    const fetchPost = async () => {
      if (!isEditMode || !id || !editorRef.current) return;

      try {
        console.log("enter edit mode");
        const res = await axios.get(`${url}/api/posts/${id}`);

        // Normalize the post object once
        const post = (res.data?.data ?? res.data) as {
          content: EditorJsContent | string;
          subPage?: string | { _id?: string };
          pinned?: boolean;
        };

        // Render editor content
        const editor = editorRef.current;
        await editor.isReady;
        await editor.render(
          typeof post.content === "string" ? JSON.parse(post.content) : post.content
        );
        console.log("Loaded post content:", post.content);

        // Set pinned
        setIsPinned(!!post.pinned);

        // Only set selectedPage if it's not already set by the parent
        if (!selectedPage) {
          const subId =
            typeof post.subPage === "object" ? post.subPage?._id : post.subPage;
          setSelectedPage(subId || "");
        }
      } catch (error) {
        console.error("Failed to load post for editing:", error);
      }
    };

    fetchPost();
    // deliberately DON'T include selectedPage in deps to avoid loop
  }, [id, isEditMode, url, editorRef, setIsPinned, setSelectedPage]);


  const selectedPageName = pages?.find?.(p => p._id === selectedPage)?.name || '';

  // Only reset when creating a new post, not when editing
  useEffect(() => {
    if (!isEditMode) {
      setEditorJsData(null);
      setSelectedPage("");
    }
  }, [isEditMode, setEditorJsData]);

  return (
    <>
      {/* Editor container */}
      <Paper 
        id="editorjs"
        sx={{
          border: "2px solid",
          borderColor: "primary.main",
          p: 1,
          minHeight: 300,
          borderRadius: 2,
          mb: 3
        }}
      />

      {/* Rendered preview */}
      <Box sx={{ mt: 2 }}>
        <RenderedEditorJsContent
          editorJsData={editorJsData}
          subPageName={selectedPageName}
        />
      </Box>
    </>
  )
}
export default Editor