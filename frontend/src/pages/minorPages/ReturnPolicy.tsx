import { Container, Typography, Box, List, ListItem } from "@mui/material";

const ReturnPolicy = () => {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography
        variant="h4"
        gutterBottom
        fontWeight="bold"
        textAlign="center"
      >
        Πολιτική Επιστροφών
      </Typography>

      <Typography variant="body1" gutterBottom>
        Έχετε το δικαίωμα να επιστρέψετε προϊόντα εντός{" "}
        <strong>14 ημερολογιακών ημερών</strong> από την παραλαβή τους, μαζί με
        την πλήρη συσκευασία και τα απαραίτητα έγγραφα (π.χ. απόδειξη αγοράς,
        εγγύηση).
      </Typography>

      <Box mt={3}>
        <Typography variant="h6">Εξαιρέσεις</Typography>
        <Typography>
          Δεν επιστρέφονται προϊόντα που κατασκευάζονται κατόπιν ειδικής
          παραγγελίας (π.χ. βέρες, δαχτυλίδια με ειδικές τροποποιήσεις,
          σκουλαρίκια για λόγους υγιεινής).
        </Typography>
      </Box>

      <Box mt={3}>
        <Typography variant="h6">Προϋποθέσεις Επιστροφής</Typography>
        <List>
          <ListItem>
            <Typography>
              Τα προϊόντα πρέπει να βρίσκονται στην αρχική τους κατάσταση, χωρίς
              χρήση, μόνο για δοκιμή.
            </Typography>
          </ListItem>
          <ListItem>
            <Typography>
              Πρέπει να είναι σωστά συσκευασμένα ώστε να μην υποστούν φθορές κατά
              τη μεταφορά.
            </Typography>
          </ListItem>
          <ListItem>
            <Typography>
              Ο πελάτης φέρει την ευθύνη για την επιλογή σωστού μεγέθους (π.χ.
              δαχτυλιδιών).
            </Typography>
          </ListItem>
        </List>
      </Box>

      <Box mt={3}>
        <Typography variant="h6">Διαδικασία Επιστροφής</Typography>
        <Typography>
          Συστήνεται να επικοινωνήσετε πρώτα με το Τμήμα Εξυπηρέτησης Πελατών.
          Εφόσον η επιστροφή γίνει δεκτή, το ποσό αγοράς (μείον τα μεταφορικά)
          επιστρέφεται στον λογαριασμό σας.
        </Typography>
      </Box>

      <Box mt={3}>
        <Typography variant="h6">Έξοδα</Typography>
        <Typography>
          Αν είστε καταναλωτής και η επιστροφή πληροί τις προϋποθέσεις, τα έξοδα
          μπορεί να καλυφθούν από την εταιρεία. Σε άλλες περιπτώσεις, τα έξοδα
          επιστροφής επιβαρύνουν τον πελάτη.
        </Typography>
      </Box>

      <Box mt={3}>
        <Typography variant="h6">Τρόποι Επιστροφής Χρημάτων</Typography>
        <List>
          <ListItem>
            <Typography>
              <strong>PayPal:</strong> Επιστροφή στο λογαριασμό PayPal.
            </Typography>
          </ListItem>
          <ListItem>
            <Typography>
              <strong>Πιστωτική/Χρεωστική Κάρτα:</strong> Ακύρωση χρέωσης &
              επιστροφή στο λογαριασμό της κάρτας.
            </Typography>
          </ListItem>
          <ListItem>
            <Typography>
              <strong>Τραπεζική Κατάθεση:</strong> Απαραίτητο το IBAN & στοιχεία
              δικαιούχου. Πίστωση εντός 5 εργάσιμων ημερών.
            </Typography>
          </ListItem>
        </List>
      </Box>

      <Box mt={3}>
        <Typography variant="h6">Ακύρωση Παραγγελίας</Typography>
        <Typography>
          Έχετε δικαίωμα ακύρωσης της παραγγελίας εντός{" "}
          <strong>24 ωρών</strong> από την επιβεβαίωση, με e-mail στο{" "}
          <strong>info@*****.gr</strong>.
        </Typography>
      </Box>

      <Box mt={3}>
        <Typography variant="h6">Ενημέρωση</Typography>
        <Typography>
          Η τρέχουσα Πολιτική Επιστροφών αναρτήθηκε την{" "}
          <strong>02/11/2023</strong>. Η εταιρεία διατηρεί το δικαίωμα
          τροποποίησης χωρίς προειδοποίηση.
        </Typography>
      </Box>
    </Container>
  );
};

export default ReturnPolicy;
