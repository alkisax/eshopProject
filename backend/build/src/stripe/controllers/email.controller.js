"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailController = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const transaction_dao_1 = require("../daos/transaction.dao");
const errorHnadler_1 = require("../../utils/errorHnadler");
const sendThnxEmail = async (req, res) => {
    try {
        // παίρνω το transactionId απο τα params που μου έστειλε το φροντ και με αυτό βρήσκω όλες τις υπόλοιπες πληροφορίες
        const body = req.body || {};
        const transactionId = req.params.transactionId;
        const transaction = await transaction_dao_1.transactionDAO.findTransactionById(transactionId);
        const email = transaction.participant.email;
        const name = transaction.participant.name;
        const emailSubject = body.emailSubject || process.env.EMAIL_EMAILSUBJECT || 'Thank You';
        const emailTextBody = body.emailTextBody || process.env.EMAIL_EMAILTEXTBODY || 'transaction is being processed. you will be notified sortly.';
        const transporter = nodemailer_1.default.createTransport({
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
    }
    catch (error) {
        return (0, errorHnadler_1.handleControllerError)(res, error);
    }
};
exports.emailController = {
    sendThnxEmail,
};
//# sourceMappingURL=email.controller.js.map