/* eslint-disable no-console */
// backend\src\stripe\controllers\transactionController.ts
import type { Request, Response } from 'express';
import { transactionDAO } from '../daos/transaction.dao';
import { participantDao } from '../daos/participant.dao';
import axios from 'axios';
import { handleControllerError } from '../../utils/error/errorHandler';
// import type { TransactionType } from '../types/stripe.types';
import { Types } from 'mongoose';
import { emailController } from './email.controller';
import { ShippingInfoType } from '../types/stripe.types';
import { AuthRequest } from '../../login/types/user.types';
import { getIO } from '../../socket/socket';
// const sendThnxEmail = require('../controllers/email.controller') // !!!

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

const create = async (req: Request, res: Response) => {
  const participantId = req.body.participant as Types.ObjectId;
  const sessionId = req.body.sessionId as string;
  const shipping = req.body.shipping as ShippingInfoType;

  if (!participantId || !sessionId) {
    return res.status(400).json({
      status: false,
      message: 'participantId and sessionId are required',
    });
  }

  try {
    const newTransaction = await transactionDAO.createTransaction(
      participantId,
      sessionId,
      shipping,
    );

    // 🔔 SOCKET EVENT — ΓΙΑ ΟΛΕΣ ΤΙΣ ΔΗΜΙΟΥΡΓΙΕΣ
    const io = getIO();
    console.log('📣 [SOCKET] Emitting transaction:created');
    console.log('📣 [SOCKET] sessionId:', newTransaction.sessionId);
    console.log(
      '📣 [SOCKET] rooms:',
      Array.from(io.sockets.adapter.rooms.keys()),
    );
    console.log(
      '📣 [SOCKET] admins count:',
      io.sockets.adapter.rooms.get('admins')?.size ?? 0,
    );

    io.to('admins').emit('transaction:created', {
    // io.emit('transaction:created', {
      transactionId: newTransaction._id.toString(),
      status: newTransaction.status,
      sessionId: newTransaction.sessionId,
      createdAt: newTransaction.createdAt,
      publicTrackingToken: newTransaction.publicTrackingToken,
    });

    const notificationPromise = emailController.sendAdminSaleNotification(
      newTransaction._id.toString(),
    );
    if (notificationPromise) {
      notificationPromise.catch((err) =>
        console.error('Admin sale notification failed', err),
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

const findById = async (req: Request, res: Response) => {
  try {
    const transactionId = req.params.id;

    const transaction = await transactionDAO.findTransactionById(transactionId);

    return res.status(200).json({
      status: true,
      data: transaction,
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
    const transactions =
      await transactionDAO.findByParticipantId(participantId);
    return res.status(200).json({ status: true, data: transactions });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

const findMyTransactions = async (req: AuthRequest, res: Response) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ status: false, message: 'Unauthorized' });
  }

  try {
    // 1. βρίσκουμε participant από userId
    const participant = await participantDao.findParticipantByUserId(user.id);

    if (!participant || !participant._id) {
      // δεν είναι false. σημαίνει ο user δεν έχει κάνει αγορές ακόμα και άρα δεν έχει Participant
      return res.status(200).json({ status: true, data: [] });
    }

    // 2. βρίσκουμε transactions
    const transactions = await transactionDAO.findByParticipantId(
      participant._id,
    );

    return res.status(200).json({ status: true, data: transactions });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

const getIrisTransactions = async (_req: Request, res: Response) => {
  const transactions = await transactionDAO.findIrisTransactions();
  return res.json({ status: true, data: transactions });
};

const getCodTransactions = async (_req: Request, res: Response) => {
  const transactions = await transactionDAO.findCodTransactions();
  return res.json({ status: true, data: transactions });
};

const getStatusByTrackingToken = async (req: Request, res: Response) => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({
      status: false,
      message: 'tracking token is required',
    });
  }

  try {
    const transaction = await transactionDAO.findByPublicTrackingToken(token);

    if (!transaction) {
      return res.status(404).json({
        status: false,
        message: 'transaction not found',
      });
    }

    return res.status(200).json({
      status: true,
      data: {
        status: transaction.status,
        cancelled: transaction.cancelled,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
      },
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// έχει αλλάξει η λογική μας και πια δεν έχουμε μόνο state processed true/false αλλά pending/confirmed/shipped=processed. Εδώ την αφήνουμε οπως είναι γιατί θα την χρησιμοποιούμε όσο είμαστε σε dev διαδικασία για να μπορέσουμε να γυρίσουμε στην αρχική μας κατάσταση processed: false, status: pending
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
      updatedData,
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

const markConfirmed = async (req: Request, res: Response) => {
  const transactionId = req.params.id;

  if (!transactionId) {
    return res.status(400).json({
      status: false,
      message: 'transaction ID is required',
    });
  }

  try {
    const updatedTransaction =
      await transactionDAO.markTransactionConfirmed(transactionId);

    // 📧 Email: ORDER CONFIRMED
    axios
      .post(`${BACKEND_URL}/api/email/${transactionId}`, req.body || {})
      .catch((err) => {
        console.error('Confirmed email failed', err.message);
      });

    return res.status(200).json({
      status: true,
      data: updatedTransaction,
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

const markShipped = async (req: Request, res: Response) => {
  const transactionId = req.params.id;

  if (!transactionId) {
    return res.status(400).json({
      status: false,
      message: 'transaction ID is required',
    });
  }

  try {
    const updatedTransaction = await transactionDAO.markShipped(transactionId);

    // 📧 Email: ORDER SHIPPED
    axios
      .post(`${BACKEND_URL}/api/email/shipped/${transactionId}`)
      .catch((err) => {
        console.error('Shipped email failed', err.message);
      });

    return res.status(200).json({
      status: true,
      data: updatedTransaction,
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

const cancelTransaction = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const updated = await transactionDAO.cancelById(id);

    return res.status(200).json({
      status: true,
      data: updated,
    });
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
    const deletedTransaction =
      await transactionDAO.deleteTransactionById(transactionId);

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
  res: Response,
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
  findById,
  findAll,
  findUnprocessed,
  findByParticipant,
  findMyTransactions,
  getIrisTransactions,
  getCodTransactions,
  getStatusByTrackingToken,
  toggleProcessed,
  markConfirmed,
  markShipped,
  cancelTransaction,
  deleteById,
  deleteOldProcessedTransactions,
};
