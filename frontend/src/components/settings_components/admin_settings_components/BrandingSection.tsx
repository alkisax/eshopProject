// frontend\src\components\settings_components\admin_settings_components\BrandingSection.tsx
import {
  Box,
  Typography,
  Button,
  Stack,
  TextField,
  Autocomplete,
} from "@mui/material";

type Props = {
  themeLogo: string;
  headerFooterLogo: string;
  recentFiles: string[];
  ready: boolean;
  onThemeLogoChange: (v: string) => void;
  onHeaderFooterLogoChange: (v: string) => void;
  onUploadThemeLogo: (file: File) => void;
  onUploadHeaderFooterLogo: (file: File) => void;
  onSave: () => void;
};

const BrandingSection = ({
  themeLogo,
  headerFooterLogo,
  recentFiles,
  ready,
  onThemeLogoChange,
  onHeaderFooterLogoChange,
  onUploadThemeLogo,
  onUploadHeaderFooterLogo,
  onSave,
}: Props) => {
  return (
    <Box>
      <Stack spacing={3} maxWidth={500}>
        {/* THEME LOGO */}
        <Typography variant="subtitle1">Theme Logo</Typography>

        <Autocomplete
          freeSolo
          options={recentFiles}
          value={themeLogo}
          onChange={(_, v) => onThemeLogoChange(v || "")}
          renderInput={(params) => (
            <TextField {...params} label="Theme Logo URL" size="small" />
          )}
        />

        <input
          type="file"
          accept="image/*"
          disabled={!ready}
          onChange={(e) =>
            e.target.files?.[0] && onUploadThemeLogo(e.target.files[0])
          }
        />

        {themeLogo && (
          <img
            src={themeLogo}
            alt="Theme logo preview"
            style={{
              height: 120,
              maxWidth: "100%",
              objectFit: "contain",
            }}
          />
        )}

        {/* HEADER / FOOTER LOGO */}
        <Typography variant="subtitle1">Header / Footer Logo</Typography>

        <Autocomplete
          freeSolo
          options={recentFiles}
          value={headerFooterLogo}
          onChange={(_, v) => onHeaderFooterLogoChange(v || "")}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Header/Footer Logo URL"
              size="small"
            />
          )}
        />

        <input
          type="file"
          accept="image/*"
          disabled={!ready}
          onChange={(e) =>
            e.target.files?.[0] &&
            onUploadHeaderFooterLogo(e.target.files[0])
          }
        />

        {headerFooterLogo && (
          <img
            src={headerFooterLogo}
            alt="Header logo preview"
            style={{
              height: 60,
              maxWidth: "100%",
              objectFit: "contain",
            }}
          />
        )}

        <Button variant="contained" onClick={onSave}>
          Save Branding
        </Button>
      </Stack>
    </Box>
  );
};

export default BrandingSection;