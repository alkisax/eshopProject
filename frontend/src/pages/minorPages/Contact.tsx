import { Box, Container, Typography, Link } from "@mui/material";

const Contact = () => {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: "bold", textAlign: "center" }}
      >
        Επικοινωνία
      </Typography>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6">Τηλέφωνο</Typography>
        <Link href="tel:+306947733075" underline="hover" color="inherit">
          6947 733 075
        </Link>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6">Email</Typography>
        <Link href="mailto:alkisax@gmail.com" underline="hover" color="inherit">
          alkisax@gmail.com
        </Link>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6">Κατάστημα</Typography>
        <Typography variant="body1">
          Βυζαντίου 40, Κάτω Πατήσια, Αθήνα 11144
        </Typography>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Χάρτης
        </Typography>
        <Box
          component="iframe"
          // στο 4f1 μπορεις να αλλάξεις το αρχικό ζουμ
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12573.416597768728!2d23.72090057798141!3d38.01552245080895!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f1.1!3m3!1m2!1s0x14a1a2e9a7ffe3f3%3A0x9bcb10fa06120c87!2sStefanou%20Vizantiou%2040%2C%20Athina%20111%2044!5e0!3m2!1sen!2sgr!4v1758097084206!5m2!1sen!2sgr"
          sx={{
            mx: "auto",
            display: "block",
            width: "100%",
            height: 500,   // 👈 ελέγχεις εδώ το ύψος
            border: 0,
          }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />
      </Box>
    </Container>
  );
};

export default Contact;
