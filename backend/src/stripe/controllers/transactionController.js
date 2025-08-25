const bcrypt = require('bcrypt')
const logger = require('../utils/logger')
const Transaction = require('../models/transaction.models')
const transactionDAO = require('../daos/transaction.dao')
const participantDAO = require('../daos/participant.dao')
const axios = require('axios')
// const sendThnxEmail = require('../controllers/email.controller') // !!!

BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'

exports.findAll = async (req,res) => {
  try {

    // add later when auth
    if (!req.headers.authorization) {
      logger.warn('Unauthorized access attempt to findAll');
      return res.status(401).json({ status: false, error: 'No token provided' });
    }

    const transactions = await transactionDAO.findAllTransactions();
    logger.info('Fetched all transactions: %d found', transactions.length);
    res.status(200).json({ status: true, data: transactions });
  } catch (error) {
    console.error(error);
    logger.error('Error in findAll: %s', error.message);
    res.status(500).json({ status: false, error: 'Internal server error' });
  }
}

exports.findUnprocessed = async (req,res) => {
  
  try {
    // add later when auth
    if (!req.headers.authorization) {
      logger.warn('Unauthorized access attempt to findUnprocessed');
      return res.status(401).json({ status: false, error: 'No token provided' });
    }

    const unprocessed = await transactionDAO.findTransactionsByProcessed(false)
    logger.info('Fetched unprocessed transactions: %d found', unprocessed.length);
    res.status(200).json({
      status: true,
      data: unprocessed
    })

  } catch (error) {
    logger.error('Error in findUnprocessed: %s', error.message);
    res.status(500).json(error)
  }
}

exports.create = async (req,res) => {
  let data = req.body
  const amount = data.amount
  const processed = data.processed
  const participant = data.participant

  try {
    const newTransaction = await transactionDAO.createTransaction({
      amount,
      processed,
      participant
    });

    logger.info('Created transaction: %o', { amount, participant });
    await participantDAO.addTransactionToParticipant(participant, newTransaction._id);

    res.status(201).json(newTransaction)
  } catch(error) {
    logger.error(`Error creating transaction: ${error.message}`);
    res.status(400).json({error: error.message})
  }
}

// αυτή είναι σημαντική γιατί στέλνει αυτόματα το email
exports.toggleProcessed = async (req,res) => {
  const transactionId = req.params.id
  if (!transactionId){
    logger.warn('Missing transaction ID in toggleProcessed');
    return res.status(400).json({
      status: false,
      error: 'transaction ID is required OR not found'
    })
  }

  try {
    const transaction = await transactionDAO.findTransactionById(transactionId);

    if (!transaction) {
      logger.warn('Transaction not found with ID: ', transactionId);
      return res.status(404).json({
        status: false,
        error: 'Transaction not found',
      });
    }

    const updatedData = {
      processed: !transaction.processed
    }

    const updatedTransaction = await transactionDAO.updateTransactionById(transactionId, updatedData)

    // εδώ στέλνουμε το email
    await axios.post(`${BACKEND_URL}/api/email/${transactionId}`)
    logger.info('Toggled processed status for transaction ', transactionId, updatedData.processed);
    res.status(200).json({ status: true, data: updatedTransaction})
  } catch (error) {
    logger.error('Error toggling transaction processed status: ', error.message);
    res.status(500).json({
      status:false,
      error: error.message
    })
  }
}

exports.deleteById = async (req, res) => {
  const transactionId = req.params.id
  if (!transactionId){
    logger.warn('Missing transaction ID in deleteById');
    return res.status(400).json({
      status: false,
      error: 'transaction ID is required OR not found'
    })
  }
  
  try {
    const deleteTransaction = await transactionDAO.deleteTransactionById(transactionId) 

    if (!deleteTransaction){
      logger.warn('Transaction not found for deletion with ID: ', transactionId);
      return res.status(404).json({
        status: false,
        error: 'Error deleting transaction: not found'
      })
    } else {
      logger.info('Deleted transaction with ID: ', transactionId);
      res.status(200).json({
        status: true,
        message: `transaction deleted successfully`,
      })
    }
  } catch (error) {
    logger.error('Error deleting transaction: ', error.message);
    res.status(500).json({
      status: false,
      error: error.message
    })
  }
}