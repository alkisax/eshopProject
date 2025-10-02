import { Container, Typography, Box, List, ListItem } from "@mui/material";
import { Helmet } from "react-helmet-async";

const ShippingMethods = () => {
  return (
    <>
      <Helmet>
        <title>Μέθοδοι Αποστολής | Έχω μια Ιδέα</title>
        <meta
          name="description"
          content="Πληροφορίες για μεθόδους αποστολής, χρεώσεις και χρόνους παράδοσης για παραγγελίες στο eshop μας."
        />
        <link rel="canonical" href={window.location.origin + window.location.pathname} />
      </Helmet>

      <Container maxWidth="md" sx={{ py: 6 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          fontWeight="bold"
          textAlign="center"
        >
          Μέθοδοι Αποστολής
        </Typography>

        <Typography variant="body1" gutterBottom>
          Αποστολές εντός & εκτός Αττικής.
        </Typography>

        <Box mt={3}>
          <Typography variant="h6">Χρεώσεις Αποστολής (Εντός Ελλάδος)</Typography>
          <List>
            <ListItem>
              <Typography>Με Γενική Ταχυδρομική: 3.00€</Typography>
            </ListItem>
            <ListItem>
              <Typography>Με Box Now: 1.50€</Typography>
            </ListItem>
          </List>
        </Box>

        <Box mt={3}>
          <Typography variant="h6">Χρόνος Παράδοσης</Typography>
          <Typography>
            Οι αποστολές προϊόντων γίνονται εντός και εκτός Ελλάδος σύμφωνα με τους
            όρους και προϋποθέσεις της εφαρμοστέας νομοθεσίας. Αν το προϊόν είναι
            διαθέσιμο, καταβάλλουμε κάθε δυνατή προσπάθεια ώστε οι αποστολές να
            εκτελούνται εντός <strong>48-92 ωρών</strong>. Σε κάθε περίπτωση, η
            εταιρεία οφείλει να εκπληρώσει την παραγγελία εντός 30 ημερών.
          </Typography>
        </Box>

        <Box mt={3}>
          <Typography variant="h6">Πιθανοί Λόγοι Καθυστέρησης</Typography>
          <List>
            <ListItem>
              <Typography>
                (α) Καθυστέρηση από τον προμηθευτή, τελωνείο ή μεταφορά.
              </Typography>
            </ListItem>
            <ListItem>
              <Typography>(β) Το προϊόν έχει καταργηθεί και δεν είναι διαθέσιμο.</Typography>
            </ListItem>
            <ListItem>
              <Typography>(γ) Ακραία καιρικά φαινόμενα, απεργίες ή ανωτέρα βία.</Typography>
            </ListItem>
            <ListItem>
              <Typography>
                (δ) Αδυναμία επικοινωνίας λόγω λανθασμένων ή μη ενημερωμένων στοιχείων.
              </Typography>
            </ListItem>
          </List>
        </Box>

        <Box mt={3}>
          <Typography variant="h6">Μη Διαθεσιμότητα</Typography>
          <Typography>
            Αν λείπει μέρος της παραγγελίας, το υπόλοιπο εκτελείται κανονικά, εκτός αν
            δηλώσετε ότι η μερική εκτέλεση δεν εξυπηρετεί τις ανάγκες σας, οπότε η
            παραγγελία ακυρώνεται.
          </Typography>
        </Box>

        <Box mt={3}>
          <Typography variant="h6">Ασφάλεια Συσκευασίας</Typography>
          <Typography>
            Όλες οι παραγγελίες αποστέλλονται σφραγισμένες. Εάν παραλάβετε ανοιχτό ή
            κατεστραμμένο πακέτο, μην το αποδεχτείτε και επικοινωνήστε άμεσα μαζί μας
            στο <strong>info@*****.gr</strong>.
          </Typography>
        </Box>

        <Box mt={3}>
          <Typography variant="h6">Ώρες Παράδοσης</Typography>
          <Typography>
            Οι παραδόσεις γίνονται με courier καθημερινά 09:00 – 17:00. Αν θέλετε
            συγκεκριμένη ώρα, σημειώστε το στα σχόλια της παραγγελίας σας (χωρίς
            δέσμευση από την courier).
          </Typography>
        </Box>

        <Box mt={3}>
          <Typography variant="h6">Ενδεικτικοί Χρόνοι Παράδοσης</Typography>
          <List>
            <ListItem>
              <Typography>Χερσαίοι Προορισμοί: 1-2 εργάσιμες ημέρες</Typography>
            </ListItem>
            <ListItem>
              <Typography>Νησιωτικοί Προορισμοί: 1-3 εργάσιμες ημέρες</Typography>
            </ListItem>
            <ListItem>
              <Typography>Δυσπρόσιτες Περιοχές: 1-4 εργάσιμες ημέρες</Typography>
            </ListItem>
          </List>
        </Box>

        <Box mt={3}>
          <Typography variant="h6">Κύπρος</Typography>
          <Typography>
            Τα προϊόντα αποστέλλονται με Γενική Ταχυδρομική. Χρόνος παράδοσης{" "}
            <strong>5-7 εργάσιμες ημέρες</strong>. Κόστος αποστολής{" "}
            <strong>10€</strong>.
          </Typography>
        </Box>
      </Container>    
    </>

  );
};

export default ShippingMethods;
