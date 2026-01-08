// frontend\src\utils\SeoHeadings.tsx

import { Box, Typography } from '@mui/material';
import { visuallyHidden } from '@mui/utils';

/*
  SEO-only headings
  - Χρησιμοποιείται όταν το visible UI ΔΕΝ έχει H1/H2
  - Ασφαλές για SEO & accessibility
*/

interface SeoHeadingsProps {
  h1: string;
  h2?: string;
}

const SeoHeadings = ({ h1, h2 }: SeoHeadingsProps) => {
  return (
    <Box component="header">
      <Typography component="h1" sx={visuallyHidden}>
        {h1}
      </Typography>

      {h2 && (
        <Typography component="h2" sx={visuallyHidden}>
          {h2}
        </Typography>
      )}
    </Box>
  );
};

export default SeoHeadings;
