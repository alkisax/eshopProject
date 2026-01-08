// frontend\src\components\homePageComponents\Hometext.tsx

import { Typography } from '@mui/material';
import ReactMarkdown from 'react-markdown';

type HomeTextProps = {
  homeText?: string;
  loading: boolean;
  fallbackText?: string;
};

const HomeText = ({
  homeText,
  loading,
  fallbackText = '',
}: HomeTextProps) => {
  if (loading && !fallbackText) return null;

  return (
    <Typography
      variant='body1'
      color='text.secondary'
      component='div' // όχι p (markdown)
      sx={{
        maxWidth: 700,
        mx: 'auto',
        lineHeight: 1.6,
        fontSize: '1.25rem',
        fontWeight: 400,
        textAlign: 'center',
      }}
    >
      {!loading && homeText ? (
        <ReactMarkdown>{homeText}</ReactMarkdown>
      ) : (
        fallbackText
      )}
    </Typography>
  );
};

export default HomeText;