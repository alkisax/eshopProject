import { Box } from '@mui/material';
import { useSettings } from '../../context/SettingsContext';

type Props = {
  height?: number;
};

const SiteLogo = ({ height = 220 }: Props) => {
  const { settings, loading } = useSettings();

  if (loading) return null;
  const src = settings?.branding?.themeLogo;
  if (!src) return null;

  return (
    <Box
      component='img'
      src={src}
      alt='Site logo'
      sx={{ height, objectFit: 'contain' }}
    />
  );
};

export default SiteLogo;
