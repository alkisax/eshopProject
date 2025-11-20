import { Container, Typography, Box } from "@mui/material";
import { Helmet } from "react-helmet-async";

const AboutPage = () => {
  return (
    <>
      <Helmet>
        <title>Σχετικά με Εμάς | Έχω μια Ιδέα</title>
        <meta
          name="description"
          content="Μάθετε περισσότερα για το ποιοι είμαστε, τη φιλοσοφία μας και την αγάπη μας για το χειροποίητο κόσμημα."
        />
      </Helmet>

      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* <Typography
          variant="h4"
          component="h1"
          fontWeight="bold"
          textAlign="left"
          sx={{ mb: 4 }}
        >
          Σχετικά με Εμάς
        </Typography> */}

        <Typography variant="body1" sx={{ mb: 2 }}>
          Καλώς ήρθατε στο <strong>Έχω Μια Ιδέα</strong> — ένα μικρό δημιουργικό
          εργαστήριο όπου κάθε κόσμημα φτιάχνεται με αγάπη, φροντίδα και
          προσοχή στη λεπτομέρεια. Πιστεύουμε ότι τα χειροποίητα κοσμήματα
          πρέπει να έχουν ψυχή· να κουβαλούν την ενέργεια και τη μοναδικότητα
          του δημιουργού τους.
        </Typography>

        <Typography variant="body1" sx={{ mb: 3 }}>
          Κάθε σχέδιο που βλέπετε στο κατάστημά μας δημιουργείται εξολοκλήρου
          στο χέρι, χρησιμοποιώντας προσεκτικά επιλεγμένα υλικά και τεχνικές που
          δίνουν έμφαση στην ποιότητα και την αισθητική.
        </Typography>

        {/* FAQ Section */}
        <Box sx={{ mt: 4 }}>
          <Typography
            variant="h5"
            component="h2"
            fontWeight="bold"
            sx={{ mb: 2 }}
          >
            Συχνές Ερωτήσεις
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              Τα κοσμήματά σας είναι χειροποίητα;
            </Typography>
            <Typography variant="body1">
              Ναι, όλα τα κοσμήματά μας κατασκευάζονται στο χέρι. Κάθε κομμάτι
              είναι μοναδικό και ενδέχεται να έχει μικρές διαφοροποιήσεις.
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              Από τι υλικά είναι φτιαγμένα;
            </Typography>
            <Typography variant="body1">
              Χρησιμοποιούμε μέταλλα υψηλής ποιότητας (ορείχαλκο, ασήμι 925,
              ανοξείδωτο ατσάλι) και φυσικούς ή ημιπολύτιμους λίθους.
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              Πώς μπορώ να παραγγείλω;
            </Typography>
            <Typography variant="body1">
              Προσθέστε το προϊόν που σας ενδιαφέρει στο καλάθι και
              ολοκληρώστε την παραγγελία σας. Για ειδικές προσαρμογές,
              επικοινωνήστε μαζί μας.
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              Πόσο διαρκεί η αποστολή;
            </Typography>
            <Typography variant="body1">
              Οι παραγγελίες αποστέλλονται σε 1–3 εργάσιμες ημέρες. Η παράδοση
              συνήθως χρειάζεται 2–5 εργάσιμες.
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              Προσφέρετε συσκευασία δώρου;
            </Typography>
            <Typography variant="body1">
              Ναι! Όλα τα κοσμήματα συσκευάζονται σε όμορφη συσκευασία δώρου.
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              Τι γίνεται αν δεν μου ταιριάζει το προϊόν;
            </Typography>
            <Typography variant="body1">
              Δεκτές επιστροφές/αλλαγές εντός 14 ημερών, εφόσον το προϊόν δεν
              έχει χρησιμοποιηθεί.
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              Πώς να φροντίζω τα κοσμήματά μου;
            </Typography>
            <Typography variant="body1">
              Αποφύγετε νερό, αρώματα και χημικά. Φυλάξτε τα σε στεγνό μέρος
              για να διατηρήσουν τη λάμψη τους.
            </Typography>
          </Box>
        </Box>

        <Typography variant="body1" sx={{ mt: 4 }}>
          ✨ Αν δεν βρήκες αυτό που ψάχνεις, επικοινώνησε μαζί μας μέσω
          της φόρμας επικοινωνίας — θα χαρούμε να βοηθήσουμε!
        </Typography>
      </Container>
    </>
  );
};

export default AboutPage;
