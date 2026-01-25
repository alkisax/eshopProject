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
  lastSyncEvent: number; //προστεθηκε
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
//  Η createContext(...) επιστρέφει ένα object που περιέχει: AdminSocketContext.Provider και επιτρέπει useContext(AdminSocketContext)
export const AdminSocketContext = createContext<AdminSocketContextType | null>(
  null,
);

// τι είναι το μόνο που μας ενδιαφέρει απο εδώ; το μόνο που εξάγει είναι η δημιουργεία ενώς socket με δύο μεταβλητές που είναι κενές για να α. είναι μονο μία και εννιαία σε όλη την εφαρμογή και β. γεμίζουν απο το κάθε component
// lastDelivery        // το τελευταίο socket event που μας νοιάζει
// clearLastDelivery  // τρόπος να το καθαρίσουμε