import Dashboard from "../blogPages/Dashboard";
import { useContext, useEffect, useRef, useState } from "react";
import type EditorJS from "@editorjs/editorjs";
import type { EditorJsContent, PostType } from "../../blog/blogTypes/blogTypes";
import { VariablesContext } from "../../context/VariablesContext";
import axios from "axios";

interface Props {
  editingPostId?: string | null;
}

const AdminBlogPanel = ({ editingPostId }: Props) => {
  const editorRef = useRef<EditorJS | null>(null);
  const [editorJsData, setEditorJsData] = useState<EditorJsContent | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const { url } = useContext(VariablesContext);

  useEffect(() => {
    if (!editingPostId) return;

    const fetchPost = async () => {
      try {
        const res = await axios.get(`${url}/api/posts/${editingPostId}`);
        const post: PostType = res.data.data || res.data;
        setEditorJsData(post.content);
        setIsEditMode(true);
        // TODO If needed, also populate title, subPage, pinned via context/state in Dashboard
      } catch (err) {
        console.error("Error fetching post for edit:", err);
      }
    };

    fetchPost();
  }, [editingPostId, url]);

  return (
    <Dashboard
      editorRef={editorRef}
      editorJsData={editorJsData}
      setEditorJsData={setEditorJsData}
      isEditMode={isEditMode}
    />
  );
};

export default AdminBlogPanel;
