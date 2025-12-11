// frontend\src\blog\blogComponents\AdminBlogPanel.tsx
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
  const [editorJsData, setEditorJsData] = useState<EditorJsContent | null>(
    null
  );
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
    <>
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
      {/* ===================== ADMIN BLOG PANEL – INSTRUCTIONS ===================== */}
      <div style={{ marginTop: "1.5rem" }}>
        <div
          style={{
            padding: "1rem",
            background: "#f7f7f7",
            border: "1px solid #ddd",
            borderRadius: "6px",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Instructions – Blog Post Editor</h3>

          <p style={{ marginBottom: "0.6rem" }}>
            • This panel loads the <b>EditorJS-based blog editor</b> used for
            creating and updating blog posts.
          </p>

          <p style={{ marginBottom: "0.6rem" }}>
            • When <code>editingPostId</code> is provided, the system
            automatically fetches the post from the backend and loads its{" "}
            <b>title</b>, <b>content blocks</b>,<b>subPage</b>, and{" "}
            <b>pinned</b> status.
          </p>

          <p style={{ marginBottom: "0.6rem" }}>
            • <b>Content</b> is displayed inside the EditorJS instance (via{" "}
            <code>editorRef</code>), and can include text blocks, images,
            headings, lists, code blocks, and more.
          </p>

          <p style={{ marginBottom: "0.6rem" }}>
            • <b>Title</b> and <b>SubPage</b> fields appear at the top of the
            editor UI, controlled through props passed to the Dashboard
            component.
          </p>

          <p style={{ marginBottom: "0.6rem" }}>
            • Admins can toggle whether the post is <b>pinned</b> (highlighted
            or prioritized on the front-end blog list).
          </p>

          <p style={{ marginBottom: "0.6rem" }}>
            • Saving the post is handled entirely inside the{" "}
            <code>Dashboard</code> component, which receives all necessary data
            and callback handlers.
          </p>

          <p>
            • When no <code>editingPostId</code> is given, the editor is ready
            for creating a<b>new blog post</b>.
          </p>
        </div>
      </div>
    </>
  );
};

export default AdminBlogPanel;
