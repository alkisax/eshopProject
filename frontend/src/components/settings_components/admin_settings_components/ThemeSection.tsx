// frontend/src/components/settings_components/admin_settings_components/ThemeSection.tsx
import {
  Stack,
  TextField,
  Typography,
  Button,
  Divider,
  Autocomplete,
} from "@mui/material";
import type { MenuItem } from "../../../types/settings.types";

type ThemeState = {
  primaryColor: string;
  secondaryColor: string;
  themeColor3: string;
  themeColor4: string;
  themeColor5: string;
  menuItems: MenuItem[];
  btnImage1: string;
  btnImage2: string;
  btnImage3: string;
};

type ColorKey =
  | "primaryColor"
  | "secondaryColor"
  | "themeColor3"
  | "themeColor4"
  | "themeColor5";

type Props = {
  theme: ThemeState;
  setTheme: React.Dispatch<React.SetStateAction<ThemeState>>;

  primaryDraft: string;
  secondaryDraft: string;
  theme3Draft: string;
  theme4Draft: string;
  theme5Draft: string;

  setPrimaryDraft: (v: string) => void;
  setSecondaryDraft: (v: string) => void;
  setTheme3Draft: (v: string) => void;
  setTheme4Draft: (v: string) => void;
  setTheme5Draft: (v: string) => void;

  ready: boolean;
  recentFiles: string[];

  onUploadBtnImage1: (file: File) => void;
  onUploadBtnImage2: (file: File) => void;
  onUploadBtnImage3: (file: File) => void;

  onSave: () => void;
};

const ThemeSection = ({
  theme,
  setTheme,
  primaryDraft,
  secondaryDraft,
  theme3Draft,
  theme4Draft,
  theme5Draft,
  setPrimaryDraft,
  setSecondaryDraft,
  setTheme3Draft,
  setTheme4Draft,
  setTheme5Draft,
  ready,
  recentFiles,
  onUploadBtnImage1,
  onUploadBtnImage2,
  onUploadBtnImage3,
  onSave,
}: Props) => {
  const setField = <K extends keyof ThemeState>(
    key: K,
    value: ThemeState[K],
  ) => {
    setTheme((p) => ({ ...p, [key]: value }));
  };

  const renderColor = (
    label: string,
    field: ColorKey,
    draft: string,
    setDraft: (v: string) => void,
  ) => (
    <Stack direction="row" spacing={2} alignItems="center">
      <TextField
        label={label}
        type="color"
        value={theme[field] as string}
        onChange={(e) => {
          const v = e.target.value;
          setField(field, v);
          setDraft(v);
        }}
        sx={{ width: 90 }}
      />

      <TextField
        label="Hex"
        value={draft}
        onChange={(e) => {
          const raw = e.target.value;
          if (/^#?[0-9A-Fa-f]{0,6}$/.test(raw)) {
            const normalized = raw.startsWith("#") ? raw : `#${raw}`;
            setDraft(normalized);
            if (/^#[0-9A-Fa-f]{6}$/.test(normalized)) {
              setField(field, normalized);
            }
          }
        }}
        sx={{ width: 140 }}
      />

      <Typography variant="body2">{theme[field]}</Typography>
    </Stack>
  );

  const renderUpload = (
    field: "btnImage1" | "btnImage2" | "btnImage3",
    label: string,
    value: string,
    onUpload: (file: File) => void,
  ) => (
    <Stack spacing={1}>
      <Typography variant="subtitle1">{label}</Typography>

      {/* URL INPUT */}
      <Autocomplete
        freeSolo
        options={recentFiles}
        value={value}
        onChange={(_, v) => setField(field, v || "")}
        renderInput={(params) => (
          <TextField {...params} label={`${label} URL`} size="small" />
        )}
      />

      {/* FILE UPLOAD */}
      <input
        type="file"
        accept="image/*"
        disabled={!ready}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
        }}
      />

      {/* PREVIEW */}
      {value && (
        <img
          src={value}
          alt={label}
          style={{
            maxWidth: 200,
            borderRadius: 6,
            objectFit: "contain",
          }}
        />
      )}
    </Stack>
  );

  return (
    <Stack spacing={3} maxWidth={720}>
      {/* COLORS */}
      <Typography variant="h6">Theme colors</Typography>

      {renderColor("Primary", "primaryColor", primaryDraft, setPrimaryDraft)}
      {renderColor(
        "Secondary",
        "secondaryColor",
        secondaryDraft,
        setSecondaryDraft,
      )}
      {renderColor("Theme color 3", "themeColor3", theme3Draft, setTheme3Draft)}
      {renderColor("Theme color 4", "themeColor4", theme4Draft, setTheme4Draft)}
      {renderColor("Theme color 5", "themeColor5", theme5Draft, setTheme5Draft)}

      <Divider />

      {/* MENU ITEMS */}
      <Typography variant="h6">Menu items</Typography>

      {theme.menuItems.map((item, index) => (
        <Stack key={index} direction="row" spacing={2}>
          <TextField
            label="Label"
            value={item.label}
            onChange={(e) =>
              setTheme((p) => {
                const copy = [...p.menuItems];
                copy[index] = { ...copy[index], label: e.target.value };
                return { ...p, menuItems: copy };
              })
            }
            fullWidth
          />

          <TextField
            label="URL"
            value={item.url}
            onChange={(e) =>
              setTheme((p) => {
                const copy = [...p.menuItems];
                copy[index] = { ...copy[index], url: e.target.value };
                return { ...p, menuItems: copy };
              })
            }
            fullWidth
          />

          <Button
            color="error"
            onClick={() =>
              setTheme((p) => ({
                ...p,
                menuItems: p.menuItems.filter((_, i) => i !== index),
              }))
            }
          >
            ✕
          </Button>
        </Stack>
      ))}

      <Button
        variant="outlined"
        onClick={() =>
          setTheme((p) => ({
            ...p,
            menuItems: [...p.menuItems, { label: "", url: "" }],
          }))
        }
      >
        + Add menu item
      </Button>

      <Divider />

      {/* BUTTON IMAGES */}
      <Typography variant="h6">Button images</Typography>

      {renderUpload(
        "btnImage1",
        "Button image 1",
        theme.btnImage1,
        onUploadBtnImage1,
      )}
      {renderUpload(
        "btnImage2",
        "Button image 2",
        theme.btnImage2,
        onUploadBtnImage2,
      )}
      {renderUpload(
        "btnImage3",
        "Button image 3",
        theme.btnImage3,
        onUploadBtnImage3,
      )}

      <Button variant="contained" onClick={onSave}>
        Save Theme
      </Button>
    </Stack>
  );
};

export default ThemeSection;
