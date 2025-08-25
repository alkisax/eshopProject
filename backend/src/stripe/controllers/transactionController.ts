// import bcrypt from 'bcrypt';
// import { warn, info, error as _error } from '../utils/logger';
// import Transaction from '../models/transaction.models';
import type { Request, Response } from 'express';
import { transactionDAO } from '../daos/transaction.dao';
// import Participant from '../daos/participant.dao';
import post from 'axios';
import { handleControllerError } from '../../utils/errorHnadler';
// const sendThnxEmail = require('../controllers/email.controller') // !!!


const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

export async function findAll(req: Request, res: Response) {
  try {

    // add later when auth
    if (!req.headers.authorization) {
      // warn('Unauthorized access attempt to findAll');
      return res.status(401).json({ status: false, error: 'No token provided' });
    }

    const transactions = await transactionDAO.findAllTransactions();
    // info('Fetched all transactions: %d found', transactions.length);
    return res.status(200).json({ status: true, data: transactions });
  } catch (error) {
    return handleControllerError(res, error);
  }
}

export async function findUnprocessed(req: Request, res: Response) {
  
  try {
    // add later when auth
    if (!req.headers.authorization) {
      // warn('Unauthorized access attempt to findUnprocessed');
      return res.status(401).json({ status: false, error: 'No token provided' });
    }

    const unprocessed = await transactionDAO.findTransactionsByProcessed(false);
    // info('Fetched unprocessed transactions: %d found', unprocessed.length);
    return res.status(200).json({ status: true, data: unprocessed });

  } catch (error) {
    return handleControllerError(res, error);
  }
}

export async function create(req: Request, res: Response) {
  const data = req.body;
  const amount = data.amount;
  const processed = data.processed;
  const participant = data.participant;

  try {
    const newTransaction = await transactionDAO.createTransaction({
      amount,
      processed,
      participant
    });

    // info('Created transaction: %o', { amount, participant });
    await transactionDAO.addTransactionToParticipant(participant, newTransaction._id);

    return res.status(201).json({ status: true, data: newTransaction });
  } catch (error) {
    return handleControllerError(res, error);
  }
}

// αυτή είναι σημαντική γιατί στέλνει αυτόματα το email
export async function toggleProcessed(req: Request, res: Response) {
  const transactionId = req.params.id;
  if (!transactionId){
    // warn('Missing transaction ID in toggleProcessed');
    return res.status(400).json({ status: false, message: 'transaction ID is required OR not found' });
  }

  try {
    const transaction = await transactionDAO.findTransactionById(transactionId);

    if (!transaction) {
      // warn('Transaction not found with ID: ', transactionId);
      return res.status(404).json({ status: false, message: 'Transaction not found' });
    }

    const updatedData = {
      processed: !transaction.processed
    };

    const updatedTransaction = await transactionDAO.updateTransactionById(transactionId, updatedData);

    // εδώ στέλνουμε το email
    await post(`${BACKEND_URL}/api/email/${transactionId}`);
    // info('Toggled processed status for transaction ', transactionId, updatedData.processed);
    return res.status(200).json({ status: true, data: updatedTransaction });
  } catch (error) {
    return handleControllerError(res, error);
  }
}

export async function deleteById(req: Request, res: Response) {
  const transactionId = req.params.id;
  if (!transactionId){
    // warn('Missing transaction ID in deleteById');
    return res.status(400).json({
      status: false,
      error: 'transaction ID is required OR not found'
    });
  }
  
  try {
    const deleteTransaction = await transactionDAO.deleteTransactionById(transactionId); 

    if (!deleteTransaction){
      // warn('Transaction not found for deletion with ID: ', transactionId);
      return res.status(404).json({
        status: false,
        error: 'Error deleting transaction: not found'
      });
    } else {
      // info('Deleted transaction with ID: ', transactionId);
      return res.status(200).json({ status: true, message: 'transaction deleted successfully' });
    }
  } catch (error) {
    return handleControllerError(res, error);
  }
}