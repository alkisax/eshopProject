// frontend\src\components\settings_components\admin_settings_components\BrandingSection.tsx
import {
  Box,
  Typography,
  Button,
  Stack,
  TextField,
  Autocomplete,
  Switch,
  FormControlLabel,
} from "@mui/material";

type Props = {
  themeLogo: string;
  headerFooterLogo: string;
  heroImage: string;
  isHeroImageActive: boolean;
  themeSelector: ("TRUE" | "FALSE")[];
  recentFiles: string[];
  ready: boolean;
  onThemeLogoChange: (v: string) => void;
  onHeaderFooterLogoChange: (v: string) => void;
  onHeroImageChange: (v: string) => void;
  onUploadThemeLogo: (file: File) => void;
  onUploadHeaderFooterLogo: (file: File) => void;
  onUploadHeroImage: (file: File) => void;
  onToggleHeroImageActive: (value: boolean) => void;
  onThemeSelectorChange: (v: ("TRUE" | "FALSE")[]) => void;
  onSave: () => void;
};

const BrandingSection = ({
  themeLogo,
  headerFooterLogo,
  heroImage,
  isHeroImageActive,
  recentFiles,
  ready,
  themeSelector,
  onThemeLogoChange,
  onHeaderFooterLogoChange,
  onHeroImageChange,
  onUploadThemeLogo,
  onUploadHeaderFooterLogo,
  onUploadHeroImage,
  onToggleHeroImageActive,
  onThemeSelectorChange,
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
            e.target.files?.[0] && onUploadHeaderFooterLogo(e.target.files[0])
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

        {/* HERO IMAGE */}
        <Typography variant="subtitle1">Hero Image</Typography>

        <FormControlLabel
          control={
            <Switch
              checked={isHeroImageActive}
              onChange={(e) => onToggleHeroImageActive(e.target.checked)}
            />
          }
          label={isHeroImageActive ? "Hero ενεργό" : "Hero ανενεργό"}
        />

        <Autocomplete
          freeSolo
          options={recentFiles}
          value={heroImage}
          onChange={(_, v) => onHeroImageChange(v || "")}
          renderInput={(params) => (
            <TextField {...params} label="Hero Image URL" size="small" />
          )}
        />

        <input
          type="file"
          accept="image/*"
          disabled={!ready}
          onChange={(e) =>
            e.target.files?.[0] && onUploadHeroImage(e.target.files[0])
          }
        />

        {heroImage && (
          <img
            src={heroImage}
            alt="Hero preview"
            style={{
              width: "100%",
              maxHeight: 240,
              objectFit: "cover",
              borderRadius: 8,
            }}
          />
        )}

        {/* theme selector */}
        <Typography variant="subtitle1">Theme Selector</Typography>

        <Autocomplete<"TRUE" | "FALSE", true>
          multiple
          options={["TRUE", "FALSE"]}
          value={themeSelector}
          onChange={(_, v) => onThemeSelectorChange(v)}
          renderInput={(params) => (
            <TextField {...params} label="Theme selector" size="small" />
          )}
        />
        <Button variant="contained" onClick={onSave}>
          Save Branding
        </Button>
      </Stack>
    </Box>
  );
};

export default BrandingSection;
