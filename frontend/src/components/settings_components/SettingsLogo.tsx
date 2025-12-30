import { Box } from "@mui/material";
import { useSettings } from "../../context/SettingsContext";

interface Props {
  height?: number;
}

const SettingsLogo = ({ height = 40 }: Props) => {
  const { settings } = useSettings();

  const branding = settings?.branding;

  const logoUrl = branding?.headerFooterLogo;

  return (
    <Box
      component="img"
      src={logoUrl}
      alt="small header Logo"
      sx={{ height, mr: 1 }}
    />
  );
};

export default SettingsLogo;
