// frontend/src/components/settings_components/admin_settings_components/ShopOptionsSection.tsx
import { Stack, Switch, FormControlLabel, Button } from "@mui/material";

type Props = {
  shopOptions: {
    isOpen: boolean;
    isAiProfanity: boolean;
  };
  setShopOptions: React.Dispatch<
    React.SetStateAction<{
      isOpen: boolean;
      isAiProfanity: boolean;
    }>
  >;
  onSave: () => void;
};

const ShopOptionsSection = ({
  shopOptions,
  setShopOptions,
  onSave,
}: Props) => {
  return (
    <Stack spacing={2} maxWidth={500}>
      <FormControlLabel
        control={
          <Switch
            checked={shopOptions.isOpen ?? true}
            onChange={(e) =>
              setShopOptions((p) => ({
                ...p,
                isOpen: e.target.checked,
              }))
            }
          />
        }
        label="Shop is open"
      />

      <FormControlLabel
        control={
          <Switch
            checked={shopOptions.isAiProfanity ?? false}
            onChange={(e) =>
              setShopOptions((p) => ({
                ...p,
                isAiProfanity: e.target.checked,
              }))
            }
          />
        }
        label="AI profanity filter enabled"
      />

      <Button variant="contained" onClick={onSave}>
        Save Shop Options
      </Button>
    </Stack>
  );
};

export default ShopOptionsSection;
