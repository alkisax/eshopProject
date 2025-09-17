import { Box, Button, Container, Typography, Stack, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import BlogHome from "../blog/blogPages/BlogHome";
import LastAnnouncement from "../blog/blogComponents/LastAnnouncement";
import LatestCommodities from "../components/store_components/LatestCommodities";

const Home = () => {
  const navigate = useNavigate();

  return (
    <>
      <Box
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
      >

      </Box>
      <Container maxWidth="lg" sx={{ py: 8 }}>
    
        {/* Hero Section */}
        <Paper
          elevation={4}
          sx={{
            p: { xs: 3, md: 6 },
            textAlign: "center",
            borderRadius: 4,
            background: "linear-gradient(135deg, #ffffff, #f3f3f3)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          }}
        >
          {/* Banner Image */}


          {/* Subtext */}
          <Typography
            variant="h6"
            color="text.secondary"
            paragraph
            sx={{ maxWidth: 700, mx: "auto", lineHeight: 1.6 }}
          >
            Ένα μικρό εργαστήρι γεμάτο φαντασία, όπου κάθε κόσμημα φτιάχνεται στο χέρι με
            αγάπη και μεράκι. Κάθε δημιουργία είναι μοναδική και αφηγείται τη δική της
            ιστορία.
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            paragraph
            sx={{ maxWidth: 700, mx: "auto", lineHeight: 1.6 }}
          >
            Σας καλωσορίζουμε στον κόσμο μας, με νέες συλλογές, δημιουργικότητα και
            κοσμήματα που ξεχωρίζουν.
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
              width: "100%",   // ίδιο με bloghome
              maxWidth: 280,   // ίδιο με bloghome
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
            variant="h5"
            gutterBottom
            sx={{ fontWeight: "bold", color: "secondary.main" }}
          >
            Τι θα βρείτε στο εργαστήρι μας
          </Typography>
          <Typography
            variant="body1"
            component="p"
            sx={{ maxWidth: 800, mx: "auto", lineHeight: 1.8 }}
          >
            Χειροποίητα κοσμήματα από ασήμι, ορείχαλκο και άλλα υλικά, σχεδιασμένα με
            δημιουργικότητα και φροντίδα. Κάθε κομμάτι είναι φτιαγμένο για να σας
            συνοδεύει καθημερινά και να αναδεικνύει το προσωπικό σας στυλ.
          </Typography>
          <Typography
            variant="body1"
            component="p"
            sx={{ maxWidth: 800, mx: "auto", lineHeight: 1.8 }}
          >
            Μείνετε συντονισμένοι με τις <strong>Ανακοινώσεις</strong> μας για νέες
            συλλογές και ειδικές προσφορές και δείτε τα <strong>Νέα</strong> μας για
            έμπνευση και ιστορίες πίσω από τα κοσμήματα.
          </Typography>
        </Box>

        <Stack
          direction="column"
          spacing={4}
          sx={{ mt: 6, alignItems: "center" }}
        >
          <Box sx={{ width: { xs: "100%", md: "50%" } }}>
            <LatestCommodities />
          </Box>
          <Box sx={{ width: { xs: "100%", md: "50%" } }}>
            <LastAnnouncement />
          </Box>
        </Stack>

      </Container>    
    </>

  );
};

export default Home;
