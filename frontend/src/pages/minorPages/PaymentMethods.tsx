// frontend/src/pages/minorPages/PaymentMethods.tsx
import { Container } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import ReactMarkdown from 'react-markdown';
import { useSettings } from '../../context/SettingsContext';

const PaymentMethods = () => {
  const { settings, loading } = useSettings();

  const markdown =
    settings?.staticPages?.paymentMethods ??
    `## Τρόποι Πληρωμής

Το περιεχόμενο δεν έχει οριστεί ακόμα.`;

  return (
    <>
      <Helmet>
        <title>Τρόποι Πληρωμής | Έχω μια Ιδέα</title>
        <meta
          name='description'
          content='Δείτε όλους τους διαθέσιμους τρόπους πληρωμής για τις αγορές σας στο eshop μας.'
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

export default PaymentMethods;
