// frontend/src/pages/minorPages/PrivacyPolicy.tsx
import { Container } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import ReactMarkdown from 'react-markdown';
import { useSettings } from '../../context/SettingsContext';

const PrivacyPolicy = () => {
  const { settings, loading } = useSettings();

  const markdown =
    settings?.staticPages?.privacyPolicy ??
    `## Πολιτική Απορρήτου

Το περιεχόμενο δεν έχει οριστεί ακόμα.`;

  return (
    <>
      <Helmet>
        <title>Πολιτική Απορρήτου | Έχω μια Ιδέα</title>
        <meta
          name='description'
          content='Η Πολιτική Απορρήτου μας εξηγεί πώς συλλέγουμε, χρησιμοποιούμε και προστατεύουμε τα προσωπικά σας δεδομένα σύμφωνα με τον GDPR.'
        />
        <link
          rel='canonical'
          href={window.location.origin + window.location.pathname}
        />
      </Helmet>

      <Container maxWidth='md' sx={{ py: 6 }}>
        {!loading && <ReactMarkdown>{markdown}</ReactMarkdown>}
      </Container>
    </>
  );
};

export default PrivacyPolicy;
