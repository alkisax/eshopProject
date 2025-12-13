// backend\src\stripe\controllers\transactionController.ts
import type { Request, Response } from 'express';
import { transactionDAO } from '../daos/transaction.dao';
import axios from 'axios';
import { handleControllerError } from '../../utils/error/errorHandler';
// import type { TransactionType } from '../types/stripe.types';
import { Types } from 'mongoose';
import { emailController } from './email.controller';
// const sendThnxEmail = require('../controllers/email.controller') // !!!

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

const create = async (req: Request, res: Response) => {
  const participantId = req.body.participant as Types.ObjectId;
  const sessionId = req.body.sessionId as string;

  if (!participantId || !sessionId) {
    return res.status(400).json({
      status: false,
      message: 'participantId and sessionId are required',
    });
  }

  try {
    const newTransaction = await transactionDAO.createTransaction(
      participantId,
      sessionId
    );

    const notificationPromise = emailController.sendAdminSaleNotification(
      newTransaction._id.toString()
    );
    if (notificationPromise) {
      notificationPromise.catch((err) =>
        console.error('Admin sale notification failed', err)
      );
    }

    return res.status(201).json({
      status: true,
      data: newTransaction,
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

const findAll = async (_req: Request, res: Response) => {
  try {
    // done by middleware
    // if (!req.headers.authorization) {
    //   return res.status(401).json({ status: false, error: 'No token provided' });
    // }

    const transactions = await transactionDAO.findAllTransactions();

    return res.status(200).json({ status: true, data: transactions });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

const findUnprocessed = async (_req: Request, res: Response) => {
  try {
    // done by middleware
    // if (!req.headers.authorization) {
    //   return res.status(401).json({ status: false, error: 'No token provided' });
    // }

    const unprocessed = await transactionDAO.findTransactionsByProcessed(false);
    return res.status(200).json({ status: true, data: unprocessed });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

const findByParticipant = async (req: Request, res: Response) => {
  const { participantId } = req.params;

  if (!participantId) {
    return res
      .status(400)
      .json({ status: false, message: 'participantId is required' });
  }

  try {
    const transactions = await transactionDAO.findByParticipantId(
      participantId
    );
    return res.status(200).json({ status: true, data: transactions });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// αυτή είναι σημαντική γιατί στέλνει αυτόματα το email
const toggleProcessed = async (req: Request, res: Response) => {
  const transactionId = req.params.id;
  if (!transactionId) {
    return res.status(400).json({
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

const deleteById = async (req: Request, res: Response) => {
  const transactionId = req.params.id;
  if (!transactionId) {
    return res.status(400).json({
      status: false,
      error: 'transaction ID is required OR not found',
    });
  }

  try {
    const deletedTransaction = await transactionDAO.deleteTransactionById(
      transactionId
    );

    if (!deletedTransaction) {
      return res.status(404).json({
        status: false,
        error: 'Error deleting transaction: not found',
      });
    } else {
      // ✅ return the cancelled transaction
      return res.status(200).json({ status: true, data: deletedTransaction });
    }
  } catch (error) {
    return handleControllerError(res, error);
  }
};

const deleteOldProcessedTransactions = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const deletedCount = await transactionDAO.deleteOldProcessedTransactions(5);
    res.status(200).json({
      status: true,
      message: `${deletedCount} processed transactions older than 5 years were deleted.`,
    });
  } catch (error) {
    handleControllerError(res, error);
  }
};

export const transactionController = {
  create,
  findAll,
  findUnprocessed,
  findByParticipant,
  toggleProcessed,
  deleteById,
  deleteOldProcessedTransactions,
};
