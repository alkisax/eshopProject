// frontend\themeB\HomeCollectionSection.tsx
import { Box, Typography } from '@mui/material';
import ProductGrid from './ProductGrid';
import ProductGridWrapper from './ProductGridWrapper';
import { removeGreekAccents } from '../../src/utils/removeGreekAccents';

// Section: Home – Our Collection
// UI-only, data έρχεται από ProductGridWrapper
const HomeCollectionSection = () => {
  return (
    <Box>
      {/* Title */}
      <Box
        sx={{
          maxWidth: '1536px', // max-w-screen-2xl
          mx: 'auto',
          mt: 12,
          px: { xs: 2, sm: 3 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography
          variant='h2'
          sx={{
            fontWeight: 300,
            letterSpacing: '0.08em',
            fontSize: { xs: '2.2rem', sm: '2.8rem', md: '3rem' },
          }}
        >
          {removeGreekAccents('Από την συλλογή μας')}
        </Typography>
      </Box>

      {/* Products */}
      <ProductGridWrapper limit={6}>
        <ProductGrid />
      </ProductGridWrapper>
    </Box>
  );
};

export default HomeCollectionSection;
