// frontend\src\components\settings_components\admin_settings_components\HomeTextsSection.tsx
import { Stack, TextField, Button } from "@mui/material";

type HomeTexts = {
  homeText1: string;
  homeText2: string;
  homeText3: string;
};

type Props = {
  homeTexts: HomeTexts;
  setHomeTexts: React.Dispatch<React.SetStateAction<HomeTexts>>;
  onSave: () => void;
};

const HomeTextsSection = ({ homeTexts, setHomeTexts, onSave }: Props) => {
  return (
    <Stack spacing={3} maxWidth={500}>
      <TextField
        label="Home text 1"
        multiline
        minRows={3}
        value={homeTexts.homeText1}
        onChange={(e) =>
          setHomeTexts((p) => ({ ...p, homeText1: e.target.value }))
        }
      />

      <TextField
        label="Home text 2"
        multiline
        minRows={3}
        value={homeTexts.homeText2}
        onChange={(e) =>
          setHomeTexts((p) => ({ ...p, homeText2: e.target.value }))
        }
      />

      <TextField
        label="Home text 3"
        multiline
        minRows={3}
        value={homeTexts.homeText3}
        onChange={(e) =>
          setHomeTexts((p) => ({ ...p, homeText3: e.target.value }))
        }
      />

      <Button variant="contained" onClick={onSave}>
        Save home texts
      </Button>
    </Stack>
  );
};

export default HomeTextsSection;
