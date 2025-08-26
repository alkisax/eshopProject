import type { Request, Response } from 'express';
import { transactionDAO } from '../daos/transaction.dao';
import post from 'axios';
import { handleControllerError } from '../../utils/errorHnadler';
import type { TransactionType } from '../types/stripe.types';
import { Types } from 'mongoose';
// const sendThnxEmail = require('../controllers/email.controller') // !!!

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

const create = async (req: Request, res: Response) => {
  const data = req.body as Partial<TransactionType>;
  const amount = data.amount;
  const processed = data.processed ?? false;
  const participant = data.participant as Types.ObjectId;

  if (amount === undefined || !participant ) {
    return res.status(400).json({ status: false, message: 'missing data to create transaction' });
  }

  try {
    const newTransaction = await transactionDAO.createTransaction({
      amount,
      processed,
      participant
    });

    // αφαιρέθηκε γιατί γινόταν δύο φορες, γιατί γίνεται και στο dao create
    // await transactionDAO.addTransactionToParticipant(participant, newTransaction._id);

    return res.status(201).json({ status: true, data: newTransaction });
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

// αυτή είναι σημαντική γιατί στέλνει αυτόματα το email
const toggleProcessed = async (req: Request, res: Response) => {
  const transactionId = req.params.id;
  if (!transactionId){
    return res.status(400).json({ status: false, message: 'transaction ID is required OR not found' });
  }

  try {
    const transaction = await transactionDAO.findTransactionById(transactionId);

    const updatedData = {
      processed: !transaction.processed
    };

    const updatedTransaction = await transactionDAO.updateTransactionById(transactionId, updatedData);

    // εδώ στέλνουμε το email
    await post(`${BACKEND_URL}/api/email/${transactionId}`);

    return res.status(200).json({ status: true, data: updatedTransaction });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

const deleteById = async (req: Request, res: Response) => {
  const transactionId = req.params.id;
  if (!transactionId){
    return res.status(400).json({ status: false, error: 'transaction ID is required OR not found' });
  }
  
  try {
    const deleteTransaction = await transactionDAO.deleteTransactionById(transactionId); 

    if (!deleteTransaction){
      return res.status(404).json({ status: false, error: 'Error deleting transaction: not found' });
    } else {
      return res.status(200).json({ status: true, message: 'transaction deleted successfully' });
    }
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const transactionController = {
  create,
  findAll,
  findUnprocessed,
  toggleProcessed,
  deleteById
};