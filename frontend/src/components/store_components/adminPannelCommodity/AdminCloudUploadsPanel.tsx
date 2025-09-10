import { useState, useEffect } from "react";
import {
  Typography, Button, List, ListItem, ListItemText, Box
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

  useEffect(() => {
    if (ready) {
      listFiles().then(setFiles);
    }
  }, [ready, listFiles]);

  const handleUpload = async () => {
    if (!file) return;
    await uploadFile(file);
    setFile(null);
    listFiles().then(setFiles);
  };

  const handleDelete = async (id: string) => {
    await deleteFile(id);
    listFiles().then(setFiles);
  };

  return (
      <Box>
      <Typography variant="h5" gutterBottom>
        Cloud Uploads (Appwrite)
      </Typography>

      <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <Button variant="contained" onClick={handleUpload} disabled={!file || !ready} sx={{ ml: 2 }}>
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
    </Box>
  );
};

export default AdminCloudUploadsPanel;
