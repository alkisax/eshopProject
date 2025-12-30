// frontend\src\components\settings_components\admin_settings_components\SocialLinksSection.tsx
import { Box, Stack, TextField, Button } from "@mui/material";

type SocialLinks = {
  facebook: string;
  instagram: string;
  etsy: string;
  tiktok: string;
};

type Props = {
  socialLinks: SocialLinks;
  onChange: (data: SocialLinks) => void;
  onSave: () => void;
};

const SocialLinksSection = ({ socialLinks, onChange, onSave }: Props) => {
  return (
    <Box>
      <Stack spacing={3} maxWidth={500}>
        <TextField
          label="Facebook URL"
          value={socialLinks.facebook}
          onChange={(e) =>
            onChange({ ...socialLinks, facebook: e.target.value })
          }
        />

        <TextField
          label="Instagram URL"
          value={socialLinks.instagram}
          onChange={(e) =>
            onChange({ ...socialLinks, instagram: e.target.value })
          }
        />

        <TextField
          label="Etsy URL"
          value={socialLinks.etsy}
          onChange={(e) =>
            onChange({ ...socialLinks, etsy: e.target.value })
          }
        />

        <TextField
          label="TikTok URL"
          value={socialLinks.tiktok}
          onChange={(e) =>
            onChange({ ...socialLinks, tiktok: e.target.value })
          }
        />

        <Button variant="contained" onClick={onSave}>
          Save Social Links
        </Button>
      </Stack>
    </Box>
  );
};

export default SocialLinksSection;
