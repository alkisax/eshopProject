// frontend/src/components/store_components/AdminPanelInstructions.tsx
import { Paper, Typography, Stack } from "@mui/material";

const AdminPanelInstructions = () => {
  return (
    <>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Καλωσήρθες στο Admin Panel
        </Typography>

        <Typography variant="body2" sx={{ mb: 2 }}>
          Το Admin Panel είναι το κεντρικό εργαλείο διαχείρισης του eShop. 
          Από εδώ ο διαχειριστής μπορεί να παρακολουθεί, να ενημερώνει και να 
          επεμβαίνει σε όλα τα τμήματα της πλατφόρμας: προϊόντα, κατηγορίες, 
          παραγγελίες, χρήστες, σχόλια, αρχεία και περιεχόμενο blog.
          Χρησιμοποίησε το μενού αριστερά για να μεταφερθείς στα επιμέρους panels.
        </Typography>

        <Stack spacing={1}>

          <Typography variant="body2">
            • <b>Users</b> – Προβολή και διαχείριση των εγγεγραμμένων χρηστών. 
              Έλεγχος ρόλων και βασικών στοιχείων λογαριασμού.
          </Typography>

          <Typography variant="body2">
            • <b>Participants</b> – Προβολή όλων των “participants”, δηλαδή 
              των πραγματικών αγοραστών (logged-in ή επισκεπτών). 
              Κάθε αγορά αντιστοιχεί σε έναν participant.
          </Typography>

          <Typography variant="body2">
            • <b>Transactions</b> – Προβολή παραγγελιών και διαχείριση 
              της κατάστασής τους (processed/unprocessed). 
              Δυνατότητα αποστολής email επιβεβαίωσης.
          </Typography>

          <Typography variant="body2">
            • <b>Commodities</b> – Πλήρης διαχείριση προϊόντων: 
              επεξεργασία στοιχείων, τιμών, stock, εικόνων, ενεργοποίησης/απενεργοποίησης 
              και δημιουργία vector embeddings για AI προτάσεις.
          </Typography>

          <Typography variant="body2">
            • <b>Categories</b> – Διαχείριση ιεραρχίας κατηγοριών (γονικές/θυγατρικές), 
              ενεργοποίηση και χαρακτηρισμός ως tags.
          </Typography>

          <Typography variant="body2">
            • <b>Comments</b> – Έλεγχος σχολίων χρηστών στα προϊόντα. 
              Έγκριση/απόρριψη, διαγραφή και ενεργοποίηση AI moderation.
          </Typography>

          <Typography variant="body2">
            • <b>Excel Tools</b> – Μαζική εισαγωγή, συγχρονισμός και εξαγωγή προϊόντων. 
              Υποστήριξη Excel αρχείων και προαιρετικού ZIP με εικόνες.
          </Typography>

          <Typography variant="body2">
            • <b>Uploads</b> – Διαχείριση αρχείων που έχουν ανέβει μέσω Multer (legacy).
          </Typography>

          <Typography variant="body2">
            • <b>Cloud Uploads</b> – Προβολή, διαγραφή και upload αρχείων στο Appwrite Storage.
          </Typography>

          <Typography variant="body2">
            • <b>Blog & Posts</b> – Διαχείριση άρθρων blog, επεξεργασία μέσω EditorJS, 
              σύνδεση με subpages και “pinned” αναρτήσεις.
          </Typography>

          <Typography variant="body2">
            • <b>Analytics</b> – Στατιστικά πωλήσεων, επισκεψιμότητας και δραστηριότητας καταστήματος.
          </Typography>

          <Typography variant="body2">
            • <b>Clear Old</b> – Εργαλεία καθαρισμού παλιών carts, transactions, guest participants 
              και μη εγκεκριμένων σχολίων για μείωση άχρηστου δεδομένου στη βάση.
          </Typography>

          <Typography variant="body2" sx={{ mt: 2 }}>
            ➤ Επίλεξε ένα panel από το sidebar για να ξεκινήσεις.
          </Typography>
        </Stack>
      </Paper>
    </>
  );
};

export default AdminPanelInstructions;
