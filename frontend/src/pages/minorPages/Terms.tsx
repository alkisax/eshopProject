// frontend/src/pages/minorPages/Terms.tsx
import { Container } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import ReactMarkdown from 'react-markdown';
import { useSettings } from '../../context/SettingsContext';

const Terms = () => {
  const { settings, loading } = useSettings();

  const markdown =
    settings?.staticPages?.termsOfUse ??
    `## Όροι Χρήσης

Το περιεχόμενο δεν έχει οριστεί ακόμα.`;

  return (
    <>
      <Helmet>
        <title>Όροι Χρήσης | Έχω μια Ιδέα</title>
        <meta
          name="description"
          content="Διαβάστε τους όρους χρήσης και πώλησης του eshop μας. Η χρήση της ιστοσελίδας προϋποθέτει την αποδοχή των όρων."
        />
        <link
          rel="canonical"
          href={window.location.origin + window.location.pathname}
        />
      </Helmet>

      <Container maxWidth="md" sx={{ py: 6 }}>
        {!loading && <ReactMarkdown>{markdown}</ReactMarkdown>}
      </Container>
    </>
  );
};

export default Terms;
