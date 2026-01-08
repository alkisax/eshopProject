import { Container } from "@mui/material";
import { Helmet } from "react-helmet-async";
import ReactMarkdown from "react-markdown";
import { useSettings } from "../../context/SettingsContext";
import SeoHeadings from "../../utils/SeoHeadings";

const ReturnPolicy = () => {
  const { settings, loading } = useSettings();

  const markdown =
    settings?.staticPages?.returnPolicy ??
    `## Πολιτική Επιστροφών

Το περιεχόμενο δεν έχει οριστεί ακόμα.`;

  return (
    <>
      <Helmet>
        <title>Πολιτική Επιστροφών | Έχω μια Ιδέα</title>
        <meta
          name="description"
          content="Μάθετε για την πολιτική επιστροφών του eshop μας: δικαίωμα υπαναχώρησης, διαδικασία αλλαγών και επιστροφής προϊόντων."
        />
        <link
          rel="canonical"
          href={window.location.origin + window.location.pathname}
        />
      </Helmet>
      <SeoHeadings
        h1="Πολιτική Επιστροφών"
        h2="Δικαίωμα υπαναχώρησης και διαδικασία επιστροφής προϊόντων"
      />

      <Container maxWidth="md" sx={{ py: 6 }}>
        {!loading && <ReactMarkdown>{markdown}</ReactMarkdown>}
      </Container>
    </>
  );
};

export default ReturnPolicy;
