// frontend\src\components\store_components\adminPannelCommodity\AdminCloudUploadsPanel.tsx
import { useState, useEffect, useCallback } from "react";
import {
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Box,
  Pagination,
} from "@mui/material";
import { useAppwriteUploader } from "../../../hooks/useAppwriteUploader";
import { resizeImageIfNeeded } from "../../../utils/resizeImage";

interface CloudFile {
  $id: string;
  name: string;
  mimeType: string;
  sizeOriginal: number;
}

const AdminCloudUploadsPanel = () => {
  // **all funcs on hook useAppwriteUploader**
  const { ready, uploadFile, listFiles, deleteFile, getFileUrl } =
    useAppwriteUploader();
  const [files, setFiles] = useState<CloudFile[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [resizeInfo, setResizeInfo] = useState<string | null>(null);
  //pagination state
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10; // files per page

  const loadPage = useCallback(
    async (pageNum: number) => {
      const res = await listFiles(pageNum, limit);
      setFiles(res.files);
      setTotal(res.total);
    },
    [listFiles]
  );

  useEffect(() => {
    if (ready) loadPage(page);
  }, [ready, page, loadPage]);

  const handleUpload = async () => {
    if (!file) return;
    const result = await resizeImageIfNeeded(file, 2);
    if (result.resized) {
      const before = (result.originalSize / 1024 / 1024).toFixed(2);
      const after = (result.newSize / 1024 / 1024).toFixed(2);

      console.log(`Image resized: ${before}MB → ${after}MB`);
      setResizeInfo(`Image resized: ${before}MB → ${after}MB`);
    } else {
      console.log("Image uploaded without resize");
      setResizeInfo("Image uploaded without resize");
    }
    await uploadFile(result.file);
    setFile(null);
    loadPage(page); // reload current page
  };

  const handleDelete = async (id: string) => {
    await deleteFile(id);
    loadPage(page); // reload current page
  };

  return (
    <>
      <Box>
        <Typography variant="h5" gutterBottom>
          Cloud Uploads (Appwrite)
        </Typography>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!file || !ready}
          sx={{ ml: 2 }}
        >
          Upload
        </Button>

        {resizeInfo && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            {resizeInfo}
          </Typography>
        )}

        <List>
          {files.map((f) => (
            <ListItem
              key={f.$id}
              secondaryAction={
                <Button color="error" onClick={() => handleDelete(f.$id)}>
                  Delete
                </Button>
              }
            >
              {f.mimeType.startsWith("image/") ? (
                <img
                  src={getFileUrl(f.$id)}
                  alt={f.name}
                  style={{
                    width: 60,
                    height: 60,
                    objectFit: "cover",
                    borderRadius: 4,
                    marginRight: 8,
                  }}
                />
              ) : f.mimeType === "application/pdf" ? (
                <a
                  href={getFileUrl(f.$id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ marginRight: 8 }}
                >
                  📄 PDF
                </a>
              ) : (
                <span style={{ marginRight: 8 }}>{f.mimeType}</span>
              )}

              <ListItemText primary={f.name} secondary={getFileUrl(f.$id)} />
            </ListItem>
          ))}
        </List>

        {/* Pagination control */}
        <Pagination
          count={Math.ceil(total / limit)} // total pages
          page={page}
          onChange={(_, value) => setPage(value)}
          sx={{ mt: 2 }}
        />
      </Box>
      {/* ===================== ADMIN CLOUD UPLOADS PANEL – INSTRUCTIONS ===================== */}
      <Box sx={{ p: 2, mt: 4, backgroundColor: "#f7f7f7", borderRadius: 1 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Instructions – Cloud Uploads (Appwrite)
        </Typography>

        <Typography variant="body2" sx={{ mb: 1 }}>
          • This panel manages all files stored in the Appwrite bucket (images,
          PDFs, etc.).
        </Typography>

        <Typography variant="body2" sx={{ mb: 1 }}>
          • <b>Upload</b>: Select a file from your device and press “Upload”.
          After upload, the panel automatically refreshes the current page.
        </Typography>

        <Typography variant="body2" sx={{ mb: 1 }}>
          • <b>Images</b> appear with a thumbnail preview. PDFs show a link
          icon, and all other file types display their MIME type.
        </Typography>

        <Typography variant="body2" sx={{ mb: 1 }}>
          • <b>Delete</b>: Removes the file from the Appwrite bucket
          permanently.
        </Typography>

        <Typography variant="body2" sx={{ mb: 1 }}>
          • <b>Pagination</b>: Files are loaded in pages of 10. Use the
          paginator to navigate through the entire bucket.
        </Typography>

        <Typography variant="body2">
          • The file URLs shown here can be copied and used inside product
          images or anywhere in the app.
        </Typography>
      </Box>
    </>
  );
};

export default AdminCloudUploadsPanel;
