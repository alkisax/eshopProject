import { Container, Typography, Box, List, ListItem } from "@mui/material";
import { Helmet } from "react-helmet-async";

const PrivacyPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Πολιτική Απορρήτου | Έχω μια Ιδέα</title>
        <meta
          name="description"
          content="Η Πολιτική Απορρήτου μας εξηγεί πώς συλλέγουμε, χρησιμοποιούμε και προστατεύουμε τα προσωπικά σας δεδομένα σύμφωνα με τον GDPR."
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
          Πολιτική Απορρήτου
        </Typography> */}

        <Typography variant="body1" gutterBottom>
          Στο ***** (https://*****/), αναγνωρίζουμε τη σημασία της προστασίας των
          προσωπικών σας δεδομένων. Η παρούσα Πολιτική Απορρήτου περιγράφει τον τρόπο
          με τον οποίο συλλέγουμε, επεξεργαζόμαστε και χρησιμοποιούμε τα προσωπικά σας
          δεδομένα, καθώς και τα δικαιώματά σας όσον αφορά αυτά.
        </Typography>

        <Box mt={4}>
          <Typography variant="h6">2. Ποια δεδομένα συλλέγουμε;</Typography>
          <List>
            <ListItem>
              <Typography>
                <strong>Δεδομένα που μας παρέχετε:</strong> Όταν δημιουργείτε λογαριασμό,
                πραγματοποιείτε αγορές ή επικοινωνείτε μαζί μας, μπορεί να μας δώσετε
                όνομα, διεύθυνση, email, τηλέφωνο, στοιχεία πληρωμής κ.α.
              </Typography>
            </ListItem>
            <ListItem>
              <Typography>
                <strong>Δεδομένα χρήσης:</strong> Σελίδες που επισκέπτεστε, προϊόντα που
                βλέπετε ή αγοράζετε κ.α.
              </Typography>
            </ListItem>
            <ListItem>
              <Typography>
                <strong>Τεχνικά δεδομένα:</strong> IP, λειτουργικό σύστημα, browser κ.α.
              </Typography>
            </ListItem>
          </List>
        </Box>

        <Box mt={4}>
          <Typography variant="h6">3. Πώς χρησιμοποιούμε τα δεδομένα σας;</Typography>
          <Typography>
            Για παροχή υπηρεσιών (διαχείριση λογαριασμού, αγορές, υποστήριξη), βελτίωση
            εμπειρίας (αναλύσεις, marketing), και προστασία νόμιμων συμφερόντων
            (αποτροπή απάτης, συμμόρφωση με νόμο).
          </Typography>
        </Box>

        <Box mt={4}>
          <Typography variant="h6">4. Με ποιους μοιραζόμαστε τα δεδομένα σας;</Typography>
          <Typography>
            Με συνεργάτες (π.χ. courier) και με αρμόδιες αρχές, μόνο όπου είναι
            απαραίτητο.
          </Typography>
        </Box>

        <Box mt={4}>
          <Typography variant="h6">5. Πώς διασφαλίζουμε τα δεδομένα σας;</Typography>
          <Typography>
            Χρησιμοποιούμε κρυπτογράφηση, firewalls και άλλα τεχνικά/οργανωτικά μέτρα
            ασφαλείας.
          </Typography>
        </Box>

        <Box mt={4}>
          <Typography variant="h6">6. Ποια είναι τα δικαιώματά σας;</Typography>
          <List>
            <ListItem>Δικαίωμα πρόσβασης</ListItem>
            <ListItem>Δικαίωμα διόρθωσης</ListItem>
            <ListItem>Δικαίωμα διαγραφής</ListItem>
            <ListItem>Δικαίωμα περιορισμού</ListItem>
            <ListItem>Δικαίωμα φορητότητας</ListItem>
            <ListItem>Δικαίωμα εναντίωσης</ListItem>
            <ListItem>Δικαίωμα μη λήψης αυτοματοποιημένων αποφάσεων</ListItem>
          </List>
        </Box>

        <Box mt={4}>
          <Typography variant="h6">7. Επικοινωνία</Typography>
          <Typography>
            Για ερωτήματα/αιτήματα σχετικά με προσωπικά δεδομένα, επικοινωνήστε στο
            email: *****@*****.***
          </Typography>
        </Box>

        <Box mt={4}>
          <Typography variant="h6">8. Αλλαγές στην Πολιτική Απορρήτου</Typography>
          <Typography>
            Η Πολιτική δύναται να τροποποιηθεί ανά πάσα στιγμή. Σας συνιστούμε να
            ελέγχετε τακτικά για ενημερώσεις.
          </Typography>
        </Box>

        <Box mt={4}>
          <Typography variant="h6">9. Cookies</Typography>
          <Typography>
            Το ***** χρησιμοποιεί cookies για να βελτιώσει την εμπειρία σας. Δείτε την
            Πολιτική Cookies: https://*****/politiki-cookies/
          </Typography>
        </Box>

        <Box mt={4}>
          <Typography variant="h6">
            10. Αρμόδια Αρχή Προστασίας Δεδομένων
          </Typography>
          <Typography>
            Website: https://www.dpa.gr/ <br />
            Τηλέφωνο: +30 210 6475600
          </Typography>
        </Box>

        <Box mt={4}>
          <Typography variant="h6">11. Τελικές διατάξεις</Typography>
          <Typography>
            Η Πολιτική διέπεται από το ελληνικό δίκαιο. Αρμόδια δικαστήρια: Αθήνας.
          </Typography>
        </Box>
      </Container>    
    </>

  );
};

export default PrivacyPolicy;
