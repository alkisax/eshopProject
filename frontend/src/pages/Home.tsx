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

const Home = () => {
  const navigate = useNavigate();

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

      {/* <Box
        sx={{
          width: "100%",
          height: { xs: 200, md: 350 }, // responsive height
          backgroundImage: `url(https://cloud.appwrite.io/v1/storage/buckets/68a01b0400291ae356ca/files/68c955c9001658ee7294/view?project=6898d8be0020602b146e)`, // put the file inside public/
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          textAlign: "center",
        }}
      > */}
      
      {/* αυτό είναι ένα αόρατο h1 που προστέθηκε για λόγους seo */}
      {/* <Typography
          variant="h1"
          sx={{
            fontSize: { xs: "1.8rem", md: "3rem" },
            fontWeight: "bold",
            textShadow: "0 2px 6px rgba(0,0,0,0.6)", 
            display: { xs: "none" }, // hide for users if you want
          }}
        >
          Έχω μια Ιδέα  – Χειροποίητα Κοσμήματα
        </Typography>   
      </Box> */}

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
              component="p"
              sx={{
                maxWidth: 700,
                mx: "auto",
                lineHeight: 1.6,
                fontSize: "1.25rem",
                fontWeight: 400,
              }}
            >
Γεια σας είμαι η Ελένη ή αλλιώς ''Έχω μια ιδέα...". Κατασκευάζω κοσμήματα από μέταλλο. Ξεκίνησα να ασχολούμαι με την κατασκευή κοσμήματος όταν παρακολούθησα σεμινάρια χειροποίητου κοσμήματος, τελείωσα και την επαγγελματική σχολή αργυροχρυσοχοϊας και έτσι σιγά- σιγά δημιουργήθηκε το "Έχω μια ιδέα".

Σχεδόν κάθε φορά και ιδιαίτερα τα πρώτα χρόνια η πρώτη λέξη που ερχόταν στο μυαλό μου πριν ξεκινήσω να κατασκευάζω κάτι νέο είναι ''Έχω μια ιδέα...!!!''. Νομίζω αποδίδει και συμπυκνώνει όλο τον ενθουσιασμό και την ανυπομονησία για κάθε νέα ιδέα που πρόκειται να πάρει μορφή. Έτσι αποφάσισα να ονομάσω και το κατάστημά μου και ελπίζω να συνεχίσω με τον ίδιο ενθουσιασμό και τα επόμενα χρόνια! Δεν θα σας πω από τι εμπνέομαι γιατί κι εγώ δεν έχω μία απάντηση γι' αυτό, το ψάχνω ακόμα!

Μαζί στην κατασκευή κοσμήματος ο Βικ. όχι μόνο βοηθός αλλά κατασκευαστής και σχεδιαστής, η βοήθειά του πολύτιμη...

Ευχαριστώ που επισκεφθήκατε το κατάστημα μου! Μην διστάσετε να με ρωτήσετε για ότι πληροφορία χρειαστείτε.
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              component="p"
              sx={{
                maxWidth: 700,
                mx: "auto",
                lineHeight: 1.6,
                fontSize: "1.25rem",
                fontWeight: 400,
              }}
            >
              Σας καλωσορίζουμε στον κόσμο μας, με νέες συλλογές,
              δημιουργικότητα και κοσμήματα που ξεχωρίζουν.
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
              component="p"
              sx={{
                maxWidth: 700,
                mx: "auto",
                lineHeight: 1.6,
                fontSize: "1.25rem",
                fontWeight: 400,
              }}
            >
              Τι θα βρείτε στο εργαστήρι μας
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              component="p"
              sx={{
                maxWidth: 700,
                mx: "auto",
                lineHeight: 1.6,
                fontSize: "1.25rem",
                fontWeight: 400,
              }}
            >
              Χειροποίητα κοσμήματα από ασήμι, ορείχαλκο και άλλα υλικά,
              σχεδιασμένα με δημιουργικότητα και φροντίδα. Κάθε κομμάτι είναι
              φτιαγμένο για να σας συνοδεύει καθημερινά και να αναδεικνύει το
              προσωπικό σας στυλ.
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              component="p"
              sx={{
                maxWidth: 700,
                mx: "auto",
                lineHeight: 1.6,
                fontSize: "1.25rem",
                fontWeight: 400,
              }}
            >
              Μείνετε συντονισμένοι με τις <strong>Ανακοινώσεις</strong> μας για
              νέες συλλογές και ειδικές προσφορές και δείτε τα{" "}
              <strong>Νέα</strong> μας για έμπνευση και ιστορίες πίσω από τα
              κοσμήματα.
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
