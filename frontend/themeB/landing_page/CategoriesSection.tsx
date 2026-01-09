// frontend/themeB/CategoriesSection.tsx
import { Box, Typography } from '@mui/material';
import CategoryItem from './CategoryItem';

const CategoriesSection = () => {
  return (
    <Box
      sx={{
        maxWidth: '1536px',
        mx: 'auto',
        mt: 12,
        px: { xs: 2, sm: 3 },
      }}
    >
      <Typography
        variant='h2'
        sx={{
          fontWeight: 300,
          letterSpacing: '0.08em',
          fontSize: { xs: '2.2rem', sm: '2.8rem', md: '3rem' },
          mb: 6,
        }}
      >
        Our Categories
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: {
            xs: 'center',
            xl: 'space-between',
          },
          gap: 4,
        }}
      >
        <CategoryItem title='ΚΟΛΙΕ' slug='Κολιέ' />
        <CategoryItem title='ΒΡΑΧΙΟΛΙΑ' slug='Βραχιόλι' />
        <CategoryItem title='ΣΚΟΥΛΑΡΙΚΙΑ' slug='Σκουλαρίκια' />
        <CategoryItem title='ΔΑΧΤΥΛΙΔΙΑ' slug='Δαχτυλίδι' />
      </Box>
    </Box>
  );
};

export default CategoriesSection;
