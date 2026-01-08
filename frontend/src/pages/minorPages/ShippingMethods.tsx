// frontend\src\pages\minorPages\ShippingMethods.tsx
import { Container } from "@mui/material";
import { Helmet } from "react-helmet-async";
import ReactMarkdown from "react-markdown";
import { useSettings } from "../../context/SettingsContext";
import SeoHeadings from "../../utils/SeoHeadings";

const ShippingMethods = () => {
  const { settings, loading } = useSettings();

  const markdown =
    settings?.staticPages?.shippingMethods ??
    `## Μέθοδοι Αποστολής

Το περιεχόμενο δεν έχει οριστεί ακόμα.`;

  return (
    <>
      <Helmet>
        <title>Μέθοδοι Αποστολής | Έχω μια Ιδέα</title>
        <meta
          name="description"
          content="Πληροφορίες για μεθόδους αποστολής, χρεώσεις και χρόνους παράδοσης."
        />
        <link
          rel="canonical"
          href={window.location.origin + window.location.pathname}
        />
      </Helmet>
      <SeoHeadings
        h1="Μέθοδοι Αποστολής"
        h2="Courier, παραλαβή από κατάστημα και χρόνοι παράδοσης"
      />

      <Container maxWidth="md" sx={{ py: 6 }}>
        {!loading && <ReactMarkdown>{markdown}</ReactMarkdown>}
      </Container>
    </>
  );
};

export default ShippingMethods;
