"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionDAO = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const transaction_models_1 = __importDefault(require("../models/transaction.models"));
const participant_models_1 = __importDefault(require("../models/participant.models"));
const cart_models_1 = __importDefault(require("../models/cart.models"));
const commodity_dao_1 = require("../daos/commodity.dao");
const errors_types_1 = require("../types/errors.types");
const createTransaction = async (participantId, sessionId, shipping) => {
    /*
     σε αυτή τη συνάρτηση καλούσα πολλές φορές την βάση για να κάνω διάφορα. Να βρω τον participant, να βρώ το cart του, να σώσω την συναλλαγή του, να ενημερώσω τον participant για την νεα συναλαγή και να αδειάσω το crt. Αν κάτι χαλάσει στην μέση θα έχει κάνει κάποια και θα έχει αφήσει άλλα. Για αυτό η mongoose μου δίνει τα session που τα κάνει όλα bundle και αν δεν πετύχει κάποιο κάνει roll back
        η σύνταξή του είναι ως εξής:
        στην αρχή
          const session = await mongoose.startSession();
          session.startTransaction();
        μετά σε όλα τα await της βάσης προσθέτω
          .session(session)
        στο save, αντι για .session(session) βάζω
          .save({ session })
        και στα  queries το προσθέτω στο query
              await Participant.findByIdAndUpdate(
                participantId,
                { $push: { transactions: result._id } },
                { session }
              );
      **Προσοχη**
      Stripe vs Mongoose session
      Mongoose sessions = atomic DB transactions (all-or-nothing inside MongoDB).
      Stripe = separate system. It does not automatically roll back your MongoDB if a payment fails halfway.
      **That’s why you should**:
      First confirm the payment success with Stripe (via webhook).
      Then call your createTransaction with session.
    */
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        // 1️⃣ Get participant
        const participant = await participant_models_1.default.findById(participantId).session(session);
        if (!participant) {
            throw new errors_types_1.NotFoundError('Participant not found');
        }
        // 2️⃣ Get cart
        // δεν καλούμε την λογική του cart dao create γιατί αυτή μου φτιάχνει ένα νέο cart αν δεν υπάρχει. εμείς εδώ είμαστε στο ταμείο και περιμένουμε απο τον πελάτη να έχει cart οταν φτάνει εδώ αλλιώς λάθος
        const cart = await cart_models_1.default.findOne({ participant: participantId }).populate('items.commodity').session(session);
        if (!cart || cart.items.length === 0) {
            throw new errors_types_1.ValidationError('Cart is empty or not found');
        }
        // 3️⃣ Prevent duplicate sessions
        const existingTransaction = await transaction_models_1.default.findOne({ sessionId }).session(session);
        if (existingTransaction) {
            throw new errors_types_1.ValidationError('Transaction already exists for this session');
        }
        // 4️⃣ Calculate total amount & snapshot items
        const items = cart.items.map(item => ({
            commodity: item.commodity._id,
            quantity: item.quantity,
            priceAtPurchase: item.priceAtPurchase
        }));
        // βρήσκω το συνολο της τιμής προϊόν * ποσοτητα για κάθε προϊόν
        const amount = items.reduce((sum, item) => sum + item.priceAtPurchase * item.quantity, 0);
        // 5️⃣ εδώ είναι η κατασκευή της τελικής συναλαγής μου που θα στείλω στο stripe. Eχει id πελάτη, αντικείμενα (με προϊόντα, ποσότητα, τιμή αγοράς), συνολική αξία, και αν έχει επεξεργαστεί. έχει ακόμα το id που χρησιμοποιήθηκε απο το stripe
        const transaction = new transaction_models_1.default({
            participant: participantId,
            items,
            amount,
            shipping: shipping || {},
            sessionId,
            processed: false
        });
        const result = await transaction.save({ session });
        // populate δεν χρειάζεται .session(session) Το populate είναι client-side operation
        await result.populate('items.commodity');
        // **ΠΡΟΣΟΧΗ** εδώ καλώ το sellCommodityById απο το commodity dao το οποίο το κάνω chain στο session
        for (const item of items) {
            await commodity_dao_1.commodityDAO.sellCommodityById(item.commodity, item.quantity, session); // <-- update stock
        }
        // Link transaction to participant
        await participant_models_1.default.findByIdAndUpdate(participantId, { $push: { transactions: result._id } }, { session });
        // Clear cart after successful checkout
        // await Cart.findOneAndUpdate(
        //   { participant: participantId },
        //   { $set: { items: [] } },
        //   { session }
        // );
        await session.commitTransaction();
        session.endSession();
        return result;
    }
    catch (err) {
        await session.abortTransaction();
        session.endSession();
        if (err instanceof errors_types_1.ValidationError) {
            throw err;
        }
        ;
        if (err instanceof errors_types_1.NotFoundError) {
            throw err;
        }
        ;
        if (err instanceof Error && err.name === 'ValidationError') {
            throw new errors_types_1.ValidationError(err.message);
        }
        throw new errors_types_1.DatabaseError('Error saving transaction');
    }
};
// Find all transactions
const findAllTransactions = async () => {
    return await transaction_models_1.default.find()
        .populate('participant')
        .populate('items.commodity');
};
// Find transaction by ID
const findTransactionById = async (transactionId) => {
    const response = await transaction_models_1.default.findById(transactionId)
        .populate('participant')
        .populate('items.commodity');
    if (!response) {
        throw new errors_types_1.NotFoundError('Transaction does not exist');
    }
    return response;
};
// sort -1 τα ποιο προσφατα πρώτα
const findByParticipantId = async (participantId) => {
    return await transaction_models_1.default.find({ participant: participantId })
        .sort({ createdAt: -1 })
        .populate('items.commodity');
};
// αυτο είναι για το session του stripe. δεν έχει ακόμα endpoint. ισως πρέπει να φτιαχτει
const findBySessionId = async (sessionId) => {
    const response = await transaction_models_1.default.findOne({ sessionId })
        .populate('participant')
        .populate('items.commodity');
    return response;
};
const findTransactionsByProcessed = async (isProcessed) => {
    const response = await transaction_models_1.default.find({ processed: isProcessed })
        .populate('participant')
        .populate('items.commodity');
    return response;
};
// Update a transaction (επιτρέπετε μόνο το toggle του processed γιατι είναι απόδειξη αγοράς)
const updateTransactionById = async (transactionId, updateData) => {
    try {
        // ✅ only "processed" is allowed
        if (Object.keys(updateData).length !== 1 || !('processed' in updateData)) {
            throw new errors_types_1.ValidationError('Transactions are immutable and cannot be updated (only processed can be toggled)');
        }
        const updated = await transaction_models_1.default.findByIdAndUpdate(transactionId, { processed: updateData.processed }, { new: true, runValidators: true })
            .populate('participant')
            .populate('items.commodity');
        if (!updated) {
            throw new errors_types_1.NotFoundError('Transaction not found');
        }
        return updated;
    }
    catch (err) {
        if (err instanceof Error && err.name === 'ValidationError') {
            throw new errors_types_1.ValidationError(err.message);
        }
        if (err instanceof errors_types_1.NotFoundError) {
            throw err;
        }
        ;
        throw new errors_types_1.DatabaseError('Error updating transaction');
    }
};
const addTransactionToParticipant = async (participantId, transactionId) => {
    try {
        const existingParticipant = await participant_models_1.default.findById(participantId);
        const existingTransaction = await transaction_models_1.default.findById(transactionId);
        if (!existingParticipant || !existingTransaction) {
            throw new errors_types_1.NotFoundError('Participant or transaction not found');
        }
        const response = await participant_models_1.default.findByIdAndUpdate(participantId, { $push: { transactions: transactionId } }, { new: true });
        if (!response) {
            throw new errors_types_1.NotFoundError('Participant not found after update');
        }
        return response;
    }
    catch (err) {
        if (err instanceof errors_types_1.NotFoundError) {
            throw err; // bubble up expected
        }
        if (err instanceof Error && err.name === 'ValidationError') {
            throw new errors_types_1.ValidationError(err.message);
        }
        throw new errors_types_1.DatabaseError('Error adding transaction to participant');
    }
};
// Delete a transaction by ID
const deleteTransactionById = async (transactionId) => {
    const existing = await transaction_models_1.default.findById(transactionId);
    if (!existing) {
        throw new errors_types_1.NotFoundError('transaction 404');
    }
    try {
        const response = await transaction_models_1.default.findByIdAndUpdate(transactionId, { $set: { cancelled: true } }, { new: true })
            .populate('participant')
            .populate('items.commodity');
        if (!response) {
            throw new errors_types_1.DatabaseError('error deleting transaction');
        }
        return response;
    }
    catch (err) {
        if (err instanceof errors_types_1.NotFoundError) {
            throw err;
        }
        ;
        throw new errors_types_1.DatabaseError('error deleting transaction');
    }
};
// delete processed transactions older than 5 days
const deleteOldProcessedTransactions = async (years = 5) => {
    const cutoff = new Date();
    // cutoff.setDate(cutoff.getDate() - years);
    cutoff.setFullYear(cutoff.getFullYear() - years);
    const result = await transaction_models_1.default.deleteMany({
        processed: true,
        updatedAt: { $lt: cutoff },
    });
    return result.deletedCount ?? 0;
};
exports.transactionDAO = {
    findAllTransactions,
    findTransactionById,
    createTransaction,
    deleteTransactionById,
    deleteOldProcessedTransactions,
    updateTransactionById,
    findTransactionsByProcessed,
    findByParticipantId,
    findBySessionId,
    addTransactionToParticipant
};
//# sourceMappingURL=transaction.dao.js.map