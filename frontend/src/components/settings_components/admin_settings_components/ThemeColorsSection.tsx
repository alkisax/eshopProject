// frontend\src\components\settings_components\admin_settings_components\ThemeColorsSection.tsx
import { Stack, TextField, Typography, Button } from "@mui/material";

type ThemeColors = {
  primaryColor: string;
  secondaryColor: string;
};

type Props = {
  themeColors: ThemeColors;
  primaryDraft: string;
  secondaryDraft: string;
  setThemeColors: React.Dispatch<React.SetStateAction<ThemeColors>>;
  setPrimaryDraft: (v: string) => void;
  setSecondaryDraft: (v: string) => void;
  onSave: () => void;
};

const ThemeColorsSection = ({
  themeColors,
  primaryDraft,
  secondaryDraft,
  setThemeColors,
  setPrimaryDraft,
  setSecondaryDraft,
  onSave,
}: Props) => {
  return (
    <Stack spacing={2} maxWidth={500}>
      {/* PRIMARY */}
      <Stack direction="row" spacing={2} alignItems="center">
        <TextField
          label="Primary color"
          type="color"
          value={themeColors.primaryColor}
          onChange={(e) => {
            const v = e.target.value;
            setThemeColors((p) => ({ ...p, primaryColor: v }));
            setPrimaryDraft(v);
          }}
          sx={{ width: 90 }}
          slotProps={{ inputLabel: { shrink: true } }}
        />

        <TextField
          label="Hex"
          value={primaryDraft}
          onChange={(e) => {
            const v = e.target.value;

            if (/^#?[0-9A-Fa-f]{0,6}$/.test(v)) {
              const normalized = v.startsWith("#") ? v : `#${v}`;
              setPrimaryDraft(normalized);

              if (/^#[0-9A-Fa-f]{6}$/.test(normalized)) {
                setThemeColors((p) => ({
                  ...p,
                  primaryColor: normalized,
                }));
              }
            }
          }}
          sx={{ width: 120 }}
          slotProps={{ htmlInput: { maxLength: 7 } }}
        />

        <Typography variant="body2">
          {themeColors.primaryColor}
        </Typography>
      </Stack>

      {/* SECONDARY */}
      <Stack direction="row" spacing={2} alignItems="center">
        <TextField
          label="Secondary color"
          type="color"
          value={themeColors.secondaryColor}
          onChange={(e) => {
            const v = e.target.value;
            setThemeColors((p) => ({ ...p, secondaryColor: v }));
            setSecondaryDraft(v);
          }}
          sx={{ width: 90 }}
          slotProps={{ inputLabel: { shrink: true } }}
        />

        <TextField
          label="Hex"
          value={secondaryDraft}
          onChange={(e) => {
            const raw = e.target.value;

            if (/^#?[0-9A-Fa-f]{0,6}$/.test(raw)) {
              const normalized = raw.startsWith("#") ? raw : `#${raw}`;
              setSecondaryDraft(normalized);

              if (/^#[0-9A-Fa-f]{6}$/.test(normalized)) {
                setThemeColors((p) => ({
                  ...p,
                  secondaryColor: normalized,
                }));
              }
            }
          }}
          sx={{ width: 120 }}
          slotProps={{ htmlInput: { maxLength: 7 } }}
        />

        <Typography variant="body2">
          {themeColors.secondaryColor}
        </Typography>
      </Stack>

      <Button variant="contained" onClick={onSave}>
        Save Theme Colors
      </Button>
    </Stack>
  );
};

export default ThemeColorsSection;
