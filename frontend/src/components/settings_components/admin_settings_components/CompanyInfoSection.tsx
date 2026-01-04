// frontend\src\components\settings_components\admin_settings_components\CompanyInfoSection.tsx
import {
  Box,
  Stack,
  TextField,
  Button,
  Autocomplete,
  Typography,
} from "@mui/material";

type CompanyInfo = {
  companyName: string;
  vatNumber: string;
  address: string;
  phone: string;
  email: string;
  irisBankQR: string;
};

type Props = {
  companyInfo: CompanyInfo;
  recentFiles: string[];
  ready: boolean;
  onUploadIrisQR: (file: File) => void;
  onChange: (data: CompanyInfo) => void;
  onSave: () => void;
};

const CompanyInfoSection = ({
  companyInfo,
  recentFiles,
  ready,
  onUploadIrisQR,
  onChange,
  onSave,
}: Props) => {
  return (
    <Box>
      <Stack spacing={3} maxWidth={500}>
        <TextField
          label="Company name"
          value={companyInfo.companyName}
          onChange={(e) =>
            onChange({ ...companyInfo, companyName: e.target.value })
          }
        />

        <TextField
          label="VAT number"
          value={companyInfo.vatNumber}
          onChange={(e) =>
            onChange({ ...companyInfo, vatNumber: e.target.value })
          }
        />

        <TextField
          label="Address"
          value={companyInfo.address}
          onChange={(e) =>
            onChange({ ...companyInfo, address: e.target.value })
          }
        />

        <TextField
          label="Phone"
          value={companyInfo.phone}
          onChange={(e) => onChange({ ...companyInfo, phone: e.target.value })}
        />

        <TextField
          label="Email"
          value={companyInfo.email}
          onChange={(e) => onChange({ ...companyInfo, email: e.target.value })}
        />
        <Typography variant="subtitle1">IRIS Bank QR</Typography>

        <Autocomplete
          freeSolo
          options={recentFiles}
          value={companyInfo.irisBankQR}
          onChange={(_, v) => onChange({ ...companyInfo, irisBankQR: v || "" })}
          renderInput={(params) => (
            <TextField {...params} label="IRIS Bank QR URL" size="small" />
          )}
        />

        <input
          type="file"
          accept="image/*"
          disabled={!ready}
          onChange={(e) =>
            e.target.files?.[0] && onUploadIrisQR(e.target.files[0])
          }
        />

        {companyInfo.irisBankQR && (
          <img
            src={companyInfo.irisBankQR}
            alt="IRIS QR preview"
            style={{
              width: 200,
              maxWidth: "100%",
              objectFit: "contain",
              borderRadius: 8,
            }}
          />
        )}

        <Button variant="contained" onClick={onSave}>
          Save Company Info
        </Button>
      </Stack>
    </Box>
  );
};

export default CompanyInfoSection;
