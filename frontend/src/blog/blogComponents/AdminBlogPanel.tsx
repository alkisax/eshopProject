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
const [title, setTitle] = useState<string>("");
const [selectedPage, setSelectedPage] = useState<string>("");
const [isPinned, setIsPinned] = useState<boolean>(false);

  const { url } = useContext(VariablesContext);

  useEffect(() => {
    if (!editingPostId) return;

    const fetchPost = async () => {
      try {
        const res = await axios.get(`${url}/api/posts/${editingPostId}`);
        const post: PostType = res.data.data || res.data;
        console.log("Fetched post full:", post);
        setEditorJsData(post.content);
        setTitle(post.title || "");
        if (post.subPage) {
          if (typeof post.subPage === "object") {
            setSelectedPage(post.subPage._id || "");
          } else {
            setSelectedPage(post.subPage); // already an ID string
          }
        } else {
          setSelectedPage("");
        }
        setIsPinned(post.pinned || false);
        setIsEditMode(true);
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
      id={editingPostId ?? undefined}
      title={title}
      setTitle={setTitle}
      selectedPage={selectedPage}
      setSelectedPage={setSelectedPage}
      isPinned={isPinned}
      setIsPinned={setIsPinned}
    />
  );
};

export default AdminBlogPanel;
