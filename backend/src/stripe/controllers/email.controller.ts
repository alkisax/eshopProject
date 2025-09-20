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

    const transporter = nodemailer.createTransport({
      host: 'smtp.zoho.eu',
      port: 465,
      secure: true,
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