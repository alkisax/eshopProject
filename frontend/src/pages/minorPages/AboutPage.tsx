// frontend/src/pages/minorPages/AboutPage.tsx
import { Container } from "@mui/material";
import { Helmet } from "react-helmet-async";
import ReactMarkdown from "react-markdown";
import { useSettings } from "../../context/SettingsContext";
import SeoHeadings from "../../utils/SeoHeadings";

const AboutPage = () => {
  const { settings, loading } = useSettings();

  const markdown =
    settings?.staticPages?.aboutUs ??
    `## Σχετικά με Εμάς

Το περιεχόμενο δεν έχει οριστεί ακόμα.`;

  return (
    <>
      <Helmet>
        <title>Σχετικά με Εμάς | Έχω μια Ιδέα</title>
        <meta
          name="description"
          content="Μάθετε περισσότερα για το ποιοι είμαστε, τη φιλοσοφία μας και την αγάπη μας για το χειροποίητο κόσμημα."
        />
        <link
          rel="canonical"
          href={window.location.origin + window.location.pathname}
        />
      </Helmet>
      <SeoHeadings
        h1="Σχετικά με το Εργαστήρι Έχω μια Ιδέα"
        h2="Φιλοσοφία, έμπνευση και χειροποίητο κόσμημα"
      />

      <Container maxWidth="md" sx={{ py: 6 }}>
        {!loading && <ReactMarkdown>{markdown}</ReactMarkdown>}
      </Container>
    </>
  );
};

export default AboutPage;
