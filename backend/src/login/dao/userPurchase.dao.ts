/* eslint-disable no-console */
// backend\src\login\dao\userPurchase.dao.ts
import User from '../models/users.models';
import { Types } from 'mongoose';
import { NotFoundError, DatabaseError } from '../../utils/error/errors.types';

//  addTransaction
const addTransaction = async (
  userId: string,
  transactionId: Types.ObjectId
) => {
  try {
    const updated = await User.findByIdAndUpdate(
      userId,
      // $push → προσθέτει νέο στοιχείο σε array (orderHistory)
      { $push: { orderHistory: transactionId } },
      // new:false → δεν χρειάζομαι να επιστρέψει το ενημερωμένο object, απλά εκτελώ την εντολή. δεν το βλεπω κάπου οπότε για οικονομία
      { new: false }
    );

    if (!updated) {
      throw new NotFoundError('User not found');
    }

    return updated;
  } catch (err) {
    console.log(err);
    throw new DatabaseError('Failed to add transaction to user');
  }
};

// increaseTotalSpent
const increaseTotalSpent = async (userId: string, amount: number) => {
  try {
    const updated = await User.findByIdAndUpdate(
      userId,
      // $inc → "increment": αυξάνει αριθμητικά μία τιμή. αυξάνει την totalspent κατα amount
      { $inc: { totalSpent: amount } },
      { new: false }
    );

    if (!updated) {
      throw new NotFoundError('User not found');
    }

    return updated;
  } catch (err) {
    console.log(err);
    throw new DatabaseError('Failed to increase totalSpent');
  }
};

// incrementExistingProduct
const incrementExistingProduct = async (
  userId: string,
  uuid: string,
  qty: number
) => {
  try {
    const result = await User.updateOne(
      {
        _id: userId,
        // "purchasedProducts.uuid": uuid → βρίσκει το συγκεκριμένο στοιχείο μέσα στο array
        // Το $. δείχνει το index του element που matched
        'purchasedProducts.uuid': uuid,
      },
      // Το $. δείχνει το index του element που matched
      // $inc με positional operator ($.) → αυξάνει count στο συγκεκριμένο array item
      { $inc: { 'purchasedProducts.$.count': qty } }
    );

    return result; // updateOne δεν επιστρέφει document
  } catch (err) {
    console.log(err);
    throw new DatabaseError('Failed to update existing purchased product');
  }
};

// addNewPurchasedProduct
const addNewPurchasedProduct = async (
  userId: string,
  uuid: string,
  qty: number
) => {
  try {
    const updated = await User.findByIdAndUpdate(
      userId,
      {
        // $push → προσθέτει νέο object στο array, γιατί δεν υπήρχε ήδη
        $push: {
          purchasedProducts: {
            uuid,
            count: qty,
          },
        },
      },
      { new: false }
    );

    if (!updated) {
      throw new NotFoundError('User not found');
    }

    return updated;
  } catch (err) {
    console.log(err);
    throw new DatabaseError('Failed to add purchased product');
  }
};

export const userPurchaseDAO = {
  addTransaction,
  increaseTotalSpent,
  incrementExistingProduct,
  addNewPurchasedProduct,
};
