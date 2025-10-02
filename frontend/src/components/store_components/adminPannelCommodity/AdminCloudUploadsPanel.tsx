import { useState, useEffect, useCallback } from "react";
import {
  Typography, Button, List, ListItem, ListItemText, Box,
  Pagination
} from "@mui/material";
import { useAppwriteUploader } from "../../../hooks/useAppwriteUploader";

interface CloudFile {
  $id: string;
  name: string;
  mimeType: string;
  sizeOriginal: number;
}

const AdminCloudUploadsPanel = () => {
  // **all funcs on hook useAppwriteUploader** 
  const { ready, uploadFile, listFiles, deleteFile, getFileUrl } = useAppwriteUploader();
  const [files, setFiles] = useState<CloudFile[]>([]);
  const [file, setFile] = useState<File | null>(null);
  //pagination state
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10; // files per page

  const loadPage = useCallback (async (pageNum: number) => {
    const res = await listFiles(pageNum, limit);
    setFiles(res.files);
    setTotal(res.total);
  }, [listFiles]);

  useEffect(() => {
    if (ready) loadPage(page);
  }, [ready, page, loadPage]);

  const handleUpload = async () => {
    if (!file) return;
    await uploadFile(file);
    setFile(null);
    loadPage(page); // reload current page
  };

  const handleDelete = async (id: string) => {
    await deleteFile(id);
    loadPage(page); // reload current page
  };

  return (
      <Box>
      <Typography
        variant="h5"
        gutterBottom
      >
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
  );
};

export default AdminCloudUploadsPanel;
