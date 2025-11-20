import { Container, Typography, Box, List, ListItem, Link } from "@mui/material";
import { Helmet } from "react-helmet-async";

const CookiesPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Πολιτική Cookies | Έχω μια Ιδέα</title>
        <meta
          name="description"
          content="Μάθετε πώς χρησιμοποιούμε cookies για να βελτιώσουμε την εμπειρία σας στο eshop μας και να σας παρέχουμε προσωποποιημένες υπηρεσίες."
        />
        <link rel="canonical" href={window.location.origin + window.location.pathname} />
      </Helmet>

      <Container maxWidth="md" sx={{ py: 6 }}>
        {/* <Typography
          variant="h4"
          component="h1"
          gutterBottom
          fontWeight="bold"
          textAlign="center"
        >
          Πολιτική Cookies
        </Typography> */}

        <Typography variant="body1" gutterBottom>
          Όπως τα περισσότερα sites, έτσι κι εμείς χρησιμοποιούμε cookies ώστε να
          έχουμε πρόσβαση σε ορισμένες πληροφορίες και να σας προσφέρουμε
          λειτουργικές υπηρεσίες κάθε φορά που περιηγείστε στο ηλεκτρονικό μας
          κατάστημα.
        </Typography>

        <Typography variant="body1" gutterBottom>
          Τα cookies είναι μικρά αλφαριθμητικά αρχεία που αποθηκεύονται στη
          συσκευή σας μέσω του browser. Δεν προκαλούν βλάβες στη συσκευή ή στα
          αρχεία σας και τα περισσότερα διαγράφονται όταν αποχωρείτε από τη
          σελίδα μας.
        </Typography>

        <Box mt={3}>
          <Typography variant="h6">Τύποι Cookies</Typography>
          <List>
            <ListItem>
              <Typography>
                <strong>Απολύτως Απαραίτητα:</strong> Απαραίτητα για τη σωστή
                λειτουργία του site. Δεν αναγνωρίζουν την ταυτότητά σας.
              </Typography>
            </ListItem>
            <ListItem>
              <Typography>
                <strong>Cookies Λειτουργικότητας:</strong> Θυμούνται τις επιλογές
                σας (π.χ. στοιχεία σύνδεσης) και παρέχουν προσωποποιημένες
                λειτουργίες.
              </Typography>
            </ListItem>
            <ListItem>
              <Typography>
                <strong>Cookies Επιδόσεων / Analytics:</strong> Συλλέγουν ανώνυμες
                πληροφορίες για τον τρόπο χρήσης του site (σελίδες που βλέπετε
                συχνότερα, σφάλματα κ.λπ.), ώστε να βελτιώνουμε τις υπηρεσίες μας.
              </Typography>
            </ListItem>
            <ListItem>
              <Typography>
                <strong>Cookies Στόχευσης / Διαφήμισης:</strong> Χρησιμοποιούνται
                για εξατομικευμένο περιεχόμενο και στοχευμένες διαφημίσεις.
              </Typography>
            </ListItem>
          </List>
        </Box>

        <Box mt={3}>
          <Typography variant="h6">Διαχείριση Cookies</Typography>
          <Typography>
            Μέσα από τις ρυθμίσεις του browser σας μπορείτε να:
          </Typography>
          <List>
            <ListItem>
              <Typography>Εμποδίσετε την εγκατάσταση νέων cookies.</Typography>
            </ListItem>
            <ListItem>
              <Typography>Ενεργοποιήσετε ειδοποίηση πριν την αποθήκευση cookie.</Typography>
            </ListItem>
            <ListItem>
              <Typography>Διαγράψετε τα ήδη αποθηκευμένα cookies στη συσκευή σας.</Typography>
            </ListItem>
          </List>

          <Typography mt={2}>
            Για περισσότερες πληροφορίες για το πώς να διαχειριστείτε τα cookies στο browser, 
            παρακαλώ ανατρέξτε στα ακόλουθα link (οι διευθύνσεις και το περιεχόμενό τους ενδέχεται να τροποποιούνται):
          </Typography>

        <Typography mt={1} color="black">
          <Link
            href="https://support.mozilla.org/el/kb/energopoihsh-apenergopoihsh-cookies-parakoloy8hsh-protimhsewn"
            target="_blank"
            rel="noopener"
            color="inherit"
            underline="hover"
          >
            Firefox
          </Link>{" "}
          |{" "}
          <Link
            href="https://support.google.com/chrome/answer/95647"
            target="_blank"
            rel="noopener"
            color="inherit"
            underline="hover"
          >
            Chrome
          </Link>{" "}
          |{" "}
          <Link
            href="https://support.apple.com/kb/ph19214?locale=el_GR"
            target="_blank"
            rel="noopener"
            color="inherit"
            underline="hover"
          >
            Safari
          </Link>{" "}
          |{" "}
          <Link
            href="https://support.microsoft.com/en-us/help/17442/windows-internet-explorer-delete-manage-cookies"
            target="_blank"
            rel="noopener"
            color="inherit"
            underline="hover"
          >
            Internet Explorer / Microsoft Edge
          </Link>
        </Typography>

        </Box>
        <Box mt={3}>
          <Typography variant="body1">
            Σημειώστε ότι η απενεργοποίηση cookies μπορεί να περιορίσει τη σωστή
            λειτουργία του site και να επηρεάσει αρνητικά την εμπειρία σας.
          </Typography>
        </Box>
      </Container>    
    </>

  );
};

export default CookiesPolicy;
