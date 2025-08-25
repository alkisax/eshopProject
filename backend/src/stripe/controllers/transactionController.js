import bcrypt from 'bcrypt';
import { warn, info, error as _error } from '../utils/logger';
import Transaction from '../models/transaction.models';
import { findAllTransactions, findTransactionsByProcessed, createTransaction, findTransactionById, updateTransactionById, deleteTransactionById } from '../daos/transaction.dao';
import { addTransactionToParticipant } from '../daos/participant.dao';
import { post } from 'axios';
// const sendThnxEmail = require('../controllers/email.controller') // !!!

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

export async function findAll(req,res) {
  try {

    // add later when auth
    if (!req.headers.authorization) {
      warn('Unauthorized access attempt to findAll');
      return res.status(401).json({ status: false, error: 'No token provided' });
    }

    const transactions = await findAllTransactions();
    info('Fetched all transactions: %d found', transactions.length);
    res.status(200).json({ status: true, data: transactions });
  } catch (error) {
    console.error(error);
    _error('Error in findAll: %s', error.message);
    res.status(500).json({ status: false, error: 'Internal server error' });
  }
}

export async function findUnprocessed(req,res) {
  
  try {
    // add later when auth
    if (!req.headers.authorization) {
      warn('Unauthorized access attempt to findUnprocessed');
      return res.status(401).json({ status: false, error: 'No token provided' });
    }

    const unprocessed = await findTransactionsByProcessed(false);
    info('Fetched unprocessed transactions: %d found', unprocessed.length);
    res.status(200).json({
      status: true,
      data: unprocessed
    });

  } catch (error) {
    _error('Error in findUnprocessed: %s', error.message);
    res.status(500).json(error);
  }
}

export async function create(req,res) {
  let data = req.body;
  const amount = data.amount;
  const processed = data.processed;
  const participant = data.participant;

  try {
    const newTransaction = await createTransaction({
      amount,
      processed,
      participant
    });

    info('Created transaction: %o', { amount, participant });
    await addTransactionToParticipant(participant, newTransaction._id);

    res.status(201).json(newTransaction);
  } catch(error) {
    _error(`Error creating transaction: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
}

// αυτή είναι σημαντική γιατί στέλνει αυτόματα το email
export async function toggleProcessed(req,res) {
  const transactionId = req.params.id;
  if (!transactionId){
    warn('Missing transaction ID in toggleProcessed');
    return res.status(400).json({
      status: false,
      error: 'transaction ID is required OR not found'
    });
  }

  try {
    const transaction = await findTransactionById(transactionId);

    if (!transaction) {
      warn('Transaction not found with ID: ', transactionId);
      return res.status(404).json({
        status: false,
        error: 'Transaction not found',
      });
    }

    const updatedData = {
      processed: !transaction.processed
    };

    const updatedTransaction = await updateTransactionById(transactionId, updatedData);

    // εδώ στέλνουμε το email
    await post(`${BACKEND_URL}/api/email/${transactionId}`);
    info('Toggled processed status for transaction ', transactionId, updatedData.processed);
    res.status(200).json({ status: true, data: updatedTransaction });
  } catch (error) {
    _error('Error toggling transaction processed status: ', error.message);
    res.status(500).json({
      status:false,
      error: error.message
    });
  }
}

export async function deleteById(req, res) {
  const transactionId = req.params.id;
  if (!transactionId){
    warn('Missing transaction ID in deleteById');
    return res.status(400).json({
      status: false,
      error: 'transaction ID is required OR not found'
    });
  }
  
  try {
    const deleteTransaction = await deleteTransactionById(transactionId); 

    if (!deleteTransaction){
      warn('Transaction not found for deletion with ID: ', transactionId);
      return res.status(404).json({
        status: false,
        error: 'Error deleting transaction: not found'
      });
    } else {
      info('Deleted transaction with ID: ', transactionId);
      res.status(200).json({
        status: true,
        message: 'transaction deleted successfully',
      });
    }
  } catch (error) {
    _error('Error deleting transaction: ', error.message);
    res.status(500).json({
      status: false,
      error: error.message
    });
  }
}