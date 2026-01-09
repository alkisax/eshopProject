// frontend/themeB/SocialMediaFooter.tsx
import { Box, Typography, IconButton } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import { useSettings } from '../../src/context/SettingsContext';

const SocialMediaFooter = () => {
  const { settings } = useSettings();
  const social = settings?.socialLinks;

  if (!social) return null;

  return (
    // 🔴 FULL WIDTH BACKGROUND
    <Box
      sx={{
        width: '100%',
        backgroundColor: 'secondary.main',
        mt: 10,
        py: 4,
      }}
    >
      {/* 🟢 CENTERED CONTENT */}
      <Box
        sx={{
          maxWidth: '1536px',
          mx: 'auto',
          px: { xs: 2, sm: 3 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Typography
          variant='body1'
          sx={{ color: '#fff', fontWeight: 300 }}
        >
          Ακολουθήστε μας
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          {social.facebook && (
            <IconButton
              href={social.facebook}
              target='_blank'
              rel='noopener noreferrer'
              sx={{ color: '#fff' }}
            >
              <FacebookIcon />
            </IconButton>
          )}

          {social.instagram && (
            <IconButton
              href={social.instagram}
              target='_blank'
              rel='noopener noreferrer'
              sx={{ color: '#fff' }}
            >
              <InstagramIcon />
            </IconButton>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default SocialMediaFooter;
