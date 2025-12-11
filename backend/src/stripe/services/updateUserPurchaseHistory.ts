/* eslint-disable no-console */
// backend\src\stripe\services\updateUserPurchaseHistory.ts
import { Types } from 'mongoose';
import { commodityDAO } from '../daos/commodity.dao';
import { userPurchaseDAO } from '../../login/dao/userPurchase.dao';

import type { IUser } from '../../login/types/user.types';
import type { TransactionType } from '../../stripe/types/stripe.types';

export async function updateUserPurchaseHistory(
  participant: { user?: Types.ObjectId | string | IUser },
  transaction: TransactionType
): Promise<void> {
  if (!participant.user) {
    return;
  }

  const userId = participant.user.toString();

  try {
    // 1) Add transaction ID to order history
    await userPurchaseDAO.addTransaction(userId, transaction._id);

    // 2) Increase total spent
    await userPurchaseDAO.increaseTotalSpent(userId, transaction.amount);

    // 3) Purchased products
    for (const item of transaction.items) {
      const commodityId = item.commodity as Types.ObjectId;

      const commodity = await commodityDAO.findCommodityById(commodityId);
      if (!commodity || !commodity.uuid) {
        continue;
      }

      // 3A: increment if exists
      const updateResult = await userPurchaseDAO.incrementExistingProduct(
        userId,
        commodity.uuid,
        item.quantity
      );

      // 3B: if product entry does NOT exist → add new
      if (updateResult.matchedCount === 0) {
        await userPurchaseDAO.addNewPurchasedProduct(
          userId,
          commodity.uuid,
          item.quantity
        );
      }
    }

    console.log('✅ Updated user purchase history for user:', userId);
  } catch (err) {
    console.error('❌ Error updating user purchase history:', err);
  }
}
