import { Container, Typography, Box, List, ListItem } from "@mui/material";

const PaymentMethods = () => {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography
        variant="h4"
        gutterBottom
        fontWeight="bold"
        textAlign="center"
      >
        Μέθοδοι Πληρωμής
      </Typography>

      <Typography variant="body1" gutterBottom>
        Στο ηλεκτρονικό μας κατάστημα μπορείτε να επιλέξετε τον τρόπο πληρωμής που
        σας εξυπηρετεί περισσότερο. Όλες οι πληρωμές διεκπεραιώνονται μέσω της
        ασφαλούς εφαρμογής της <strong>Stripe</strong>, η οποία εγγυάται την
        ασφάλεια των συναλλαγών σας.
      </Typography>

      <Box mt={4}>
        <Typography variant="h6">1. Πληρωμή με Κάρτα Online</Typography>
        <Typography>
          Μπορείτε να πληρώσετε online με απόλυτη ασφάλεια χρησιμοποιώντας την κάρτα
          σας. Δεχόμαστε όλες τις major κάρτες, όπως{" "}
          <strong>Visa, Mastercard, Maestro και American Express</strong>.
        </Typography>
      </Box>

      <Box mt={4}>
        <Typography variant="h6">2. Εναλλακτικοί Τρόποι Πληρωμής</Typography>
        <List>
          <ListItem>
            <Typography>
              <strong>Google Pay:</strong> Πληρωμή απευθείας από την εφαρμογή σας.
            </Typography>
          </ListItem>
          <ListItem>
            <Typography>
              <strong>Revolut Pay:</strong> Εύκολες και γρήγορες συναλλαγές με το
              Revolut account σας.
            </Typography>
          </ListItem>
          <ListItem>
            <Typography>
              <strong>PayPal:</strong> Πληρώστε με ασφάλεια μέσω του PayPal
              λογαριασμού σας.
            </Typography>
          </ListItem>
        </List>
      </Box>

      <Box mt={4}>
        <Typography variant="h6">Σημείωση</Typography>
        <Typography>
          Η παραγγελία σας αποστέλλεται μόλις ολοκληρωθεί επιτυχώς η πληρωμή μέσω της
          Stripe. Όλες οι συναλλαγές είναι κρυπτογραφημένες και συμμορφώνονται με τα
          υψηλότερα διεθνή πρότυπα ασφαλείας.
        </Typography>
      </Box>

      <Box mt={6} textAlign="center">
        <Typography variant="body2" color="text.secondary">
          Επιλέξτε τον τρόπο πληρωμής που σας εξυπηρετεί και ολοκληρώστε την αγορά
          σας με ασφάλεια και ευκολία!
        </Typography>
      </Box>
    </Container>
  );
};

export default PaymentMethods;
