// backend\src\stripe\controllers\email.controller.ts
import type { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import { transactionDAO } from '../daos/transaction.dao';
import { handleControllerError } from '../../utils/error/errorHandler';
import { settingsDAO } from '../../settings/settings.dao';

// in: ένα κείμενο που είναι πιθανό να έχει διαφορα τύπου {{name}}, {{items}} κλπ στο εσωτερικό του και (vars) ένα αντικείμενο τύπου { name: 'Μαρία', items: '1) Shirt\n2) Shoes', total: '45 €' }
// φτιάχνει ένα regex που αναζητά για κάθε key του var αν υπάρχουν στο κείμενο {{key}} (με g→global) και αν υπάρχουν τα κάνει replace
// out: το string του κειμένου αλλαγμένο
export const renderTemplate = (
  template: string,
  vars: Record<string, string>
): string => {
  let output = template;

  for (const [key, value] of Object.entries(vars)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    output = output.replace(regex, String(value));
  }

  return output;
};

// ΣΗΜΕΙΩΣΗ: Αρχικά χρησιμοποιούσαμε SMTP(Simple Mail Transfer Protocol) στο port 465 με `secure: true`, που σημαίνει άμεση SSL/TLS σύνδεση (implicit TLS). Αυτό δούλευε στο localhost γιατί το τοπικό δίκτυο/ISP δεν μπλοκάρει outbound SMTP συνδέσεις. Στο Hetzner VPS όμως το port 465 είτε μπλοκάρεται είτε καθυστερεί σημαντικά (outbound SMTP restriction), με αποτέλεσμα timeout και 502/504 μέσω nginx. Η λύση ήταν να μεταβούμε στο port 587 με `secure: false`, όπου η σύνδεση ξεκινάει ως απλή TCP και στη συνέχεια αναβαθμίζεται σε TLS μέσω STARTTLS. Το 587 επιτρέπεται κανονικά από το Hetzner, οπότε το nodemailer μπορεί να ολοκληρώσει τη σύνδεση και να στείλει το email χωρίς να μπλοκάρει το backend request.
// Στο email, το SMTP port 465 χρησιμοποιείται για αποστολή με άμεση κρυπτογράφηση (implicit TLS) από το πρώτο πακέτο, ενώ το SMTP port 587 χρησιμοποιείται για αποστολή με STARTTLS, δηλαδή πρώτα απλή σύνδεση και μετά αναβάθμιση σε κρυπτογραφημένη·
// διαβασε πρώτα την sendShippedEmail
const sendThnxEmail = async (req: Request, res: Response) => {
  try {
    // παίρνω το transactionId απο τα params που μου έστειλε το φροντ και με αυτό βρήσκω όλες τις υπόλοιπες πληροφορίες
    const body = req.body || {};
    const transactionId = req.params.transactionId;
    const transaction = await transactionDAO.findTransactionById(transactionId);
    const participant =
      typeof transaction.participant === 'object'
        ? transaction.participant
        : null;

    if (!participant?.email) {
      throw new Error('Participant email not found');
    }
    const email = participant.email;
    const name = participant.name ?? '';
    const totalValueText = `${transaction.amount} €`;
    // 🧾 Build items text
    let itemsText = '';
    transaction.items.forEach((item, index) => {
      let productName = 'Product';

      if (typeof item.commodity === 'object' && 'name' in item.commodity) {
        productName = item.commodity.name;
      }

      itemsText +=
        `${index + 1}) ${productName}\n` +
        `   Quantity: ${item.quantity}\n` +
        `   Price: ${item.priceAtPurchase} €\n\n`;
    });

    // ⚙️ settings
    const settings = await settingsDAO.getGlobalSettings();
    const companyName = settings.companyInfo?.companyName ?? '';

    const rawSubject =
      body.emailSubject ||
      settings.emailTemplates?.orderConfirmed?.subject ||
      process.env.EMAIL_EMAILSUBJECT ||
      'Thank you for your order';

    const rawBody =
      body.emailTextBody ||
      settings.emailTemplates?.orderConfirmed?.body ||
      process.env.EMAIL_EMAILTEXTBODY ||
      'Your transaction is being processed.';

    // 🧠 template render
    const emailSubject = renderTemplate(rawSubject, {
      name,
      items: itemsText,
      total: totalValueText,
      companyName,
    });

    const emailTextBody = renderTemplate(rawBody, {
      name,
      items: itemsText,
      total: totalValueText,
      companyName,
    });

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
      text: emailTextBody,
    };

    const emailReceipt = await transporter.sendMail(mailOptions);
    return res.status(200).json({ status: true, data: emailReceipt });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

const sendShippedEmail = async (req: Request, res: Response) => {
  try {
    // θέλω να φέρω τα διάφορα στοιχεία του μεήλ για να μπούν στο σώμα του μέηλ. Αφού έχω transaction id μπορώ να φέρω όλο το transaction και απο εκεί να βγάλω τα items και το name, email
    const transactionId = req.params.transactionId;
    const transaction = await transactionDAO.findTransactionById(transactionId);
    const participant =
      // ελέγχω αν έχει γίνει Populate ο participant και δεν είναι objectid
      typeof transaction.participant === 'object'
        ? transaction.participant
        : null;
    const email = participant?.email;
    if (!email) {
      throw new Error('Participant email not found');
    }
    const totalValueText = `${transaction.amount} €`;
    const name = participant?.name ?? '';
    let itemsText = '';
    transaction.items.forEach((item, index) => {
      let productName = 'Product';
      // ελέγχω αν Populated
      if (typeof item.commodity === 'object' && 'name' in item.commodity) {
        productName = item.commodity.name;
      }
      itemsText +=
        `${index + 1}) ${productName}\n` +
        `   Quantity: ${item.quantity}\n` +
        `   Price: ${item.priceAtPurchase} €\n\n`;
    });

    // απο τα setiings φέρνω το όνομα της εταιρίας και τον τίτλο και σώμα του μεηλ
    const settings = await settingsDAO.getGlobalSettings();
    const companyName = settings.companyInfo?.companyName ?? '';
    const emailSubjectSettings = settings.emailTemplates?.orderShipped?.subject;
    const emailBodySettings = settings.emailTemplates?.orderShipped?.body;

    // guard
    const rawSubject =
      emailSubjectSettings ||
      process.env.EMAIL_SHIPPED_SUBJECT ||
      'Your order has been shipped';

    const rawBody =
      emailBodySettings ||
      process.env.EMAIL_SHIPPED_TEXTBODY ||
      'Your order has been shipped and is on its way.';

    // η βοηθητική renderTemplate που βρίσκετε παραπάνω σε αυτό το αρχείο μου αντικαθηστά τα {{name}}, {{items}}, {{total}}, {{companyName}}
    const emailSubject = renderTemplate(rawSubject, {
      name: name,
      items: itemsText,
      total: totalValueText,
      companyName: companyName,
    });

    const emailTextBody = renderTemplate(rawBody, {
      name: name,
      items: itemsText,
      total: totalValueText,
      companyName: companyName,
    });

    const transporter = nodemailer.createTransport({
      host: 'smtp.zoho.eu',
      port: 587,
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
      text: emailTextBody,
    };

    const receipt = await transporter.sendMail(mailOptions);

    return res.status(200).json({ status: true, data: receipt });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// admin notification = πώληση δημιουργήθηκε
const sendAdminSaleNotification = async (transactionId: string) => {
  const settings = await settingsDAO.getGlobalSettings();

  if (!settings.adminNotifications?.salesNotificationsEnabled) {
    return;
  }

  const adminEmail = settings.adminNotifications.adminEmail;
  if (!adminEmail) {
    return;
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.zoho.eu',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const transaction = await transactionDAO.findTransactionById(transactionId);

  const createdAt = transaction.createdAt
    ? new Date(transaction.createdAt).toLocaleString()
    : 'Unknown date';

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: adminEmail,
    subject: 'New sale created',
    text: `New sale just created.

Amount: ${transaction.amount} €
Customer: ${transaction.participant.email}
Items: ${transaction.items.length}
Date: ${createdAt}`,
  });
};

export const emailController = {
  sendThnxEmail,
  sendShippedEmail,
  sendAdminSaleNotification,
};
