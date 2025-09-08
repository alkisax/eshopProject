"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionController = void 0;
const transaction_dao_1 = require("../daos/transaction.dao");
const axios_1 = __importDefault(require("axios"));
const errorHnadler_1 = require("../../utils/errorHnadler");
// const sendThnxEmail = require('../controllers/email.controller') // !!!
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';
const create = async (req, res) => {
    const participantId = req.body.participant;
    const sessionId = req.body.sessionId;
    if (!participantId || !sessionId) {
        return res.status(400).json({
            status: false,
            message: 'participantId and sessionId are required'
        });
    }
    try {
        const newTransaction = await transaction_dao_1.transactionDAO.createTransaction(participantId, sessionId);
        return res.status(201).json({
            status: true,
            data: newTransaction
        });
    }
    catch (error) {
        return (0, errorHnadler_1.handleControllerError)(res, error);
    }
};
const findAll = async (_req, res) => {
    try {
        // done by middleware
        // if (!req.headers.authorization) {
        //   return res.status(401).json({ status: false, error: 'No token provided' });
        // }
        const transactions = await transaction_dao_1.transactionDAO.findAllTransactions();
        return res.status(200).json({ status: true, data: transactions });
    }
    catch (error) {
        return (0, errorHnadler_1.handleControllerError)(res, error);
    }
};
const findUnprocessed = async (_req, res) => {
    try {
        // done by middleware
        // if (!req.headers.authorization) {
        //   return res.status(401).json({ status: false, error: 'No token provided' });
        // }
        const unprocessed = await transaction_dao_1.transactionDAO.findTransactionsByProcessed(false);
        return res.status(200).json({ status: true, data: unprocessed });
    }
    catch (error) {
        return (0, errorHnadler_1.handleControllerError)(res, error);
    }
};
const findByParticipant = async (req, res) => {
    const { participantId } = req.params;
    if (!participantId) {
        return res.status(400).json({ status: false, message: 'participantId is required' });
    }
    try {
        const transactions = await transaction_dao_1.transactionDAO.findByParticipantId(participantId);
        return res.status(200).json({ status: true, data: transactions });
    }
    catch (error) {
        return (0, errorHnadler_1.handleControllerError)(res, error);
    }
};
// αυτή είναι σημαντική γιατί στέλνει αυτόματα το email
const toggleProcessed = async (req, res) => {
    const transactionId = req.params.id;
    if (!transactionId) {
        return res.status(400).json({ status: false, message: 'transaction ID is required OR not found' });
    }
    try {
        const transaction = await transaction_dao_1.transactionDAO.findTransactionById(transactionId);
        const updatedData = {
            processed: !transaction.processed
        };
        const updatedTransaction = await transaction_dao_1.transactionDAO.updateTransactionById(transactionId, updatedData);
        // εδώ στέλνουμε το email
        await axios_1.default.post(`${BACKEND_URL}/api/email/${transactionId}`, {});
        return res.status(200).json({ status: true, data: updatedTransaction });
    }
    catch (error) {
        return (0, errorHnadler_1.handleControllerError)(res, error);
    }
};
const deleteById = async (req, res) => {
    const transactionId = req.params.id;
    if (!transactionId) {
        return res.status(400).json({ status: false, error: 'transaction ID is required OR not found' });
    }
    try {
        const deletedTransaction = await transaction_dao_1.transactionDAO.deleteTransactionById(transactionId);
        if (!deletedTransaction) {
            return res.status(404).json({ status: false, error: 'Error deleting transaction: not found' });
        }
        else {
            // ✅ return the cancelled transaction
            return res.status(200).json({ status: true, data: deletedTransaction });
        }
    }
    catch (error) {
        return (0, errorHnadler_1.handleControllerError)(res, error);
    }
};
const deleteOldProcessedTransactions = async (_req, res) => {
    try {
        const deletedCount = await transaction_dao_1.transactionDAO.deleteOldProcessedTransactions(5);
        res.status(200).json({
            status: true,
            message: `${deletedCount} processed transactions older than 5 years were deleted.`,
        });
    }
    catch (error) {
        (0, errorHnadler_1.handleControllerError)(res, error);
    }
};
exports.transactionController = {
    create,
    findAll,
    findUnprocessed,
    findByParticipant,
    toggleProcessed,
    deleteById,
    deleteOldProcessedTransactions
};
//# sourceMappingURL=transactionController.js.map