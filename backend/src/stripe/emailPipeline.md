οταν κάνω toggle ένα transaction
```ts
// backend\src\stripe\routes\transaction.routes.ts
// αυτο είναι σημαντικό γιατι στέλνει το αυτόματο ημαιλ
router.put('/toggle/:id', middleware.verifyToken, middleware.checkRole('ADMIN'), transactionController.toggleProcessed);
```
```ts
// backend\src\stripe\controllers\transactionController.ts
// αυτή είναι σημαντική γιατί στέλνει αυτόματα το email
const toggleProcessed = async (req: Request, res: Response) => {
  const transactionId = req.params.id;
  if (!transactionId) {
    return res
      .status(400)
      .json({
        status: false,
        message: 'transaction ID is required OR not found',
      });
  }

  try {
    const transaction = await transactionDAO.findTransactionById(transactionId);

    const updatedData = {
      processed: !transaction.processed,
    };

    const updatedTransaction = await transactionDAO.updateTransactionById(
      transactionId,
      updatedData
    );

    // εδώ στέλνουμε το email
    // στο Hetzner μας διμηουργούσε πρόβλημα και για αυτό ακολουθήσαμε μια fire and forget προσέγγιση όπου στέλνουμε το mail και δεν περιμένουμε την απάντησή του. για αυτό αφαιρέσαμε το await. Απο await axios.post → axios post
    axios
      .post(`${BACKEND_URL}/api/email/${transactionId}`, req.body || {})
      .catch((err) => {
        console.error('Email failed', err.message);
      });

    return res.status(200).json({ status: true, data: updatedTransaction });
  } catch (error) {
    return handleControllerError(res, error);
  }
};
```

καλούμε μέσα απο το node ένα axios.post (αυτό είναι κακή πρακτική και δημιουργησε προβλήματα αργότερα)
`${BACKEND_URL}/api/email/${transactionId}`
Το axios self-call στο ίδιο backend θεωρείται κακή πρακτική γιατί δημιουργεί περιττό HTTP loop (Node → Nginx → Node), αυξάνει latency και μπορεί να προκαλέσει timeouts σε blocking operations όπως SMTP.
Σε μεγαλύτερη κλίμακα, η αποστολή email θα έπρεπε να γίνεται μέσω background job / queue ή μέσω email HTTP API αντί για SMTP.

```ts
// backend\src\stripe\routes\email.routes.ts
import express from 'express';
const router = express.Router();
import { emailController } from '../controllers/email.controller';
import { limiter } from '../../utils/limiter';

router.post('/:transactionId', limiter(15,5), emailController.sendThnxEmail);
export default router;
```

```ts
// backend\src\stripe\controllers\email.controller.ts
import type { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import { transactionDAO } from '../daos/transaction.dao';
import { handleControllerError } from '../../utils/error/errorHandler';


const sendThnxEmail = async (req: Request, res: Response) => {
  try {
    // παίρνω το transactionId απο τα params που μου έστειλε το φροντ και με αυτό βρήσκω όλες τις υπόλοιπες πληροφορίες
    const body = req.body || {};
    const transactionId = req.params.transactionId;
    const transaction = await transactionDAO.findTransactionById(transactionId);
    const email = transaction.participant.email;
    const name = transaction.participant.name;
    const emailSubject: string = body.emailSubject || process.env.EMAIL_EMAILSUBJECT || 'Thank You'; 
    const emailTextBody: string = body.emailTextBody || process.env.EMAIL_EMAILTEXTBODY || 'transaction is being processed. you will be notified sortly.';

    // ΣΗΜΕΙΩΣΗ: Αρχικά χρησιμοποιούσαμε SMTP(Simple Mail Transfer Protocol) στο port 465 με `secure: true`, που σημαίνει άμεση SSL/TLS σύνδεση (implicit TLS). Αυτό δούλευε στο localhost γιατί το τοπικό δίκτυο/ISP δεν μπλοκάρει outbound SMTP συνδέσεις. Στο Hetzner VPS όμως το port 465 είτε μπλοκάρεται είτε καθυστερεί σημαντικά (outbound SMTP restriction), με αποτέλεσμα timeout και 502/504 μέσω nginx. Η λύση ήταν να μεταβούμε στο port 587 με `secure: false`, όπου η σύνδεση ξεκινάει ως απλή TCP και στη συνέχεια αναβαθμίζεται σε TLS μέσω STARTTLS. Το 587 επιτρέπεται κανονικά από το Hetzner, οπότε το nodemailer μπορεί να ολοκληρώσει τη σύνδεση και να στείλει το email χωρίς να μπλοκάρει το backend request.
    // Στο email, το SMTP port 465 χρησιμοποιείται για αποστολή με άμεση κρυπτογράφηση (implicit TLS) από το πρώτο πακέτο, ενώ το SMTP port 587 χρησιμοποιείται για αποστολή με STARTTLS, δηλαδή πρώτα απλή σύνδεση και μετά αναβάθμιση σε κρυπτογραφημένη·

    const transporter = nodemailer.createTransport({
      host: 'smtp.zoho.eu',
      // port: 465,
      port: 587,
      // secure: true,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: emailSubject,
      text: `Dear ${name}, ${emailTextBody}`,
    };

    const emailRecipt = await transporter.sendMail(mailOptions);
    return res.status(200).json({ status: true, data: emailRecipt });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const emailController = {
  sendThnxEmail,
};
```

οπότε η όλη λειτουργία κλήνει στο front έτσι
```tsx
// src/components/AdminTransactionsPanel.tsx
  const markProcessed = async (
    transactionId: string,
    transaction: TransactionType
  ) => {
    try {
      const token = localStorage.getItem("token");

      const { emailSubject, emailTextBody } = mailCreator(transaction);

      const res = await axios.put<{ status: boolean; data: TransactionType }>(
        `${url}/api/transaction/toggle/${transactionId}`,
        { emailSubject, emailTextBody },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Transaction toggled:", res.data.data);
      fetchTransactions(); // refresh list
    } catch (err) {
      console.error("Error toggling transaction:", err);
    }
  };
  const mailCreator = (transaction: TransactionType) => {
    const itemsList = transaction.items
      .map(
        (i) => `- ${i.commodity.name} × ${i.quantity} (${i.priceAtPurchase}€)`
      )
      .join("\n");

    const shipping = transaction.shipping
      ? `
  Shipping Info:
  ${transaction.shipping.fullName}
  ${transaction.shipping.addressLine1}
  ${transaction.shipping.addressLine2 || ""}
  ${transaction.shipping.postalCode}, ${transaction.shipping.city}
  ${transaction.shipping.country}
  Phone: ${transaction.shipping.phone}
  Notes: ${transaction.shipping.notes || "-"}
  `
      : "No shipping info provided.";

    const emailSubject = "Your order is being processed";
    const emailTextBody = `
  Your transaction is being processed. You will be notified shortly.

  Order Details:
  ${itemsList}

  ${shipping}

  Best regards,
  The Team
  `;

    console.log("emailSubject, emailTextBody", emailSubject, emailTextBody);

    return { emailSubject, emailTextBody };
  };

  const handleOpen = (t: TransactionType) => {
    setSelected(t);
    setOpen(true);
  };

<Button
  variant={t.processed ? "outlined" : "contained"}
  color={t.processed ? "warning" : "success"}
  size="small"
  onClick={(e) => {
    e.stopPropagation(); // prevent row click
    markProcessed(t._id!.toString(), t);
  }}
>
  {t.processed
    ? "Mark Unprocessed"
    : "Send Email & Mark Processed"}
</Button>
```

