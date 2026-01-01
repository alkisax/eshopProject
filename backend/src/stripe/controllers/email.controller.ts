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
    const emailSubject: string =
      body.emailSubject || process.env.EMAIL_EMAILSUBJECT || 'Thank You';
    const emailTextBody: string =
      body.emailTextBody ||
      process.env.EMAIL_EMAILTEXTBODY ||
      'transaction is being processed. you will be notified sortly.';

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

    const formatedEmailTextBody =
      `Dear ${name},\n\n` +
      `${emailTextBody} \n\n` +
      'Items:\n' +
      itemsText +
      `Total: ${transaction.amount} €\n\n` +
      'Thank you for your purchase.';

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: emailSubject,
      text: formatedEmailTextBody,
    };

    const emailReceipt = await transporter.sendMail(mailOptions);
    return res.status(200).json({ status: true, data: emailReceipt });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

const sendShippedEmail = async (req: Request, res: Response) => {
  try {
    const transactionId = req.params.transactionId;

    const transaction = await transactionDAO.findTransactionById(transactionId);

    const participant =
      typeof transaction.participant === 'object'
        ? transaction.participant
        : null;

    const email = participant?.email;
    const name = participant?.name ?? '';

    if (!email) {
      throw new Error('Participant email not found');
    }

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

    const emailSubject =
      process.env.EMAIL_SHIPPED_SUBJECT || 'Your order has been shipped';

    const emailTextBody =
      process.env.EMAIL_SHIPPED_TEXTBODY ||
      'Your order has been shipped and is on its way.';

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
      text:
        `Dear ${name},\n\n` +
        `${emailTextBody}\n\n` +
        `Items shipped:\n${itemsText}` +
        `Total: ${transaction.amount} €\n\n` +
        'We hope to see you again.',
    };

    const receipt = await transporter.sendMail(mailOptions);

    return res.status(200).json({ status: true, data: receipt });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// admin notification = πώληση δημιουργήθηκε
import { settingsDAO } from '../../settings/settings.dao';

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
