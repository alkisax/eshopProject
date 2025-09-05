// src/components/admin/AdminUploadsPanel.tsx
import { useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import {
  Typography, Button, List, ListItem, ListItemText, Box
} from "@mui/material";
import { VariablesContext } from "../context/VariablesContext";

export interface UploadMeta {
  _id: string;
  name?: string;
  desc?: string;
  file: {
    url: string;
    contentType: string;
    originalName: string;
    filename: string;
    size?: number;
    extension?: string;
  };
}

const AdminLocalUploadsPanel = () => {
  const { url } = useContext(VariablesContext);
  const [uploads, setUploads] = useState<UploadMeta[]>([]);
  const [file, setFile] = useState<File | null>(null);

  const fetchUploads = useCallback(async () => {
    const res = await axios.get<{ status: boolean; data: UploadMeta[] }>(`${url}/api/upload-multer`);
    if (res.data.status) setUploads(res.data.data);
  }, [url]);

  useEffect(() => {
    fetchUploads();
  }, [fetchUploads, url]);

  const handleUpload = async () => {
    if (!file) return;
    const form = new FormData();
    form.append("image", file);

    const token = localStorage.getItem("token");
    await axios.post(`${url}/api/upload-multer?saveToMongo=true`, form, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    
    await fetchUploads();
    setFile(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;

    const token = localStorage.getItem("token");
    try {
      const res = await axios.delete<{ status: boolean; message: string }>(
        `${url}/api/upload-multer/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data.status) {
        // refresh the list
        fetchUploads();
      } else {
        alert("Delete failed: " + res.data.message);
      }
    } catch (err) {
      console.error("Delete error", err);
      alert("Delete failed. Check console for details.");
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Local Uploads (avoid)
      </Typography>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <Button
        variant="contained"
        onClick={handleUpload}
        disabled={!file}
        sx={{ ml: 2 }}
      >
        Upload
      </Button>

      <List>
        {uploads.map((u) => (
          <ListItem
            key={u._id}
            secondaryAction={
              <Button
                color="error"
                onClick={() => handleDelete(u._id)}
              >
                Delete
              </Button>
            }
          >
            {u.file.contentType.startsWith("image/") && (
              <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
                <img
                  src={u.file.url}
                  alt={u.file.originalName}
                  style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 4 }}
                />
              </Box>
            )}
            <ListItemText
              primary={u.name || u.file.originalName}
              secondary={u.file.url}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default AdminLocalUploadsPanel;
