// frontend\src\pages\Home.tsx
import { Box, Container, Stack, Paper } from "@mui/material";
import LastAnnouncement from "../blog/blogComponents/LastAnnouncement";
import LatestCommodities from "../components/store_components/LatestCommodities";
import { Helmet } from "react-helmet-async";
import { Suspense } from "react";
import LatestCommoditiesSkeleton from "../components/skeletons/LatestCommoditiesSkeleton";
import LastAnnouncementSkeleton from "../components/skeletons/LastAnnouncementSkeleton ";
import { useSettings } from "../context/SettingsContext";
import HomeButtons from "../components/homePageComponents/HomeButtons";
import HomeText from "../components/homePageComponents/Hometext";
import SeoHeadings from "../utils/SeoHeadings";

const Home = () => {
  // const navigate = useNavigate();
  const { settings, loading } = useSettings();

  const homeText1 = settings?.homeTexts?.homeText1;
  const homeText2 = settings?.homeTexts?.homeText2;
  const homeText3 = settings?.homeTexts?.homeText3;
  const heroImage = settings?.branding?.heroImage;
  const isHeroImageActive = settings?.branding?.isHeroImageActive;
  const social = settings?.socialLinks;
  const company = settings?.companyInfo;

  const themeSelectorValue = settings?.branding?.themeSelector?.[0];
  const isThemeEnabled = themeSelectorValue === "TRUE";
  console.log(" from HomeResponsiveWrapper, isThemeEnabled: ", isThemeEnabled);

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
          content="Ανακαλύψτε μοναδικά χειροποίητα κοσμήματα από το εργαστήρι Έχω μια Ιδέα. Δαχτυλίδια, σκουλαρίκια και δημιουργίες με έμπνευση, ποιότητα και προσωπικό χαρακτήρα."
        />
        {company?.email && (
          <meta name="contact:email" content={company.email} />
        )}
        {company?.phone && (
          <meta name="contact:phone_number" content={company.phone} />
        )}

        {social?.facebook && (
          <meta property="article:author" content={social.facebook} />
        )}
        {social?.instagram && (
          <meta name="instagram:site" content={social.instagram} />
        )}
        {social?.tiktok && <meta name="tiktok:site" content={social.tiktok} />}
      </Helmet>

      {/* αυτα είναι αόρατα και είναι για λόγους SEO */}
      <SeoHeadings
        h1="Χειροποίητα κοσμήματα – Έχω μια Ιδέα"
        h2="Δαχτυλίδια, σκουλαρίκια και μοναδικές χειροποίητες δημιουργίες"
      />

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
        τεστ
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

          {/* Buttons */}
          {!isThemeEnabled && <HomeButtons />}
          {/* <HomeButtons /> */}

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
            <HomeText
              homeText={homeText1}
              loading={loading}
              fallbackText="Καλώς ήρθατε στο κατάστημά μας"
            />

            <br />

            <HomeText homeText={homeText2} loading={loading} />
          </Paper>

          {/* Info Section */}
          <Box mt={8} textAlign="center">
            <HomeText
              homeText={homeText3}
              loading={loading}
              fallbackText="Μείνετε συντονισμένοι με τις **Ανακοινώσεις** μας"
            />
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
              <Box sx={{ width: { xs: "100%", l: "50%" } }}>
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
