// backend\src\stripe\daos\transaction.dao.ts
// TODO transfer bussines logic out of dao. spageti code
/* eslint-disable no-console */
import mongoose from 'mongoose';
import Transaction from '../models/transaction.models';
import Participant from '../models/participant.models';
import Cart from '../models/cart.models';
import { commodityDAO } from '../daos/commodity.dao';
import type {
  TransactionType,
  ParticipantType,
  CommodityType,
  ShippingInfoType,
  PopulatedCartItem,
} from '../types/stripe.types';
import {
  NotFoundError,
  ValidationError,
  DatabaseError,
} from '../../utils/error/errors.types';

import { Types } from 'mongoose';

const findIrisTransactions = async () => {
  return await Transaction.find({
    sessionId: { $regex: '^IRIS_' },
  })
    .sort({ createdAt: -1 })
    .populate('participant')
    .populate({
      path: 'items.commodity',
      select: '-vector',
    });
};

const findCodTransactions = async () => {
  return await Transaction.find({
    sessionId: { $regex: '^COD_' },
  })
    .sort({ createdAt: -1 })
    .populate('participant')
    .populate({
      path: 'items.commodity',
      select: '-vector',
    });
};

const createTransaction = async (
  participantId: string | Types.ObjectId,
  sessionId: string,
  shipping?: ShippingInfoType,
): Promise<TransactionType> => {
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
  console.error('💀💀💀 CREATE *PENDING* TRANSACTION CALLED 💀💀💀');

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    console.log('✨ [TX] START createTransaction');
    // console.log('➡️ participantId:', participantId);
    // console.log('➡️ sessionId:', sessionId);

    // 1️⃣ Get participant
    const participant =
      await Participant.findById(participantId).session(session);
    // console.log(
    //   '👤 Participant loaded:',
    //   participant ? participant._id : 'NOT FOUND',
    // );
    if (!participant) {
      throw new NotFoundError('Participant not found');
    }

    // 2️⃣ Get cart
    // δεν καλούμε την λογική του cart dao create γιατί αυτή μου φτιάχνει ένα νέο cart αν δεν υπάρχει. εμείς εδώ είμαστε στο ταμείο και περιμένουμε απο τον πελάτη να έχει cart οταν φτάνει εδώ αλλιώς λάθος
    const cart = await Cart.findOne({ participant: participantId })
      .populate<{ items: PopulatedCartItem[] }>('items.commodity')
      .session(session);
    console.log('🛒 Cart loaded:', cart ? cart._id : 'NO CART FOUND');
    console.log('🛒 Cart items length:', cart?.items.length);
    if (cart) {
      cart.items.forEach((it, idx) => {
        console.log(`   ➤ CART ITEM ${idx}`);
        // console.log('      commodity raw:', it.commodity);
        console.log('      commodity ID:', it.commodity?._id);
        console.log('      quantity:', it.quantity);
        console.log('      priceAtPurchase:', it.priceAtPurchase);
      });
    }

    if (!cart || cart.items.length === 0) {
      throw new ValidationError('Cart is empty or not found');
    }

    // 3️⃣ Prevent duplicate sessions
    const existingTransaction = await Transaction.findOne({
      sessionId,
    }).session(session);
    console.log('🔎 Existing transaction:', existingTransaction ? 'YES' : 'NO');
    if (existingTransaction) {
      throw new ValidationError('Transaction already exists for this session');
    }

    // 4️⃣ Snapshot items
    console.log('🧾 Creating items snapshot...');
    const items = cart.items.map((item, idx) => {
      console.log(`   ➤ SNAPSHOT ITEM ${idx}`);
      // console.log('      item.commodity:', item.commodity);
      // console.log('      item.commodity?._id:', item.commodity?._id);
      // console.log('      item.variantId:', item.variantId);

      return {
        commodity: item.commodity?._id, // <— here it may be null
        variantId: item.variantId ?? undefined,
        quantity: item.quantity,
        priceAtPurchase: item.priceAtPurchase,
      };
    });

    console.log('🧾 Snapshot result:', items);

    // βρήσκω το συνολο της τιμής προϊόν * ποσοτητα για κάθε προϊόν
    const amount = items.reduce(
      (sum, item) => sum + item.priceAtPurchase * item.quantity,
      0,
    );
    console.log('💶 Total amount:', amount);

    // (αλλαγές για delivery) public token για status polling (αντί για sessionId)
    const publicTrackingToken = new Types.ObjectId().toString();

    // 5️⃣ εδώ είναι η κατασκευή της τελικής συναλαγής μου που θα στείλω στο stripe. Eχει id πελάτη, αντικείμενα (με προϊόντα, ποσότητα, τιμή αγοράς), συνολική αξία, και αν έχει επεξεργαστεί. έχει ακόμα το id που χρησιμοποιήθηκε απο το stripe
    console.log('🧱 Saving new Transaction document...');
    const transaction = new Transaction({
      participant: participantId,
      items,
      amount,
      shipping: shipping || {},
      sessionId,
      publicTrackingToken,
      status: 'pending',
      processed: false,
    });

    const result = await transaction.save({ session });
    console.log('💾 Transaction saved with ID:', result._id);
    // populate δεν χρειάζεται .session(session) Το populate είναι client-side operation
    await result.populate<{ items: PopulatedCartItem[] }>('items.commodity');
    console.log('🔄 Populated transaction items:', result.items);

    // **ΠΡΟΣΟΧΗ** εδώ καλώ το sellCommodityById απο το commodity dao το οποίο το κάνω chain στο session
    console.log('📉 Updating commodity stock...');
    for (const item of items) {
      console.log('   ➤ Updating stock for commodity:', item.commodity);

      await commodityDAO.sellCommodityById(
        item.commodity,
        item.quantity,
        session,
      ); // <-- update stock
    }

    // Link transaction to participant
    console.log('🔗 Linking transaction to participant...');
    await Participant.findByIdAndUpdate(
      participantId,
      { $push: { transactions: result._id } },
      { session },
    );

    // Clear cart after successful checkout
    // await Cart.findOneAndUpdate(
    //   { participant: participantId },
    //   { $set: { items: [] } },
    //   { session }
    // );

    console.log('✅ Committing MongoDB transaction...');
    await session.commitTransaction();
    session.endSession();
    console.log('✨ [TX] FINISHED createTransaction');

    return result;
  } catch (err: unknown) {
    console.log('❌ ERROR in createTransaction:', err);

    await session.abortTransaction();
    session.endSession();

    if (err instanceof ValidationError) {
      throw err;
    }
    if (err instanceof NotFoundError) {
      throw err;
    }
    if (err instanceof Error && err.name === 'ValidationError') {
      throw new ValidationError(err.message);
    }
    throw new DatabaseError('Error saving transaction');
  }
};

// στην λογική του delivery πριν γίνει η πληρωμή έχει κάνει ήδη ο admin approve την συναλαγή οπότε το transaction θα πρέπει να δημιουργήτε ως confirmed και οχι ως pending. αυτή είναι ένα ακριβές αντίγραφο της απο πάνω μονο που δημιουργεί ως confirmed για να χρησιμοποιηθέι στο stripe webhook
const createConfirmedTransaction = async (
  participantId: string | Types.ObjectId,
  sessionId: string,
  shipping?: ShippingInfoType,
): Promise<TransactionType> => {
  console.error('🔥🔥🔥 CREATE CONFIRMED TRANSACTION CALLED 🔥🔥🔥');

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1️⃣ participant
    const participant =
      await Participant.findById(participantId).session(session);
    if (!participant) {
      throw new NotFoundError('Participant not found');
    }

    // 2️⃣ cart
    const cart = await Cart.findOne({ participant: participantId })
      .populate<{ items: PopulatedCartItem[] }>('items.commodity')
      .session(session);

    if (!cart || cart.items.length === 0) {
      throw new ValidationError('Cart is empty or not found');
    }

    // 3️⃣ prevent duplicate Stripe session
    const existingTransaction = await Transaction.findOne({
      sessionId,
    }).session(session);

    if (existingTransaction) {
      throw new ValidationError('Transaction already exists for this session');
    }

    // 4️⃣ snapshot items
    const items = cart.items.map((item) => ({
      commodity: item.commodity?._id,
      variantId: item.variantId ?? undefined,
      quantity: item.quantity,
      priceAtPurchase: item.priceAtPurchase,
    }));

    const amount = items.reduce(
      (sum, item) => sum + item.priceAtPurchase * item.quantity,
      0,
    );

    const publicTrackingToken = new Types.ObjectId().toString();

    // 5️⃣ ⬅️ ⚠️⚠️
    const transaction = new Transaction({
      participant: participantId,
      items,
      amount,
      shipping: shipping || {},
      sessionId,
      publicTrackingToken,
      status: 'confirmed', // ⬅️ ΤΕΛΙΚΟ STATUS
      processed: false,
    });

    const result = await transaction.save({ session });
    await result.populate('items.commodity');

    // 6️⃣ update stock
    for (const item of items) {
      await commodityDAO.sellCommodityById(
        item.commodity,
        item.quantity,
        session,
      );
    }

    // 7️⃣ link στον participant
    await Participant.findByIdAndUpdate(
      participantId,
      { $push: { transactions: result._id } },
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    return result;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

// Find all transactions
const findAllTransactions = async (): Promise<TransactionType[]> => {
  return await Transaction.find()
    .populate<{ participant: ParticipantType }>('participant')
    .populate('items.commodity');
};

// Find transaction by ID
const findTransactionById = async (
  transactionId: string | Types.ObjectId,
): Promise<TransactionType & { participant: ParticipantType }> => {
  const response = await Transaction.findById(transactionId)
    .populate<{ participant: ParticipantType }>('participant')
    .populate('items.commodity');
  if (!response) {
    throw new NotFoundError('Transaction does not exist');
  }
  return response;
};

// sort -1 τα ποιο προσφατα πρώτα
const findByParticipantId = async (participantId: string | Types.ObjectId) => {
  return await Transaction.find({ participant: participantId })
    .sort({ createdAt: -1 })
    .populate<{ items: { commodity: CommodityType }[] }>('items.commodity');
};

// αυτο είναι για το session του stripe. δεν έχει ακόμα endpoint. ισως πρέπει να φτιαχτει
const findBySessionId = async (
  sessionId: string,
): Promise<TransactionType | null> => {
  const response = await Transaction.findOne({ sessionId })
    .populate('participant')
    .populate('items.commodity');
  return response;
};

const findTransactionsByProcessed = async (
  isProcessed: boolean,
): Promise<TransactionType[]> => {
  const response = await Transaction.find({ processed: isProcessed })
    .populate<{ participant: ParticipantType }>('participant')
    .populate('items.commodity');
  return response;
};

const findByPublicTrackingToken = async (
  publicTrackingToken: string,
): Promise<TransactionType | null> => {
  const response = await Transaction.findOne({ publicTrackingToken })
    .populate('participant')
    .populate({
      path: 'items.commodity',
      select: '-vector',
    });

  return response;
};

const markTransactionConfirmed = async (
  transactionId: string,
): Promise<TransactionType> => {
  const transaction = await Transaction.findById(transactionId);
  if (!transaction) {
    throw new NotFoundError('Transaction not found');
  }

  if (transaction.status !== 'pending') {
    throw new ValidationError(
      `Cannot confirm transaction in status ${transaction.status}`,
    );
  }

  transaction.status = 'confirmed';
  transaction.processed = false;

  await transaction.save();

  const populated = await Transaction.findById(transactionId)
    .populate('participant')
    .populate('items.commodity');

  if (!populated) {
    throw new NotFoundError('Transaction not found after update');
  }

  return populated;
};

const markShipped = async (transactionId: string): Promise<TransactionType> => {
  const transaction = await Transaction.findById(transactionId);
  if (!transaction) {
    throw new NotFoundError('Transaction not found');
  }

  if (transaction.status !== 'confirmed') {
    throw new ValidationError('Only confirmed transactions can be shipped');
  }

  transaction.status = 'shipped';
  transaction.processed = true; // legacy sync

  await transaction.save();

  const populated = await Transaction.findById(transactionId)
    .populate('participant')
    .populate('items.commodity');

  if (!populated) {
    throw new NotFoundError('Transaction not found after update');
  }

  return populated;
};

// Update a transaction (επιτρέπετε μόνο το toggle του processed γιατι είναι απόδειξη αγοράς)
const updateTransactionById = async (
  transactionId: string | Types.ObjectId,
  updateData: Partial<TransactionType>,
): Promise<TransactionType> => {
  try {
    // ✅ only "processed" is allowed
    if (Object.keys(updateData).length !== 1 || !('processed' in updateData)) {
      throw new ValidationError(
        'Transactions are immutable and cannot be updated (only processed can be toggled)',
      );
    }

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      throw new NotFoundError('Transaction not found');
    }

    // 🔁 TOGGLE LOGIC
    if (transaction.processed === true && updateData.processed === false) {
      // ⏪ FULL RESET
      transaction.processed = false;
      transaction.status = 'pending';
    } else if (
      transaction.processed === false &&
      updateData.processed === true
    ) {
      transaction.processed = true;
    }

    await transaction.save();

    const populated = await Transaction.findById(transactionId)
      .populate('participant')
      .populate('items.commodity');

    if (!populated) {
      throw new NotFoundError('Transaction not found after update');
    }

    return populated;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'ValidationError') {
      throw new ValidationError(err.message);
    }
    if (err instanceof NotFoundError) {
      throw err;
    }
    throw new DatabaseError('Error updating transaction');
  }
};

const addTransactionToParticipant = async (
  participantId: string | Types.ObjectId,
  transactionId: string | Types.ObjectId,
): Promise<ParticipantType> => {
  try {
    const existingParticipant = await Participant.findById(participantId);
    const existingTransaction = await Transaction.findById(transactionId);
    if (!existingParticipant || !existingTransaction) {
      throw new NotFoundError('Participant or transaction not found');
    }

    const response = await Participant.findByIdAndUpdate(
      participantId,
      { $push: { transactions: transactionId } },
      { new: true },
    );

    if (!response) {
      throw new NotFoundError('Participant not found after update');
    }

    return response;
  } catch (err: unknown) {
    if (err instanceof NotFoundError) {
      throw err; // bubble up expected
    }
    if (err instanceof Error && err.name === 'ValidationError') {
      throw new ValidationError(err.message);
    }
    throw new DatabaseError('Error adding transaction to participant');
  }
};

// Delete a transaction by ID
const deleteTransactionById = async (
  transactionId: string | Types.ObjectId,
): Promise<TransactionType> => {
  const existing = await Transaction.findById(transactionId);
  if (!existing) {
    throw new NotFoundError('transaction 404');
  }

  try {
    const response = await Transaction.findByIdAndUpdate(
      transactionId,
      { $set: { cancelled: true } },
      { new: true },
    )
      .populate('participant')
      .populate('items.commodity');
    if (!response) {
      throw new DatabaseError('error deleting transaction');
    }
    return response;
  } catch (err: unknown) {
    if (err instanceof NotFoundError) {
      throw err;
    }
    throw new DatabaseError('error deleting transaction');
  }
};

// delete processed transactions older than 5 days
const deleteOldProcessedTransactions = async (years = 5): Promise<number> => {
  const cutoff = new Date();
  // cutoff.setDate(cutoff.getDate() - years);
  cutoff.setFullYear(cutoff.getFullYear() - years);

  const result = await Transaction.deleteMany({
    processed: true,
    updatedAt: { $lt: cutoff },
  });

  return result.deletedCount ?? 0;
};

const cancelById = async (id: string) => {
  // προστέθηκε στην λειτουργία delivery για την front waiting aproval page πριν το checkout success
  // κρατάμε status όπως είναι και γυρνάμε cancelled=true
  // γιατί στο /status/:token ήδη κοιτά cancelled για redirect
  return await Transaction.findByIdAndUpdate(
    id,
    { cancelled: true },
    { new: true }, // επιστρέφει το ενημερωμένο document, όχι το παλιό
  );
};

const hardDeleteTransactionById = async (
  transactionId: string | Types.ObjectId,
): Promise<void> => {
  const res = await Transaction.findByIdAndDelete(transactionId);
  if (!res) {
    throw new NotFoundError('transaction 404');
  }
};

const deleteStripePlaceholders = async (): Promise<number> => {
  const res = await Transaction.deleteMany({
    sessionId: { $regex: '^STRIPE_' },
    status: 'confirmed', // ⚠️ σβήνουμε μόνο confirmed placeholders
  });

  return res.deletedCount || 0;
};

export const transactionDAO = {
  findAllTransactions,
  findTransactionById,
  findIrisTransactions,
  findCodTransactions,
  createTransaction,
  createConfirmedTransaction,
  deleteTransactionById,
  deleteOldProcessedTransactions,
  findTransactionsByProcessed,
  findByParticipantId,
  findBySessionId,
  findByPublicTrackingToken,
  markTransactionConfirmed,
  markShipped,
  updateTransactionById,
  addTransactionToParticipant,
  cancelById,
  hardDeleteTransactionById,
  deleteStripePlaceholders,
};
