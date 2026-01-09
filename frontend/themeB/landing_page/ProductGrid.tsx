// frontend\themeB\ProductGrid.tsx
import React from 'react';
import { Box } from '@mui/material';

import type { CommodityType } from '../../src/types/commerce.types';
import ProductItem from './ProductItem';

interface Props {
  commodities?: CommodityType[];
}

// Grid προϊόντων (UI-only)
const ProductGrid = ({ commodities }: Props) => {
  if (!commodities || commodities.length === 0) return null;

  return (
    <Box
      id='gridTop'
      sx={{
        maxWidth: '1536px', // max-w-screen-2xl
        mx: 'auto',
        mt: 6,
        px: { xs: 2, sm: 3 },
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: {
          xs: 'center',
          xl: 'space-between',
        },
        gap: 3,
      }}
    >
      {commodities.map((commodity) => (
        <ProductItem
          key={commodity._id} // 🔑 σταθερό key
          commodity={commodity}
        />
      ))}
    </Box>
  );
};

export default React.memo(ProductGrid);
