// frontend/themeB/CategoryItem.tsx
import { Box, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useContext } from 'react';
import { VariablesContext } from '../../src/context/VariablesContext';
import { useCategoryPreview } from './useCategoryPreview';

interface Props {
  title: string;
  slug: string;
}

const CategoryItem = ({ title, slug }: Props) => {
  const { url } = useContext(VariablesContext);
  const { image } = useCategoryPreview(url, slug);

  return (
    <Box
      component={RouterLink}
      to={`/store?cat=${slug}`}
      sx={{
        width: { xs: 300, sm: 400, lg: 600 },
        height: { xs: 300, sm: 400 },
        position: 'relative',
        overflow: 'hidden',
        textDecoration: 'none',
      }}
    >
      {/* Background image */}
      {image && (
        <Box
          component='img'
          src={image}
          alt={title}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      )}

      {/* Overlay */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          height: 64,
          backgroundColor: 'secondary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          sx={{
            color: '#fff',
            letterSpacing: '0.05em',
            fontSize: '1.2rem',
          }}
        >
          {title}
        </Typography>
      </Box>
    </Box>
  );
};

export default CategoryItem;
