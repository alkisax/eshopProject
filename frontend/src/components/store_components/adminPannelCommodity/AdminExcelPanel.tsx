// frontend\src\components\store_components\adminPannelCommodity\AdminExcelPanel.tsx
import { useState, useContext } from "react";
import { useAppwriteUploader } from "../../../hooks/useAppwriteUploader";
import {
  Button,
  Typography,
  Stack,
  Paper,
  Box,
  Divider,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import { VariablesContext } from "../../../context/VariablesContext";

const AdminExcelPanel = () => {
  const { url } = useContext(VariablesContext);

  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [zipFile, setZipFile] = useState<File | null>(null);

  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const token = localStorage.getItem("token");

  const { uploadFile } = useAppwriteUploader();

  // ------------------------------------------
  // EXPORT PRODUCTS
  // ------------------------------------------
  const handleExportExcel = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${url}/api/excel/export`, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      });

      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = "products_export.xlsx";
      link.click();

      setMessage("Excel exported successfully.");
    } catch (err) {
      console.error(err);
      setMessage("Error exporting Excel.");
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------
  // EXPORT IMAGES ZIP
  // ------------------------------------------
  const handleExportImagesZip = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${url}/api/excel/export-images`, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      });

      const blob = new Blob([res.data], { type: "application/zip" });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "product_images.zip";
      link.click();

      setMessage("Images ZIP exported successfully.");
    } catch (err) {
      console.error(err);
      setMessage("Error exporting images ZIP.");
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------
  // Upload file → Appwrite
  // ------------------------------------------
  const uploadToAppwrite = async (file: File): Promise<string> => {
    const result = await uploadFile(file);
    return result.$id;
  };

  // ------------------------------------------
  // IMPORT PRODUCTS
  // ------------------------------------------
  const handleImportProducts = async () => {
    try {
      if (!excelFile) {
        setMessage("Please choose an Excel file.");
        return;
      }

      setLoading(true);

      const excelFileId = await uploadToAppwrite(excelFile);

      let zipFileId = undefined;
      if (zipFile) {
        zipFileId = await uploadToAppwrite(zipFile);
      }

      const res = await axios.post(
        `${url}/api/excel/import`,
        {
          fileId: excelFileId,
          originalName: excelFile.name,
          zipFileId: zipFileId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(JSON.stringify(res.data.message, null, 2));
    } catch (err) {
      console.error(err);
      setMessage("Import failed.");
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------
  // SYNC PRODUCTS
  // ------------------------------------------
  const handleSyncProducts = async () => {
    try {
      if (!excelFile) {
        setMessage("Please choose an Excel file.");
        return;
      }

      setLoading(true);

      const excelFileId = await uploadToAppwrite(excelFile);

      let zipFileId = undefined;
      if (zipFile) {
        zipFileId = await uploadToAppwrite(zipFile);
      }

      const res = await axios.post(
        `${url}/api/excel/sync`,
        {
          fileId: excelFileId,
          originalName: excelFile.name,
          zipFileId: zipFileId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(JSON.stringify(res.data.message, null, 2));
    } catch (err) {
      console.error(err);
      setMessage("Sync failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Excel Product Tools
      </Typography>

      {/* Loading Overlay */}
      {loading && (
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <CircularProgress size={24} />
          <Typography>Processing… please wait</Typography>
        </Stack>
      )}

      <Stack spacing={3}>
        {/* EXCEL SELECT */}
        <Box>
          <Typography fontWeight="bold">Excel File (.xlsx)</Typography>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
          />
        </Box>

        {/* ZIP SELECT */}
        <Box>
          <Typography fontWeight="bold">Images Zip (optional)</Typography>
          <input
            type="file"
            accept=".zip"
            onChange={(e) => setZipFile(e.target.files?.[0] || null)}
          />
        </Box>

        <Divider />

        {/* EXPORT BUTTON */}
        <Button
          variant="contained"
          color="secondary"
          onClick={handleExportExcel}
          disabled={loading}
        >
          Export Products Excel
        </Button>

        {/* EXPORT IMAGES ZIP */}
        <Button
          variant="contained"
          color="secondary"
          onClick={handleExportImagesZip}
          disabled={loading}
        >
          Export Images ZIP
        </Button>

        {/* IMPORT BUTTON */}
        <Button
          variant="contained"
          color="primary"
          onClick={handleImportProducts}
          disabled={loading}
        >
          Import Products (Excel → DB)
        </Button>

        {/* SYNC BUTTON */}
        <Button
          variant="contained"
          color="warning"
          onClick={handleSyncProducts}
          disabled={loading}
        >
          Sync / Update Products
        </Button>
      </Stack>

      {message && (
        <Typography sx={{ mt: 3, whiteSpace: "pre-wrap" }} color="secondary">
          {message}
        </Typography>
      )}
    </Paper>
  );
};

export default AdminExcelPanel;
