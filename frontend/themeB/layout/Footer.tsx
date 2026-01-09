// frontend/themeB/Footer.tsx
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  Link as MuiLink,
  Divider,
} from '@mui/material';

import SocialMediaFooter from './SocialMediaFooter';
import { useSettings } from '../../src/context/SettingsContext';

const Footer = () => {
  const { settings } = useSettings();
  const company = settings?.companyInfo;

  return (
    <>
      <SocialMediaFooter />

      <Box
        component='footer'
        sx={{
          maxWidth: '1536px', // max-w-screen-2xl
          mx: 'auto',
          px: { xs: 2, sm: 3 },
          borderBottom: 8,
          borderColor: 'secondary.main',
        }}
      >
        {/* TOP GRID */}
        <Grid
          container
          spacing={6}
          justifyContent='center'
          textAlign='center'
          sx={{ mt: 6 }}
        >
          {/* Column 1 */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant='h6' fontWeight='bold' gutterBottom>
              Πληροφορίες
            </Typography>
            <MuiLink
              component={RouterLink}
              to='/about'
              color='inherit'
              underline='none'
            >
              Σχετικά με εμάς
            </MuiLink>
            <br />
            <MuiLink
              component={RouterLink}
              to='/contact'
              color='inherit'
              underline='none'
            >
              Επικοινωνία
            </MuiLink>
          </Grid>

          {/* Column 2 */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant='h6' fontWeight='bold' gutterBottom>
              Αγορές
            </Typography>
            <MuiLink
              component={RouterLink}
              to='/payment-methods'
              color='inherit'
              underline='none'
            >
              Τρόποι Πληρωμής
            </MuiLink>
            <br />
            <MuiLink
              component={RouterLink}
              to='/shipping-methods'
              color='inherit'
              underline='none'
            >
              Τρόποι Αποστολής
            </MuiLink>
            <br />
            <MuiLink
              component={RouterLink}
              to='/return-policy'
              color='inherit'
              underline='none'
            >
              Πολιτική Επιστροφών
            </MuiLink>
          </Grid>

          {/* Column 3 */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant='h6' fontWeight='bold' gutterBottom>
              Νομικά
            </Typography>
            <MuiLink
              component={RouterLink}
              to='/privacy-policy'
              color='inherit'
              underline='none'
            >
              Πολιτική Απορρήτου
            </MuiLink>
            <br />
            <MuiLink
              component={RouterLink}
              to='/cookie-policy'
              color='inherit'
              underline='none'
            >
              Πολιτική Cookies
            </MuiLink>
            <br />
            <MuiLink
              component={RouterLink}
              to='/terms'
              color='inherit'
              underline='none'
            >
              Όροι Χρήσης
            </MuiLink>
          </Grid>
        </Grid>

        <Divider sx={{ my: 6 }} />

        {/* BOTTOM */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant='h3'
            fontWeight={300}
            sx={{ letterSpacing: '0.08em', mb: 2 }}
          >
            {company?.companyName || 'FASHION'}
          </Typography>

          <Typography variant='body2'>
            © {new Date().getFullYear()}{' '}
            {company?.companyName || 'All rights reserved'}
          </Typography>
        </Box>
      </Box>
    </>
  );
};

export default Footer;
