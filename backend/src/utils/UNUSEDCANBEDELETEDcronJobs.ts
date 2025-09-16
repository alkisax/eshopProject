/* eslint-disable no-console */
// βιβλιοθήκη για cron jobs στο Node.js
import cron from 'node-cron';

// Εισάγουμε την δική μας function που διαγράφει comments
import { deleteOldUnapprovedComments } from '../stripe/daos/commodity.dao';

//   Χρησιμοποιούμε την cron.schedule()
//    Το πρώτο string "0 3 * * *" είναι το cron expression:
//    - 0  → λεπτό (minute = 0)
//    - 3  → ώρα (hour = 3 → 03:00 τα ξημερώματα)
//    - *  → κάθε μέρα του μήνα
//    - *  → κάθε μήνα
//    - *  → κάθε μέρα της εβδομάδας
//    Άρα "0 3 * * *" σημαίνει: τρέξε ΚΑΘΕ μέρα στις 03:00
cron.schedule('0 3 * * *', async () => {

  // Καλούμε την function μας με όρισμα 5 → παλιά comments 5 ημερών
  const deleted = await deleteOldUnapprovedComments(5);

  // 5. Γράφουμε στο console log πόσα διαγράφηκαν
  console.log(`🗑 Διαγράφηκαν ${deleted} μη εγκεκριμένα σχόλια (παλαιότερα από 5 μέρες).`);
});