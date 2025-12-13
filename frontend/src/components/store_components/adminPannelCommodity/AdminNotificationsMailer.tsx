// frontend\src\components\store_components\adminPannelCommodity\AdminNotificationsMailer.tsx
import { useEffect, useState, useContext, useCallback } from "react";
import axios from "axios";
import {
  Paper,
  Typography,
  Switch,
  FormControlLabel,
  Stack,
  TextField,
  Button,
} from "@mui/material";
import { VariablesContext } from "../../../context/VariablesContext";

interface AdminNotifications {
  salesNotificationsEnabled: boolean;
  adminEmail?: string;
}

const AdminNotificationsMailer = () => {
  const { url } = useContext(VariablesContext);
  const token = localStorage.getItem("token");

  const [settings, setSettings] = useState<AdminNotifications | null>(null);
  const [emailInput, setEmailInput] = useState("");

  const fetchSettings = useCallback(async () => {
    const res = await axios.get(`${url}/api/settings`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const adminNotifications = res.data.data.adminNotifications;
    setSettings(adminNotifications);
    setEmailInput(adminNotifications.adminEmail || "");
  }, [url, token]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = async (updated: AdminNotifications) => {
    await axios.put(
      `${url}/api/settings/admin-notifications`,
      { adminNotifications: updated },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setSettings(updated);
  };

  if (!settings) {
    return null;
  }

  return (
    <Paper sx={{ p: 2, mt: 4 }} variant="outlined">
      <Typography variant="h6" gutterBottom>
        Admin Sale Notifications
      </Typography>

      <FormControlLabel
        control={
          <Switch
            checked={settings.salesNotificationsEnabled}
            onChange={() =>
              updateSettings({
                ...settings,
                salesNotificationsEnabled: !settings.salesNotificationsEnabled,
              })
            }
          />
        }
        label="Notify admin when a sale is created"
      />

      {settings.salesNotificationsEnabled && (
        <Stack spacing={1} sx={{ mt: 2 }}>
          <Typography variant="body2">Notifications are sent to:</Typography>

          <TextField
            size="small"
            label="Admin email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
          />

          <Button
            variant="contained"
            size="small"
            onClick={() =>
              updateSettings({
                ...settings,
                adminEmail: emailInput,
              })
            }
          >
            Change admin email
          </Button>
        </Stack>
      )}
    </Paper>
  );
};

export default AdminNotificationsMailer;
