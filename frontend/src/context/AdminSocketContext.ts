// frontend\src\context\AdminSocketContext.ts
import { createContext } from "react";

export type TxCreatedPayload = {
  transactionId: string;
  status: string;
  sessionId: string;
  createdAt: string;
};

/*
Το context που μοιράζεται σε ΟΛΟ το admin panel.
- lastDelivery:
Κρατάει την τελευταία COD παραγγελία που έφτασε
μέσω socket (ή null αν δεν υπάρχει ενεργή ειδοποίηση).
- clearLastDelivery:AC
Καθαρίζει το lastDelivery αφού ο admin
αποδεχτεί / απορρίψει την παραγγελία
ή κλείσει το alert.
 */
export type AdminSocketContextType = {
  lastDelivery: TxCreatedPayload | null;
  clearLastDelivery: () => void;
};

/*
React Context για admin-level socket events.
Δημιουργείται κενό (null) και γεμίζει από
τον AdminSocketProvider.
Όλα τα admin components μπορούν να κάνουν
subscribe σε socket events χωρίς να ανοίγουν
δικό τους socket.
 */
export const AdminSocketContext = createContext<AdminSocketContextType | null>(
  null,
);
