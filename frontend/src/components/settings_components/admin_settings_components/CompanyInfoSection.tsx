// frontend\src\components\settings_components\admin_settings_components\CompanyInfoSection.tsx
import { Box, Stack, TextField, Button } from "@mui/material";

type CompanyInfo = {
  companyName: string;
  vatNumber: string;
  address: string;
  phone: string;
  email: string;
};

type Props = {
  companyInfo: CompanyInfo;
  onChange: (data: CompanyInfo) => void;
  onSave: () => void;
};

const CompanyInfoSection = ({ companyInfo, onChange, onSave }: Props) => {
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
          onChange={(e) =>
            onChange({ ...companyInfo, phone: e.target.value })
          }
        />

        <TextField
          label="Email"
          value={companyInfo.email}
          onChange={(e) =>
            onChange({ ...companyInfo, email: e.target.value })
          }
        />

        <Button variant="contained" onClick={onSave}>
          Save Company Info
        </Button>
      </Stack>
    </Box>
  );
};

export default CompanyInfoSection;
