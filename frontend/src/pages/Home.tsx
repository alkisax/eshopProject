// frontend\src\pages\Home.tsx
import {
  Box,
  Button,
  Container,
  Typography,
  Stack,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import BlogHome from "../blog/blogPages/BlogHome";
import LastAnnouncement from "../blog/blogComponents/LastAnnouncement";
import LatestCommodities from "../components/store_components/LatestCommodities";
import { Helmet } from "react-helmet-async";
import { Suspense } from "react";
import LatestCommoditiesSkeleton from "../components/skeletons/LatestCommoditiesSkeleton";
import LastAnnouncementSkeleton from "../components/skeletons/LastAnnouncementSkeleton ";
import { useSettings } from "../context/SettingsContext";
import ReactMarkdown from "react-markdown";

const Home = () => {
  const navigate = useNavigate();
  const { settings, loading } = useSettings();

  const homeText1 = settings?.homeTexts?.homeText1;
  const homeText2 = settings?.homeTexts?.homeText2;
  const homeText3 = settings?.homeTexts?.homeText3;
  const heroImage = settings?.branding?.heroImage;
  const isHeroImageActive = settings?.branding?.isHeroImageActive;

  return (
    <>
      <Helmet>
        {/* για να μην μπει href="http://localhost:5173/"*/}
        <link
          rel="canonical"
          href={window.location.origin + window.location.pathname}
        />
        <title>Shop | Έχω μια Ιδέα</title>
        <meta
          name="description"
          content="Ανακαλύψτε μοναδικά χειροποίητα κοσμήματα από το εργαστήρι μας. Δαχτυλίδια, σκουλαρίκια και δημιουργίες που αφηγούνται ιστορίες."
        />
      </Helmet>

      <Box
        sx={{
          width: "100%",
          backgroundColor: "#f9f7f2",
          display: "flex",
          justifyContent: "center",
          mt: "100px",
          py: { xs: 4, md: 1 }, // padding top/bottom
        }}
      >
        <Container maxWidth="md">
          {heroImage && isHeroImageActive && (
            <Paper
              elevation={0}
              sx={{
                mb: 4,
                overflow: "hidden",
                borderRadius: 3,
              }}
            >
              <Box
                component="img"
                src={heroImage}
                alt="Hero"
                sx={{ width: "100%", display: "block" }}
              />
            </Paper>
          )}

          {/* Hero Section */}
          <Paper
            elevation={4}
            sx={{
              pt: 1, // top μόνο
              px: { xs: 3, md: 6 }, // left + right
              pb: { xs: 3, md: 6 },
              textAlign: "center",
              borderRadius: 4,
              background: "linear-gradient(135deg, #ffffff, #f3f3f3)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            }}
          >
            {/* Subtext */}
            <Typography
              variant="body1"
              color="text.secondary"
              component="div" // οχι "p" για markdown
              sx={{
                maxWidth: 700,
                mx: "auto",
                lineHeight: 1.6,
                fontSize: "1.25rem",
                fontWeight: 400,
              }}
            >
              {!loading && homeText1 ? (
                <ReactMarkdown>{homeText1}</ReactMarkdown>
              ) : (
                "Καλώς ήρθατε στο κατάστημά μας"
              )}
            </Typography>
            <br />

            <Typography
              variant="body1"
              color="text.secondary"
              component="div" // ⚠️ ΟΧΙ "p"
              sx={{
                maxWidth: 700,
                mx: "auto",
                lineHeight: 1.6,
                fontSize: "1.25rem",
                fontWeight: 400,
                textAlign: "center", // ή left/right
              }}
            >
              {!loading && homeText2 && (
                <ReactMarkdown>{homeText2}</ReactMarkdown>
              )}
            </Typography>

            {/* Buttons */}
            <Stack
              direction="column"
              spacing={3}
              justifyContent="center"
              alignItems="center"
              mt={4}
            >
              {/* Κατάστημα Button with background image */}
              <Button
                id="store-btn"
                variant="contained"
                size="large"
                onClick={() => navigate("/store")}
                sx={{
                  px: 5,
                  py: 2,
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                  borderRadius: 3,
                  color: "#f9f9f9", // πιο καθαρό λευκό με ελαφριά ζεστασιά
                  textShadow: "1px 1px 3px rgba(0,0,0,0.6)", // κάνει τα γράμματα να διαβάζονται σε ανοιχτό φόντο
                  width: "100%", // ίδιο με bloghome
                  maxWidth: 280, // ίδιο με bloghome
                  backgroundImage: `url("https://cloud.appwrite.io/v1/storage/buckets/68a01b0400291ae356ca/files/68c958130031815f8bce/view?project=6898d8be0020602b146e")`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  boxShadow: "0 6px 12px rgba(0,0,0,0.25)",
                  "&:hover": {
                    opacity: 0.9,
                    boxShadow: "0 8px 16px rgba(0,0,0,0.35)",
                  },
                }}
              >
                Κατάστημα
              </Button>

              {/* Other two buttons (via BlogHome) */}
              <BlogHome />
            </Stack>
          </Paper>

          {/* Info Section */}
          <Box mt={8} textAlign="center">
            <Typography
              variant="body1"
              color="text.secondary"
              component="div"
              sx={{
                maxWidth: 700,
                mx: "auto",
                lineHeight: 1.6,
                fontSize: "1.25rem",
                fontWeight: 400,
              }}
            >
              <ReactMarkdown>
                {!loading && homeText3
                  ? homeText3
                  : "Μείνετε συντονισμένοι με τις **Ανακοινώσεις** μας"}
              </ReactMarkdown>
            </Typography>
          </Box>

          <Stack
            direction="column"
            spacing={4}
            sx={{ mt: 6, alignItems: "center" }}
          >
            <Suspense fallback={<LatestCommoditiesSkeleton />}>
              <Box sx={{ width: { xs: "100%", md: "50%" } }}>
                <LatestCommodities />
              </Box>
            </Suspense>

            <Suspense fallback={<LastAnnouncementSkeleton />}>
              <Box sx={{ width: { xs: "100%", md: "50%" } }}>
                <LastAnnouncement />
              </Box>
            </Suspense>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export default Home;
